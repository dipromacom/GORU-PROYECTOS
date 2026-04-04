/**
 * IDs de tipo_licencia (tabla tipo_licencia).
 * Opcional: PLAN_PERSONAL_ID, etc. vía .env si difieren entre entornos.
 */
const PLAN_PERSONAL_ID = 2;
const PLAN_EQUIPOS_ID = 3;
const PLAN_CORPORATIVO_ID = 4;

/** Máximo de proyectos personales (modo A) con plan personal */
const MAX_PERSONAL_PROJECTS = Number(process.env.MAX_PERSONAL_PROJECTS) || 3;

/**
 * @param {number|null|undefined} tipoLicenciaId
 * @returns {string[]}
 */
function getAllowedModos(tipoLicenciaId) {
    if (tipoLicenciaId == null || tipoLicenciaId === PLAN_PERSONAL_ID) {
        return ['A'];
    }
    if (tipoLicenciaId === PLAN_EQUIPOS_ID) {
        return ['A', 'P'];
    }
    if (tipoLicenciaId === PLAN_CORPORATIVO_ID) {
        return ['A', 'P', 'PR'];
    }
    return ['A'];
}

module.exports = {
    PLAN_PERSONAL_ID,
    PLAN_EQUIPOS_ID,
    PLAN_CORPORATIVO_ID,
    MAX_PERSONAL_PROJECTS,
    getAllowedModos,
};
