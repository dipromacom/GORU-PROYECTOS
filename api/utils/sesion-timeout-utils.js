/**
 * Utils para la configuración global de timeout de sesión por inactividad.
 * Tabla singleton config_sesion_timeout (id = 1).
 */
const { ConfigSesionTimeout } = require('../models/index');

const DEFAULT_TIMEOUT_MINUTOS = 30;
const MIN_TIMEOUT = 1;
const MAX_TIMEOUT = 1440; // 24 horas

/**
 * Garantiza que exista la fila id=1.
 * Si no existe (instalaciones previas), la crea con el valor por defecto.
 */
async function ensureRow() {
    let row = await ConfigSesionTimeout.findByPk(1);
    if (!row) {
        row = await ConfigSesionTimeout.create({
            id: 1,
            timeout_minutos: DEFAULT_TIMEOUT_MINUTOS,
            fecha_actualizacion: new Date(),
        });
    }
    return row;
}

/**
 * Convierte el registro Sequelize a un objeto plano con nombres camelCase
 * que el frontend espera.
 */
function toPlain(row) {
    const p = row.get ? row.get({ plain: true }) : row;
    return {
        timeout_minutos: p.timeout_minutos,
        fechaActualizacion: p.fecha_actualizacion,
        usuarioActualizacionId: p.usuario_actualizacion_id,
    };
}

/**
 * Obtiene la configuración actual (crea la fila si no existe).
 * @returns {Promise<{timeout_minutos: number, fechaActualizacion: Date|null}>}
 */
async function getConfigPlain() {
    const row = await ensureRow();
    return toPlain(row);
}

/**
 * Valida y parsea el valor de timeout.
 * @param {*} v
 * @returns {number}
 */
function parseTimeoutMinutos(v) {
    const x = parseInt(v, 10);
    if (!Number.isFinite(x) || x < MIN_TIMEOUT || x > MAX_TIMEOUT) {
        const err = new Error(
            `El timeout debe ser un entero entre ${MIN_TIMEOUT} y ${MAX_TIMEOUT} minutos.`
        );
        err.statusCode = 400;
        throw err;
    }
    return x;
}

/**
 * Actualiza el timeout de sesión.
 * @param {{ timeout_minutos: number }} body
 * @param {number|null} [usuarioActualizacionId]
 * @returns {Promise<{timeout_minutos: number, fechaActualizacion: Date}>}
 */
async function updateConfig(body, usuarioActualizacionId) {
    const timeoutMinutos = parseTimeoutMinutos(body.timeout_minutos);
    const row = await ensureRow();
    await row.update({
        timeout_minutos: timeoutMinutos,
        fecha_actualizacion: new Date(),
        usuario_actualizacion_id: usuarioActualizacionId || null,
    });
    return getConfigPlain();
}

module.exports = {
    ensureRow,
    getConfigPlain,
    updateConfig,
    DEFAULT_TIMEOUT_MINUTOS,
    MIN_TIMEOUT,
    MAX_TIMEOUT,
};
