const {
    Interesado, Usuario, Persona, UsuarioProyecto, Proyecto,
} = require('../models/index');
const MailUtils = require('./mail-utils');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/** @typedef {'todos'|'colaboradores_todos'|'colaborador'|'interesados_todos'|'interesado'} DestinatariosModo */

function escapeMailDisplayName(name) {
    if (!name || !String(name).trim()) return 'GORU';
    return String(name).replace(/[\r\n"\\]/g, ' ').trim().slice(0, 200);
}

async function getRemitenteUsuario(usuarioId) {
    const usuario = await Usuario.findByPk(usuarioId, {
        attributes: ['id', 'username'],
        include: [{
            model: Persona,
            as: 'Persona',
            attributes: ['nombre', 'apellido'],
            required: false,
        }],
    });
    if (!usuario) return null;
    const email = (usuario.username || '').trim();
    if (!EMAIL_REGEX.test(email)) return null;
    const p = usuario.Persona;
    const display = p ? [p.nombre, p.apellido].filter(Boolean).join(' ').trim() : '';
    const fromDisplayName = escapeMailDisplayName(display || email.split('@')[0]);
    return { fromEmail: email, fromDisplayName };
}

/** @deprecated alias */
const getRemitenteInteresados = getRemitenteUsuario;

async function listDestinatariosInteresados(proyectoId, interesadoIds) {
    const pid = parseInt(proyectoId, 10);
    if (Number.isNaN(pid)) return [];
    const where = { proyecto_id: pid };
    if (Array.isArray(interesadoIds) && interesadoIds.length > 0) {
        const ids = [...new Set(interesadoIds.map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n)))];
        if (ids.length === 0) return [];
        where.id = ids;
    }
    const rows = await Interesado.findAll({
        where,
        attributes: ['id', 'email', 'nombre_interesado'],
    });
    const out = [];
    const seen = new Set();
    for (const r of rows) {
        const em = (r.email || '').trim();
        if (!EMAIL_REGEX.test(em)) continue;
        const key = em.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ email: em, nombre: r.nombre_interesado || em.split('@')[0] });
    }
    return out;
}

/**
 * Colaboradores = filas en usuario_proyecto + creador del proyecto si no está asignado.
 * @returns {{ usuario_id: number, email: string, nombre: string }[]}
 */
async function getMiembrosProyectoConEmail(proyectoId) {
    const pid = parseInt(proyectoId, 10);
    if (Number.isNaN(pid)) return [];
    const proyecto = await Proyecto.findByPk(pid, { attributes: ['id', 'usuario_creador'] });
    if (!proyecto) return [];

    const rows = await UsuarioProyecto.findAll({
        where: { proyecto_id: pid },
        include: [{
            model: Usuario,
            as: 'Usuario',
            attributes: ['id', 'username'],
            include: [{
                model: Persona,
                as: 'Persona',
                attributes: ['nombre', 'apellido'],
                required: false,
            }],
        }],
    });

    const byUid = new Map();
    for (const up of rows) {
        const u = up.Usuario;
        if (!u) continue;
        const email = (u.username || '').trim();
        if (!EMAIL_REGEX.test(email)) continue;
        const p = u.Persona;
        const nombre = p ? [p.nombre, p.apellido].filter(Boolean).join(' ').trim() : '';
        byUid.set(u.id, {
            usuario_id: u.id,
            email,
            nombre: nombre || email.split('@')[0],
        });
    }

    const creadorId = proyecto.usuario_creador != null
        ? parseInt(proyecto.usuario_creador, 10)
        : null;
    if (creadorId != null && !Number.isNaN(creadorId) && !byUid.has(creadorId)) {
        const u = await Usuario.findByPk(creadorId, {
            attributes: ['id', 'username'],
            include: [{
                model: Persona,
                as: 'Persona',
                attributes: ['nombre', 'apellido'],
                required: false,
            }],
        });
        if (u) {
            const email = (u.username || '').trim();
            if (EMAIL_REGEX.test(email)) {
                const p = u.Persona;
                const nombre = p ? [p.nombre, p.apellido].filter(Boolean).join(' ').trim() : '';
                byUid.set(u.id, {
                    usuario_id: u.id,
                    email,
                    nombre: nombre || email.split('@')[0],
                });
            }
        }
    }

    return [...byUid.values()];
}

/**
 * @param {number|string} proyectoId
 * @param {number[]|undefined} usuarioIdsOpt Si se indica, solo esos usuarios (deben ser miembros del proyecto).
 */
async function listDestinatariosColaboradores(proyectoId, usuarioIdsOpt) {
    const all = await getMiembrosProyectoConEmail(proyectoId);
    if (!Array.isArray(usuarioIdsOpt) || usuarioIdsOpt.length === 0) {
        return all.map(({ email, nombre }) => ({ email, nombre }));
    }
    const wanted = new Set(
        usuarioIdsOpt.map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n)),
    );
    const filtered = all.filter((m) => wanted.has(m.usuario_id));
    if (filtered.length !== wanted.size) {
        const e = new Error('Uno o más usuarios no son colaboradores de este proyecto o no tienen correo válido.');
        e.statusCode = 400;
        throw e;
    }
    return filtered.map(({ email, nombre }) => ({ email, nombre }));
}

function mergeDestinatariosUnicosPorEmail(listas) {
    const map = new Map();
    for (const lista of listas) {
        for (const d of lista) {
            const em = (d.email || '').trim();
            if (!EMAIL_REGEX.test(em)) continue;
            const key = em.toLowerCase();
            if (!map.has(key)) {
                map.set(key, { email: em, nombre: d.nombre || em.split('@')[0] });
            }
        }
    }
    return [...map.values()];
}

/**
 * @param {{ usuarioId: number, proyectoId: string|number, asunto: string, mensaje: string, destinatariosModo: DestinatariosModo, interesadoIds?: number[], colaboradorUsuarioIds?: number[] }} params
 */
async function enviarCorreosProyecto(params) {
    const {
        usuarioId,
        proyectoId,
        asunto,
        mensaje,
        destinatariosModo,
        interesadoIds,
        colaboradorUsuarioIds,
    } = params;

    const remitente = await getRemitenteUsuario(usuarioId);
    if (!remitente) {
        const e = new Error('Su cuenta no tiene un correo válido como nombre de usuario. No se puede enviar con usted como remitente.');
        e.statusCode = 400;
        throw e;
    }

    let destinatarios = [];

    switch (destinatariosModo) {
        case 'todos': {
            const inter = await listDestinatariosInteresados(proyectoId, undefined);
            const col = await listDestinatariosColaboradores(proyectoId, undefined);
            destinatarios = mergeDestinatariosUnicosPorEmail([inter, col]);
            break;
        }
        case 'colaboradores_todos':
            destinatarios = await listDestinatariosColaboradores(proyectoId, undefined);
            break;
        case 'colaborador':
            destinatarios = await listDestinatariosColaboradores(proyectoId, colaboradorUsuarioIds);
            break;
        case 'interesados_todos':
            destinatarios = await listDestinatariosInteresados(proyectoId, undefined);
            break;
        case 'interesado':
            destinatarios = await listDestinatariosInteresados(proyectoId, interesadoIds);
            break;
        default: {
            const e = new Error('Modo de destinatarios no válido.');
            e.statusCode = 400;
            throw e;
        }
    }

    if (destinatarios.length === 0) {
        const e = new Error(mensajeVacioDestinatarios(destinatariosModo, interesadoIds, colaboradorUsuarioIds));
        e.statusCode = 400;
        throw e;
    }

    let sent = 0;
    const errors = [];
    for (const d of destinatarios) {
        try {
            await MailUtils.enviarMail(d.email, asunto, mensaje, remitente);
            sent += 1;
        } catch (err) {
            errors.push({ email: d.email, message: err.message });
        }
    }
    return { sent, total: destinatarios.length, errors };
}

function mensajeVacioDestinatarios(modo, interesadoIds, colaboradorUsuarioIds) {
    if (modo === 'interesado') {
        return 'No se encontraron interesados seleccionados con correo válido en este proyecto.';
    }
    if (modo === 'colaborador') {
        return 'No se pudo enviar al colaborador indicado (correo no válido o no pertenece al proyecto).';
    }
    if (modo === 'colaboradores_todos') {
        return 'No hay colaboradores del proyecto con correo electrónico válido.';
    }
    if (modo === 'interesados_todos') {
        return 'No hay interesados con correo electrónico válido en este proyecto.';
    }
    if (modo === 'todos') {
        return 'No hay destinatarios con correo válido entre colaboradores e interesados de este proyecto.';
    }
    return 'No hay destinatarios con correo electrónico válido.';
}

module.exports = {
    EMAIL_REGEX,
    getRemitenteUsuario,
    getRemitenteInteresados,
    listDestinatariosInteresados,
    listDestinatariosColaboradores,
    getMiembrosProyectoConEmail,
    mergeDestinatariosUnicosPorEmail,
    enviarCorreosProyecto,
};
