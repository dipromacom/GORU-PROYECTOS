const { Proyecto, UsuarioProyecto, RolProyecto, PermisoProyecto } = require('../models/index');
const { decodeToken } = require('./security-utils');

/**
 * Claves alineadas con permiso_proyecto.nombre en BD.
 * Si en BD usan otros nombres, actualizar aquí y en front/src/libs/proyectoPermiso.js
 */
const P = {
    PROYECTO_CONFIG_VER: 'proyecto_configuracion_ver',
    PROYECTO_CONFIG_GEST: 'proyecto_configuracion_gestionar',
    PROYECTO_MIEMBROS_VER: 'proyecto_miembros_ver',
    PROYECTO_MIEMBROS_GEST: 'proyecto_miembros_gestionar',
    CONSTITUCION_VER: 'constitucion_ver',
    CONSTITUCION_GEST: 'constitucion_gestionar',
    INTERESADOS_VER: 'interesados_ver',
    INTERESADOS_GEST: 'interesados_gestionar',
    ANALISIS_AMBIENTAL_VER: 'analisis_ambiental_ver',
    ANALISIS_AMBIENTAL_GEST: 'analisis_ambiental_gestionar',
    ALCANCE_VER: 'alcance_ver',
    ALCANCE_GEST: 'alcance_gestionar',
    HITOS_VER: 'hitos_ver',
    HITOS_GEST: 'hitos_gestionar',
    COSTOS_VER: 'costos_ver',
    COSTOS_GEST: 'costos_gestionar',
    CALIDAD_VER: 'calidad_ver',
    CALIDAD_GEST: 'calidad_gestionar',
    RIESGOS_VER: 'riesgos_ver',
    RIESGOS_GEST: 'riesgos_gestionar',
    GANTT_VER: 'gantt_ver',
    GANTT_GEST: 'gantt_gestionar',
    TODO_VER: 'todo_ver',
    TODO_GEST: 'todo_gestionar',
    KANBAN_VER: 'kanban_ver',
    KANBAN_GEST: 'kanban_gestionar',
    PIZARRA_VER: 'pizarra_ver',
    PIZARRA_GEST: 'pizarra_gestionar',
    BENEFICIOS_VER: 'beneficios_ver',
    BENEFICIOS_GEST: 'beneficios_gestionar',
    PROGRAMA_PROYECTOS_VER: 'programa_proyectos_ver',
    PROGRAMA_VINCULAR: 'programa_vincular',
    LECCIONES_VER: 'lecciones_aprendidas_ver',
    LECCIONES_GEST: 'lecciones_aprendidas_gestionar',
    ENCUESTAS_VER: 'encuestas_ver',
    ENCUESTAS_GEST: 'encuestas_gestionar',
    INFORMES_VER: 'informes_ver',
    INFORMES_GEST: 'informes_gestionar',
    CONTROL_CAMBIO_VER: 'control_cambio_ver',
    CONTROL_CAMBIO_GEST: 'control_cambio_gestionar',
    HISTORIAL_VER: 'historial_ver',
};

function usuarioTienePermiso(nombres, claveRequerida) {
    if (!claveRequerida) return true;
    if (!nombres || nombres.length === 0) return false;
    const set = new Set(nombres);
    if (set.has(claveRequerida)) return true;
    if (claveRequerida.endsWith('_ver')) {
        const gestionar = claveRequerida.replace(/_ver$/, '_gestionar');
        if (set.has(gestionar)) return true;
    }
    return false;
}

/**
 * @returns {Promise<{ ok: true, nombres: string[] } | { ok: false, reason: 'not_found'|'forbidden' }>}
 */
async function getNombresPermisoUsuarioProyecto(usuarioId, proyectoId) {
    const pid = parseInt(proyectoId, 10);
    const uid = parseInt(usuarioId, 10);
    if (Number.isNaN(pid) || Number.isNaN(uid)) {
        return { ok: false, reason: 'not_found' };
    }

    const proyecto = await Proyecto.findByPk(pid, { attributes: ['id', 'usuario_creador'] });
    if (!proyecto) return { ok: false, reason: 'not_found' };

    if (Number(proyecto.usuario_creador) === uid) {
        const permisos = await PermisoProyecto.findAll({ attributes: ['nombre'] });
        return { ok: true, nombres: permisos.map((p) => p.nombre) };
    }

    const usuarioProyecto = await UsuarioProyecto.findOne({
        where: { usuario_id: uid, proyecto_id: pid },
        include: [{
            model: RolProyecto,
            as: 'RolProyecto',
            include: [{ model: PermisoProyecto, as: 'PermisosProyecto', through: { attributes: [] } }],
        }],
    });

    if (!usuarioProyecto || !usuarioProyecto.RolProyecto) {
        return { ok: false, reason: 'forbidden' };
    }

    const nombres = (usuarioProyecto.RolProyecto.PermisosProyecto || []).map((p) => p.nombre);
    return { ok: true, nombres };
}

async function esMiembroProyecto(usuarioId, proyectoId) {
    const pid = parseInt(proyectoId, 10);
    const uid = parseInt(usuarioId, 10);
    if (Number.isNaN(pid) || Number.isNaN(uid)) return false;

    const proyecto = await Proyecto.findByPk(pid, { attributes: ['id', 'usuario_creador'] });
    if (!proyecto) return false;
    if (Number(proyecto.usuario_creador) === uid) return true;

    const n = await UsuarioProyecto.count({ where: { usuario_id: uid, proyecto_id: pid } });
    return n > 0;
}

function getUsuarioIdFromReq(req) {
    const { authorization } = req.headers;
    if (!authorization) return null;
    try {
        return decodeToken(authorization).id;
    } catch {
        return null;
    }
}

/**
 * Creador o fila en usuario_proyecto (sin comprobar permisos concretos).
 */
async function assertMiembroProyecto(res, usuarioId, proyectoId) {
    if (usuarioId == null) {
        res.status(401).json({ success: false, message: 'No autorizado' });
        return false;
    }
    const pid = parseInt(proyectoId, 10);
    if (Number.isNaN(pid)) {
        res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
        return false;
    }
    const existe = await Proyecto.findByPk(pid, { attributes: ['id'] });
    if (!existe) {
        res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
        return false;
    }
    const miembro = await esMiembroProyecto(usuarioId, proyectoId);
    if (!miembro) {
        res.status(403).json({ success: false, message: 'No tiene acceso a este proyecto.' });
        return false;
    }
    return true;
}

/**
 * Miembro + permiso (gestionar implica ver para claves *_ver).
 */
async function assertPermisoProyecto(res, usuarioId, proyectoId, permisoClave) {
    if (usuarioId == null) {
        res.status(401).json({ success: false, message: 'No autorizado' });
        return false;
    }
    const ctx = await getNombresPermisoUsuarioProyecto(usuarioId, proyectoId);
    if (!ctx.ok) {
        if (ctx.reason === 'not_found') {
            res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
        } else {
            res.status(403).json({ success: false, message: 'No tiene acceso a este proyecto.' });
        }
        return false;
    }
    if (!usuarioTienePermiso(ctx.nombres, permisoClave)) {
        res.status(403).json({ success: false, message: 'No tiene permiso para esta acción.' });
        return false;
    }
    return true;
}

module.exports = {
    P,
    usuarioTienePermiso,
    getNombresPermisoUsuarioProyecto,
    esMiembroProyecto,
    getUsuarioIdFromReq,
    assertMiembroProyecto,
    assertPermisoProyecto,
};
