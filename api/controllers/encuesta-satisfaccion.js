const path = require('path');
const EncuestaUtils = require('../utils/encuesta-satisfaccion-utils');
const { decodeToken } = require('../utils/security-utils');
const logger = require('../logger/logger');

const file = path.basename(__filename);

/**
 * Verifica si el usuario debe ver la encuesta al abrir un proyecto cerrado
 */
const verificarEstadoEncuesta = async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);

        const encuesta = await EncuestaUtils.getEncuestaByProyectoUsuario(
            parseInt(proyectoId),
            usuarioId
        );

        // Si no hay encuesta, debe mostrar el modal
        // Si está completada o rechazada, no mostrar
        const debeVerEncuesta = !encuesta || (!encuesta.completada && !encuesta.rechazada);

        return res.status(200).json({
            success: true,
            data: {
                debeVerEncuesta,
                encuesta: encuesta || null
            }
        });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "verificarEstadoEncuesta()",
            params: req.params
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Obtiene todas las encuestas de un proyecto (para estadísticas)
 */
const getEncuestasProyecto = async (req, res) => {
    try {
        const { proyectoId } = req.params;

        const encuestas = await EncuestaUtils.getEncuestasByProyecto(parseInt(proyectoId));
        const estadisticas = await EncuestaUtils.getEstadisticasEncuesta(parseInt(proyectoId));

        return res.status(200).json({
            success: true,
            data: {
                encuestas,
                estadisticas
            }
        });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getEncuestasProyecto()",
            params: req.params
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Crea o actualiza una encuesta de satisfacción
 */
const guardarEncuesta = async (req, res) => {
    try {
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const data = req.body;

        if (!data.proyectoId) {
            return res.status(400).json({
                success: false,
                message: 'El proyectoId es requerido'
            });
        }

        const encuesta = await EncuestaUtils.createOrUpdateEncuesta(data, usuarioId);

        return res.status(201).json({ success: true, data: encuesta });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "guardarEncuesta()",
            params: req.body
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Rechaza la encuesta (usuario no quiere responder)
 */
const rechazarEncuesta = async (req, res) => {
    try {
        const { proyectoId } = req.body;
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);

        if (!proyectoId) {
            return res.status(400).json({
                success: false,
                message: 'El proyectoId es requerido'
            });
        }

        const encuesta = await EncuestaUtils.rechazarEncuesta(
            parseInt(proyectoId),
            usuarioId
        );

        return res.status(200).json({ success: true, data: encuesta });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "rechazarEncuesta()",
            params: req.body
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllEncuestasProyecto = async (req, res) => {
    try {
        const { proyectoId } = req.params;


        const encuestas = await EncuestaUtils.getAllEncuestasByProyecto(parseInt(proyectoId));
        const estadisticas = await EncuestaUtils.getEstadisticasEncuesta(parseInt(proyectoId));

        return res.status(200).json({
            success: true,
            data: {
                encuestas,
                estadisticas
            }
        });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getAllEncuestasProyecto()",
            params: req.params
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    verificarEstadoEncuesta,
    getEncuestasProyecto,
    guardarEncuesta,
    getAllEncuestasProyecto,
    rechazarEncuesta
};