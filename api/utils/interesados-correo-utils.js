const {
    Interesado, Usuario, Persona, UsuarioProyecto, Proyecto,
} = require('../models/index');
const MailUtils = require('./mail-utils');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MAX_CORREOS_DESTINATARIOS = 100;

/** @typedef {'todos'|'uno'|'varios'} DestinatariosModoCorreo */

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
 * Lista unificada (equipo + interesados) para UI y envío "a todos".
 * @returns {Promise<{ email: string, nombre: string, origen: 'equipo'|'interesado' }[]>}
 */
async function listDestinatariosCorreoProyecto(proyectoId) {
    const inter = await listDestinatariosInteresados(proyectoId, undefined);
    const colRows = await getMiembrosProyectoConEmail(proyectoId);
    const map = new Map();
    for (const c of colRows) {
        const k = c.email.toLowerCase();
        if (!EMAIL_REGEX.test(c.email)) continue;
        if (!map.has(k)) {
            map.set(k, { email: c.email.trim(), nombre: c.nombre, origen: 'equipo' });
        }
    }
    for (const i of inter) {
        const k = i.email.toLowerCase();
        map.set(k, { email: i.email.trim(), nombre: i.nombre, origen: 'interesado' });
    }
    return [...map.values()];
}

/**
 * @param {unknown[]} raw
 * @returns {{ email: string, nombre: string }[]}
 */
function normalizarListaCorreosManual(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    const seen = new Set();
    for (const item of raw) {
        const em = String(item || '').trim();
        if (!EMAIL_REGEX.test(em)) continue;
        const k = em.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ email: em, nombre: em.split('@')[0] });
        if (out.length >= MAX_CORREOS_DESTINATARIOS) break;
    }
    return out;
}

/**
 * @param {{ usuarioId: number, proyectoId: string|number, asunto: string, mensaje: string, destinatariosModo: DestinatariosModoCorreo, destinatariosEmails?: string[] }} params
 */
async function enviarCorreosProyecto(params) {
    const {
        usuarioId,
        proyectoId,
        asunto,
        mensaje,
        destinatariosModo,
        destinatariosEmails,
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
        case 'uno':
        case 'varios': {
            destinatarios = normalizarListaCorreosManual(destinatariosEmails || []);
            break;
        }
        default: {
            const e = new Error('Modo de destinatarios no válido.');
            e.statusCode = 400;
            throw e;
        }
    }

    if (destinatarios.length === 0) {
        const e = new Error(mensajeVacioDestinatarios(destinatariosModo));
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

function mensajeVacioDestinatarios(modo) {
    if (modo === 'uno') {
        return 'Indique un correo de destinatario válido.';
    }
    if (modo === 'varios') {
        return 'Indique al menos dos correos distintos (selección y/o campo Para).';
    }
    if (modo === 'todos') {
        return 'No hay nadie en el proyecto con correo electrónico válido (equipo e interesados).';
    }
    return 'No hay destinatarios con correo electrónico válido.';
}

module.exports = {
    EMAIL_REGEX,
    MAX_CORREOS_DESTINATARIOS,
    getRemitenteUsuario,
    getRemitenteInteresados,
    listDestinatariosInteresados,
    listDestinatariosColaboradores,
    getMiembrosProyectoConEmail,
    mergeDestinatariosUnicosPorEmail,
    listDestinatariosCorreoProyecto,
    normalizarListaCorreosManual,
    enviarCorreosProyecto,
};
