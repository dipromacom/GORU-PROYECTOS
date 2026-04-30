const { ConfigColaboradoresProyecto } = require('../models/index');

const DEFAULTS = {
    max_colaboradores_personal: 2,
    max_colaboradores_equipo: 30,
    max_colaboradores_programa: 100,
};

/**
 * Garantiza la fila id=1 (para instalaciones que aún no ejecutaron el SQL).
 */
async function ensureRow() {
    let row = await ConfigColaboradoresProyecto.findByPk(1);
    if (!row) {
        row = await ConfigColaboradoresProyecto.create({
            id: 1,
            ...DEFAULTS,
            fecha_actualizacion: new Date(),
        });
    }
    return row;
}

function toPlain(row) {
    const p = row.get ? row.get({ plain: true }) : row;
    return {
        maxColaboradoresPersonal: p.max_colaboradores_personal,
        maxColaboradoresEquipo: p.max_colaboradores_equipo,
        maxColaboradoresPrograma: p.max_colaboradores_programa,
        fechaActualizacion: p.fecha_actualizacion,
    };
}

async function getConfigPlain() {
    const row = await ensureRow();
    return toPlain(row);
}

/**
 * @param {string} modo Proyecto.modo: 'A' | 'P' | 'PR'
 */
function getMaxColaboradoresForModo(modo, plain) {
    if (modo === 'A') return plain.maxColaboradoresPersonal;
    if (modo === 'PR') return plain.maxColaboradoresPrograma;
    return plain.maxColaboradoresEquipo;
}

function parseLimit(v) {
    const x = parseInt(v, 10);
    if (!Number.isFinite(x) || x < 0) {
        const err = new Error('Los límites deben ser números enteros mayores o iguales a 0.');
        err.statusCode = 400;
        throw err;
    }
    return Math.min(x, 9999);
}

/**
 * @param {{ max_colaboradores_personal: number, max_colaboradores_equipo: number, max_colaboradores_programa: number }} body
 * @param {number} [usuarioActualizacionId]
 */
async function updateConfig(body, usuarioActualizacionId) {
    const row = await ensureRow();
    await row.update({
        max_colaboradores_personal: parseLimit(body.max_colaboradores_personal),
        max_colaboradores_equipo: parseLimit(body.max_colaboradores_equipo),
        max_colaboradores_programa: parseLimit(body.max_colaboradores_programa),
        fecha_actualizacion: new Date(),
        usuario_actualizacion_id: usuarioActualizacionId || null,
    });
    return getConfigPlain();
}

module.exports = {
    ensureRow,
    getConfigPlain,
    getMaxColaboradoresForModo,
    updateConfig,
    DEFAULTS,
};
