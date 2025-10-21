const { Op } = require('sequelize');
const db = require('../db');
const { GanttTask } = require('../models/index');
const path = require('path');
const file = path.basename(__filename);
const logger = require('../logger/logger');

/**
 * 🔹 Recalcula ruta crítica de un proyecto
 * Marca como `is_critical = true` las tareas que forman parte del camino más largo.
 */
const calculateCriticalPath = async (projectId) => {
    try {
        const tasks = await GanttTask.findAll({
            where: { project_id: parseInt(projectId) }
        });

        if (!tasks || tasks.length === 0) return;

        // Resetear todas las tareas
        await GanttTask.update({ is_critical: false }, { where: { project_id: projectId } });

        const byId = {};
        tasks.forEach(t => {
            byId[t.id] = t.toJSON();
        });

        // Función recursiva para calcular la duración acumulada (camino)
        const getDuration = (taskId, visited = new Set()) => {
            const task = byId[taskId];
            if (!task || visited.has(taskId)) return 0;
            visited.add(taskId);

            const deps = Array.isArray(task.dependencies) ? task.dependencies : [];
            if (deps.length === 0) return task.duration || 0;

            const maxDep = Math.max(...deps.map(dep => getDuration(dep, visited)));
            return (task.duration || 0) + maxDep;
        };

        // Buscar el camino crítico (más largo)
        let criticalTaskId = null;
        let maxDuration = 0;

        for (const t of tasks) {
            const d = getDuration(t.id);
            if (d > maxDuration) {
                maxDuration = d;
                criticalTaskId = t.id;
            }
        }

        // Marcar tareas en el camino crítico
        if (criticalTaskId) {
            const markCriticalChain = async (taskId) => {
                const task = byId[taskId];
                if (!task) return;
                await GanttTask.update({ is_critical: true }, { where: { id: taskId } });

                const deps = Array.isArray(task.dependencies) ? task.dependencies : [];
                if (deps.length > 0) {
                    const maxDep = deps.reduce((max, dep) => {
                        const d = getDuration(dep);
                        return d > getDuration(max) ? dep : max;
                    }, deps[0]);
                    await markCriticalChain(maxDep);
                }
            };
            await markCriticalChain(criticalTaskId);
        }

        console.log(`[GANTT] Ruta crítica calculada para proyecto ${projectId} (Duración total: ${maxDuration} días)`);
    } catch (e) {
        logger.error({
            message: e.message,
            source: file,
            method: "calculateCriticalPath()",
            params: { projectId }
        });
    }
};

/**
 * 🔹 Recalcula fechas y duración del grupo padre si hay subtareas
 */
const updateParentDates = async (parentId, transaction) => {
    const subtasks = await GanttTask.findAll({
        where: { parent_id: parentId },
        transaction
    });

    if (subtasks.length > 0) {
        const minStart = new Date(Math.min(...subtasks.map(t => new Date(t.start_date))));
        const maxEnd = new Date(Math.max(...subtasks.map(t => new Date(t.end_date))));
        const totalDuration = Math.ceil((maxEnd - minStart) / (1000 * 60 * 60 * 24));

        await GanttTask.update({
            start_date: minStart,
            end_date: maxEnd,
            duration: totalDuration
        }, {
            where: { id: parentId },
            transaction
        });
    }
};

/**
 * 🔹 Inserta o actualiza una tarea del Gantt
 */
const setGantt = async ({ task, projectId }) => {
    const transaction = await db.transaction();
    try {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);

        // Validación de fechas
        if (endDate < startDate) {
            throw new Error(`end_date no puede ser anterior a start_date (${task.name})`);
        }

        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        await GanttTask.upsert({
            id: task.id,
            project_id: parseInt(projectId),
            parent_id: task.parent_id || null,
            type: task.type || 'task',
            name: task.name,
            description: task.description || null,
            start_date: startDate,
            end_date: endDate,
            duration,
            progress: task.progress || 0,
            dependencies: task.dependencies || [],
            interesados_id: task.interesados_id || [],
            status: task.status || 'pending',
            is_critical: task.is_critical || false,
            updated_at: new Date()
        }, { transaction });

        // Si pertenece a un grupo (tiene parent_id), recalcular fechas del grupo
        if (task.parent_id) {
            await updateParentDates(task.parent_id, transaction);
        }

        await transaction.commit();

        // 🔹 Calcular ruta crítica fuera de la transacción (no bloquea escritura)
        await calculateCriticalPath(projectId);

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
};

/**
 * 🔹 Obtiene todas las tareas del proyecto
 */
const getGantt = async ({ projectId }) => {
    try {
        const tasks = await GanttTask.findAll({
            where: { project_id: parseInt(projectId) },
            attributes: [
                'id', 'name', 'description', 'start_date', 'end_date', 'duration',
                'progress', 'status', 'dependencies', 'interesados_id',
                'parent_id', 'type', 'is_critical'
            ],
            order: [['start_date', 'ASC']]
        });
        return tasks;
    } catch (e) {
        logger.error({
            message: e.message,
            source: file,
            method: "getGantt()",
            params: { projectId }
        });
        throw e;
    }
};

/**
 * 🔹 Elimina una tarea (si es grupo, también sus subtareas)
 */
const deleteGantt = async ({ projectId, taskId }) => {
    const transaction = await db.transaction();
    try {
        const task = await GanttTask.findByPk(taskId);
        if (task && task.type === 'group') {
            await GanttTask.destroy({
                where: { parent_id: taskId },
                transaction
            });
        }

        const result = await GanttTask.destroy({
            where: {
                id: taskId,
                project_id: parseInt(projectId)
            },
            transaction
        });

        await transaction.commit();

        // Recalcular ruta crítica después de eliminar
        await calculateCriticalPath(projectId);

        return result > 0;
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
    setGantt,
    getGantt,
    deleteGantt
};
