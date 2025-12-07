// utils/log-service.js
const { Log } = require('../models/index'); // Asegúrate de tener el modelo Log

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

module.exports = {
    saveLog,
};