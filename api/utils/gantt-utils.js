const { Op } = require('sequelize');
const db = require('../db');
const { GanttTask, Proyecto, Usuario } = require('../models/index');
const path = require('path');
const file = path.basename(__filename);
const logger = require('../logger/logger');

/**
 * 🔹 Recalcula ruta crítica de un proyecto
 * FIX: Agregado memo + visiting para proteger contra ciclos circulares
 */
const calculateCriticalPath = async (projectId) => {
    try {
        const tasks = await GanttTask.findAll({
            where: { project_id: parseInt(projectId) }
        });

        if (!tasks || tasks.length === 0) return;

        await GanttTask.update({ is_critical: false }, { where: { project_id: projectId } });

        const byId = {};
        tasks.forEach(t => {
            byId[t.id] = t.toJSON();
        });

        // FIX: memo evita recalcular, visiting detecta ciclos
        const memo = {};
        const visiting = new Set();

        const getDuration = (taskId) => {
            if (memo[taskId] !== undefined) return memo[taskId];
            if (visiting.has(taskId)) return 0; // ciclo detectado — cortar

            visiting.add(taskId);

            const task = byId[taskId];
            if (!task) {
                visiting.delete(taskId);
                return 0;
            }

            const deps = Array.isArray(task.dependencies) ? task.dependencies : [];
            const maxDep = deps.length > 0
                ? Math.max(...deps.map(dep => getDuration(dep)))
                : 0;

            memo[taskId] = (task.duration || 0) + maxDep;
            visiting.delete(taskId);
            return memo[taskId];
        };

        let criticalTaskId = null;
        let maxDuration = 0;

        for (const t of tasks) {
            const d = getDuration(t.id);
            if (d > maxDuration) {
                maxDuration = d;
                criticalTaskId = t.id;
            }
        }

        if (criticalTaskId) {
            const markCriticalChain = async (taskId) => {
                const task = byId[taskId];
                if (!task) return;
                await GanttTask.update({ is_critical: true }, { where: { id: taskId } });

                const deps = Array.isArray(task.dependencies) ? task.dependencies : [];
                if (deps.length > 0) {
                    const maxDep = deps.reduce((max, dep) => {
                        return (memo[dep] || 0) > (memo[max] || 0) ? dep : max;
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
        const minStartMs = Math.min(...subtasks.map(t => new Date(t.start_date).getTime()));
        const maxEndMs = Math.max(...subtasks.map(t => new Date(t.end_date).getTime()));
        const minStart = new Date(minStartMs);
        const maxEnd = new Date(maxEndMs);

        const totalDurationMs = maxEndMs - minStartMs;
        const totalDuration = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24));

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
 * Normaliza una fecha a medianoche UTC
 */
const normalizeDateToUTCMidnight = (dateString) => {
    const date = new Date(dateString);
    return new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ));
};

/**
 * 🔹 Inserta o actualiza UNA sola tarea del Gantt
 * Usado para crear/editar una tarea individual
 */
const setGantt = async ({ task, projectId }) => {
    const transaction = await db.transaction();
    try {
        const startDate = normalizeDateToUTCMidnight(task.start_date);
        const endDate = normalizeDateToUTCMidnight(task.end_date);

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
            usuarios_id: task.usuarios_id || [],
            horas_estimadas: task.horas_estimadas !== undefined && task.horas_estimadas !== null ? task.horas_estimadas : (duration * 8),
            status: task.status || 'pending',
            is_critical: task.is_critical || false,
            updated_at: new Date()
        }, { transaction });

        if (task.parent_id) {
            await updateParentDates(task.parent_id, transaction);
        }

        await transaction.commit();

        // Recalcular ruta crítica (una sola vez, fuera de la transacción)
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
 * 🔹 NUEVO: Sync masivo de todas las tareas en UNA sola transacción
 * FIX: Antes se hacía una transacción y un recálculo por cada tarea → saturaba la BD
 * Ahora: una sola transacción para todas las tareas + un solo recálculo al final
 */
const syncGantt = async ({ tasks, projectId }) => {
    const transaction = await db.transaction();
    try {
        for (const task of tasks) {
            if (!task.id) {
                console.warn(`[syncGantt] task sin id detectada, se omite:`, task);
                continue;
            }

            const startDate = normalizeDateToUTCMidnight(task.start_date);
            const endDate = normalizeDateToUTCMidnight(task.end_date);

            // Si las fechas son inválidas, omitir esta tarea pero no fallar todo el sync
            if (endDate < startDate) {
                console.warn(`[syncGantt] Fechas inválidas en tarea ${task.id} (${task.name}), se omite`);
                continue;
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
                usuarios_id: task.usuarios_id || [],
                horas_estimadas: task.horas_estimadas !== undefined && task.horas_estimadas !== null ? task.horas_estimadas : (duration * 8),
                status: task.status || 'pending',
                is_critical: task.is_critical || false,
                updated_at: new Date()
            }, { transaction });
        }

        await transaction.commit();

        // Un solo recálculo de ruta crítica al final para todo el lote
        await calculateCriticalPath(projectId);

        return true;
    } catch (e) {
        logger.error({
            message: e.message,
            source: file,
            method: "syncGantt()",
            params: { projectId, taskCount: tasks && tasks.length }
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
                'progress', 'status', 'dependencies', 'interesados_id', 'usuarios_id', 'horas_estimadas',
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

const getGanttByUser = async ({ usuarioId, modo }) => {
    try {
        const tasks = await GanttTask.findAll({
            include: [{
                model: Proyecto,
                as: 'Proyecto',
                where: { modo: modo },
                required: true,
                include: [{
                    model: Usuario,
                    as: 'Usuarios',
                    where: { id: parseInt(usuarioId) },
                    required: true,
                    through: { attributes: [] }
                }]
            }],
            order: [['start_date', 'ASC']]
        });
        return tasks;
    } catch (e) {
        console.error("Falla en GanttUtils.getGanttByUser:", e.message);
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
    syncGantt,  // 🔹 NUEVO: exportar syncGantt
    getGantt,
    deleteGantt,
    getGanttByUser
};