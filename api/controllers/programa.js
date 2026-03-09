/* eslint-disable no-unused-vars */
const ProgramaUtils = require('../utils/programa-utils');
const { decodeToken } = require('../utils/security-utils');

/**
 * GET /proyecto/:id/programa/proyectos
 * Retorna todos los proyectos que pertenecen a este programa.
 */
const getProyectosDelPrograma = async (req, res) => {
    try {
        const { id: programaId } = req.params;
        const proyectos = await ProgramaUtils.getProyectosByPrograma(programaId);
        return res.status(200).json({ success: true, data: proyectos });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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

        const proyectos = await ProgramaUtils.getProyectosDisponiblesParaPrograma(
            programaId,
            usuarioId
        );
        return res.status(200).json({ success: true, data: proyectos });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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

        if (!proyectoId) {
            return res.status(400).json({ success: false, message: 'El campo proyectoId es obligatorio.' });
        }

        const proyecto = await ProgramaUtils.asignarProyectoAPrograma(
            programaId,
            proyectoId,
            usuarioId
        );
        return res.status(200).json({ success: true, data: proyecto });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
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

        const proyecto = await ProgramaUtils.desasignarProyectoDePrograma(
            proyectoId,
            usuarioId
        );
        return res.status(200).json({ success: true, data: proyecto });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProyectosDelPrograma,
    getProyectosDisponibles,
    asignarProyecto,
    desasignarProyecto,
};