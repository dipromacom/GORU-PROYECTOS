const { Op } = require('sequelize');
const db = require('../db')
const { GanttTask } = require('../models/index');
const path = require('path');
const file = path.basename(__filename);
const logger = require('../logger/logger');

const setGantt = async ({ task, projectId }) => {
    // Recibe solo 1 tarea
    const transaction = await db.transaction();
    try {
        await GanttTask.upsert({
            id: task.id,
            project_id: parseInt(projectId),
            name: task.name,
            description: task.description || null,
            start_date: task.start_date,
            end_date: task.end_date,
            progress: task.progress || 0,
            dependencies: task.dependencies || [],
            interesados_id: task.interesados_id || [],
            status: task.status || 'pending',
            updated_at: new Date()
        }, { transaction });

        await transaction.commit();
        return true;
    } catch (e) {
        logger.error({
            message: e.message,
            source: file,
            method: "setGantt()",
            params: { task, projectId }
        });
        await transaction.rollback();
        throw e;
    }
}

const getGantt = async ({ projectId }) => {
    try {
        const tasks = await GanttTask.findAll({
            where: {
                project_id: parseInt(projectId)
            },
            attributes: [
                'id', 'name', 'description', 'start_date', 'end_date',
                'progress', 'status', 'dependencies', 'interesados_id'
            ],
            order: [['start_date', 'ASC']]
        })
        return tasks
    } catch (e) {
        logger.error({
            message: e.message,
            source: file,
            method: "getGantt()",
            params: { projectId }
        });
        throw e;
    }
}


const deleteGantt = async ({ projectId, taskId }) => {
    const transaction = await db.transaction();
    try {
        const result = await GanttTask.destroy({
            where: {
                id: taskId,
                project_id: parseInt(projectId)
            },
            transaction
        });

        await transaction.commit();

        if (result === 0) {
            // No se encontró la tarea
            return false;
        }

        return true;
    } catch (e) {
        logger.error({
            message: e.message,
            source: file,
            method: "deleteGantt()",
            params: { projectId, taskId }
        });
        await transaction.rollback();
        throw e;
    }
};


module.exports = {
    setGantt, getGantt, deleteGantt
}