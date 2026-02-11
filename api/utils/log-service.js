// utils/log-service.js
const { Log, Usuario, Persona } = require('../models/index');

/**
 * Guarda un registro de auditoría en la base de datos.
 * @param {object} logData - Datos del log.
 * @param {number} logData.userId - ID del usuario que realizó la acción.
 * @param {string} logData.actionType - Tipo de acción (ej: 'USER_CREATED', 'TASK_MOVED').
 * @param {string} logData.resourceType - Tipo de recurso afectado (ej: 'Usuario', 'Task').
 * @param {number | string} [logData.resourceId] - ID del recurso afectado.
 * @param {object} [logData.details] - Objeto JSON con detalles del cambio (old/new values).
 */
const saveLog = async ({ userId, actionType, resourceType, resourceId, details = {} }) => {
    // Si resourceId no es un número válido, lo establecemos en NULL
    const finalResourceId = resourceId && !isNaN(parseInt(resourceId, 10)) ? parseInt(resourceId, 10) : null;

    try {
        await Log.create({
            user_id: userId,
            action_type: actionType,
            resource_type: resourceType,
            resource_id: finalResourceId,
            details: details,
            // El campo timestamp se establece automáticamente por el DEFAULT en la DB
        });
    } catch (error) {
        // Importante: No queremos que un fallo en el logging rompa la operación principal.
        // Solo registramos el error en el logger de la aplicación.
        console.error('Error al intentar guardar el log de auditoría:', error.message);
        // Aquí podrías usar tu logger actual: logger.error({ message: `Fallo al registrar log: ${error.message}` });
    }
};

/**
 * @param {number} proyectoId 
 */
const getProjectStatusHistory = async (proyectoId) => {
    try {
        const history = await Log.findAll({
            where: {
                resource_type: 'Proyecto',
                resource_id: proyectoId,
                action_type: 'PROJECT_STATUS_CHANGED'
            },
            include: [
                {
                    model: Usuario,
                    as: 'Usuario', // Asegúrate de que el alias coincida con tu modelo Log
                    attributes: ['id', 'username'],
                    include: {
                        model: Persona,
                        as: 'Persona',
                        attributes: ['nombre', 'apellido']
                    }
                }
            ],
            order: [['timestamp', 'DESC']] // El más reciente primero
        });

        return history;
    } catch (error) {
        console.error('Error al obtener el historial de estados:', error.message);
        throw error;
    }
};

module.exports = {
    saveLog,
    getProjectStatusHistory
};