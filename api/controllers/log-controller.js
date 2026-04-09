// controllers/log-controller.js
const LogUtils = require('../utils/log-service');
const path = require('path');
const file = path.basename(__filename);
const logger = require('../logger/logger');
const { decodeToken } = require('../utils/security-utils');
const PermisoProyectoUtils = require('../utils/permiso-proyecto-utils');
const { P } = PermisoProyectoUtils;

const getHistorialEstados = async (req, res) => {
    try {
        const { proyectoId } = req.params;

        if (!proyectoId) {
            return res.status(400).json({
                success: false,
                message: 'El ID del proyecto es requerido'
            });
        }

        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, proyectoId, P.HISTORIAL_VER);
        if (!ok) return;

        const historial = await LogUtils.getProjectStatusHistory(parseInt(proyectoId));

        // Mapeamos los datos para que el frontend los reciba limpios
        const dataFormatted = historial.map(log => ({
            id: log.id,
            fecha: log.timestamp,
            usuario: (log.Usuario && log.Usuario.Persona)
                ? (log.Usuario.Persona.nombre || 'Sistema') + ' ' + (log.Usuario.Persona.apellido || '')
                : 'Sistema',
            estadoAnterior: (log.details && log.details.status && log.details.status.old) || 'N/A',
            estadoNuevo: (log.details && log.details.status && log.details.status.new) || 'N/A'
        }));

        return res.status(200).json({
            success: true,
            data: dataFormatted
        });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getHistorialEstados()",
            params: req.params
        });
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de cambios'
        });
    }
};

module.exports = {
    getHistorialEstados
};