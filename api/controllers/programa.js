/* eslint-disable no-unused-vars */
const ProgramaUtils = require('../utils/programa-utils');
const PlanLicenciaUtils = require('../utils/plan-licencia-utils');
const { decodeToken } = require('../utils/security-utils');
const PermisoProyectoUtils = require('../utils/permiso-proyecto-utils');
const { P } = PermisoProyectoUtils;

const httpErrorStatus = (error, fallback = 500) => (
    error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : fallback
);

/**
 * GET /proyecto/:id/programa/proyectos
 * Retorna todos los proyectos que pertenecen a este programa.
 */
const getProyectosDelPrograma = async (req, res) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        const { id: usuarioId } = decodeToken(authorization);
        await PlanLicenciaUtils.assertUsuarioPlanCorporativo(usuarioId);

        const { id: programaId } = req.params;
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, programaId, P.PROGRAMA_PROYECTOS_VER);
        if (!ok) return;

        const proyectos = await ProgramaUtils.getProyectosByPrograma(programaId);
        return res.status(200).json({ success: true, data: proyectos });
    } catch (error) {
        return res.status(httpErrorStatus(error)).json({ success: false, message: error.message });
    }
};

/**
 * GET /proyecto/:id/programa/disponibles
 * Retorna los proyectos del usuario que pueden ser añadidos al programa
 * (sin programa asignado aún, y que no sean PR).
 */
const getProyectosDisponibles = async (req, res) => {
    try {
        const { id: programaId } = req.params;
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        await PlanLicenciaUtils.assertUsuarioPlanCorporativo(usuarioId);

        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, programaId, P.PROGRAMA_PROYECTOS_VER);
        if (!ok) return;

        const proyectos = await ProgramaUtils.getProyectosDisponiblesParaPrograma(
            programaId,
            usuarioId
        );
        return res.status(200).json({ success: true, data: proyectos });
    } catch (error) {
        return res.status(httpErrorStatus(error)).json({ success: false, message: error.message });
    }
};

/**
 * POST /proyecto/:id/programa/asignar
 * Body: { proyectoId }
 * Asigna un proyecto al programa.
 */
const asignarProyecto = async (req, res) => {
    try {
        const { id: programaId } = req.params;
        const { proyectoId } = req.body;
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        await PlanLicenciaUtils.assertUsuarioPlanCorporativo(usuarioId);

        if (!proyectoId) {
            return res.status(400).json({ success: false, message: 'El campo proyectoId es obligatorio.' });
        }

        const okProg = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, programaId, P.PROGRAMA_VINCULAR);
        if (!okProg) return;
        const okProy = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, proyectoId, P.PROGRAMA_VINCULAR);
        if (!okProy) return;

        const proyecto = await ProgramaUtils.asignarProyectoAPrograma(
            programaId,
            proyectoId,
            usuarioId
        );
        return res.status(200).json({ success: true, data: proyecto });
    } catch (error) {
        return res.status(httpErrorStatus(error, 400)).json({ success: false, message: error.message });
    }
};

/**
 * DELETE /proyecto/:proyectoId/programa
 * Desasigna un proyecto de su programa actual.
 */
const desasignarProyecto = async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        await PlanLicenciaUtils.assertUsuarioPlanCorporativo(usuarioId);

        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, proyectoId, P.PROGRAMA_VINCULAR);
        if (!ok) return;

        const proyecto = await ProgramaUtils.desasignarProyectoDePrograma(
            proyectoId,
            usuarioId
        );
        return res.status(200).json({ success: true, data: proyecto });
    } catch (error) {
        return res.status(httpErrorStatus(error, 400)).json({ success: false, message: error.message });
    }
};

/**
 * GET /proyecto/programas/lista
 * Retorna todos los programas (PR) accesibles por el usuario autenticado.
 * Para poblar el combobox "Programa" en el acta de constitución.
 */
const getProgramasByUsuario = async (req, res) => {
    try {
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        await PlanLicenciaUtils.assertUsuarioPlanCorporativo(usuarioId);

        const programas = await ProgramaUtils.getProgramasByUsuario(usuarioId);
        return res.status(200).json({ success: true, data: programas });
    } catch (error) {
        return res.status(httpErrorStatus(error)).json({ success: false, message: error.message });
    }
};

/**
 * GET /proyecto/:id/programa/resumen-agregado
 * Retorna el resumen agregado de ejecución de todos los proyectos hijos del programa.
 */
const getResumenAgregadoPrograma = async (req, res) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        const { id: usuarioId } = decodeToken(authorization);
        await PlanLicenciaUtils.assertUsuarioPlanCorporativo(usuarioId);

        const { id: programaId } = req.params;
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, programaId, P.PROGRAMA_PROYECTOS_VER);
        if (!ok) return;

        const resumen = await ProgramaUtils.getResumenAgregadoPrograma(programaId);
        return res.status(200).json({ success: true, data: resumen });
    } catch (error) {
        return res.status(httpErrorStatus(error)).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProyectosDelPrograma,
    getProyectosDisponibles,
    asignarProyecto,
    desasignarProyecto,
    getProgramasByUsuario,
    getResumenAgregadoPrograma,
};