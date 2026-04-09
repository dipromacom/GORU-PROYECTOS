const { Usuario, Proyecto } = require('../models/index');
const {
    PLAN_PERSONAL_ID,
    PLAN_CORPORATIVO_ID,
    getAllowedModos,
    MAX_PERSONAL_PROJECTS,
} = require('../constants/plan-licencia');

/**
 * @param {number} usuarioId
 * @returns {Promise<number|null>}
 */
async function getTipoLicenciaIdUsuario(usuarioId) {
    const u = await Usuario.findByPk(usuarioId, { attributes: ['tipo_licencia'] });
    if (!u) {
        const err = new Error('Usuario no encontrado');
        err.statusCode = 404;
        throw err;
    }
    return u.tipo_licencia;
}

/**
 * @param {number|null|undefined} tipoLicenciaId
 * @param {string} modo
 */
function assertModoPermitidoParaPlan(tipoLicenciaId, modo) {
    if (!modo) {
        const err = new Error('El modo del proyecto es obligatorio.');
        err.statusCode = 400;
        throw err;
    }
    const allowed = getAllowedModos(tipoLicenciaId);
    if (!allowed.includes(modo)) {
        const err = new Error('Su plan no permite crear ni usar proyectos de este tipo.');
        err.statusCode = 403;
        throw err;
    }
}

/**
 * Validación previa a crear un proyecto (modo + tope 10 en plan personal).
 * @param {number} usuarioId
 * @param {string} modo
 */
async function assertUsuarioPuedeCrearProyecto(usuarioId, modo) {
    const tid = await getTipoLicenciaIdUsuario(usuarioId);
    assertModoPermitidoParaPlan(tid, modo);

    if (modo === 'A' && tid === PLAN_PERSONAL_ID) {
        const count = await Proyecto.count({
            where: {
                usuario_creador: usuarioId,
                modo: 'A',
                activo: true,
            },
        });
        if (count >= MAX_PERSONAL_PROJECTS) {
            const err = new Error(
                `Ha alcanzado el límite de ${MAX_PERSONAL_PROJECTS} proyectos personales para su plan.`
            );
            err.statusCode = 403;
            throw err;
        }
    }
}

/**
 * @param {number} usuarioId
 */
async function assertUsuarioPlanCorporativo(usuarioId) {
    const tid = await getTipoLicenciaIdUsuario(usuarioId);
    if (tid !== PLAN_CORPORATIVO_ID) {
        const err = new Error('Su plan no incluye programas corporativos.');
        err.statusCode = 403;
        throw err;
    }
}

/**
 * Vincular proyecto a programa (programa_id no nulo) solo plan corporativo.
 * @param {number} usuarioId
 * @param {*} programaId - null/undefined omitido
 */
async function assertPuedeAsignarProgramaId(usuarioId, programaId) {
    if (programaId === undefined || programaId === null || programaId === '') {
        return;
    }
    const tid = await getTipoLicenciaIdUsuario(usuarioId);
    if (tid !== PLAN_CORPORATIVO_ID) {
        const err = new Error('Solo el plan corporativo puede vincular proyectos a un programa.');
        err.statusCode = 403;
        throw err;
    }
}

/**
 * @param {number} usuarioId
 * @param {string} [modo] - si viene en PATCH
 */
async function assertUsuarioPuedeUsarModoEnActualizacion(usuarioId, modo) {
    if (modo === undefined || modo === null) return;
    const tid = await getTipoLicenciaIdUsuario(usuarioId);
    assertModoPermitidoParaPlan(tid, modo);
}

module.exports = {
    getTipoLicenciaIdUsuario,
    assertModoPermitidoParaPlan,
    assertUsuarioPuedeCrearProyecto,
    assertUsuarioPlanCorporativo,
    assertPuedeAsignarProgramaId,
    assertUsuarioPuedeUsarModoEnActualizacion,
};
