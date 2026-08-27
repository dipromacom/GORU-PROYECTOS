const { Op } = require('sequelize');
const db = require('../db');
const { TimesheetEntry, GanttTask, Proyecto, Usuario, Persona, UsuarioProyecto } = require('../models/index');
const path = require('path');
const file = path.basename(__filename);
const logger = require('../logger/logger');

/**
 * Obtiene la hoja de tiempos para un usuario en un rango de fechas (mes o semana).
 * Trae:
 * 1. Tareas de Gantt asignadas al usuario (donde usuarios_id contiene al usuarioId).
 * 2. Entradas de timesheet_entry en el rango de fechas.
 * 3. Esfuerzo asignado, horas totales enviadas y esfuerzo restante por tarea.
 */
const getMyTimesheet = async ({ usuarioId, desde, hasta }) => {
    try {
        const uid = parseInt(usuarioId, 10);

        // 1. IDs de tareas que tienen entradas en borrador en el rango (para no perder tiempos sin enviar)
        const tasksWithDraftInRange = await TimesheetEntry.findAll({
            where: {
                usuario_id: uid,
                fecha: { [Op.between]: [desde, hasta] },
                estado: 'borrador'
            },
            attributes: ['task_id'],
            raw: true
        });
        const draftTaskIds = [...new Set(tasksWithDraftInRange.map(e => e.task_id))];

        // 2. Tareas asignadas al usuario cuyas fechas se solapan con el periodo solicitado
        //    Condición: start_date <= hasta AND end_date >= desde
        //    También se incluyen tareas con borradores pendientes aunque no solapen (para poder cerrarlas)
        const allTasks = await GanttTask.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            db.literal(`"gantt_task"."usuarios_id"::jsonb @> '[${uid}]'::jsonb`),
                            db.literal(`"gantt_task"."usuarios_id"::jsonb @> '["${uid}"]'::jsonb`)
                        ]
                    },
                    {
                        // Solapamiento de fechas con el periodo O tiene borradores pendientes en el rango
                        [Op.or]: [
                            // La tarea está activa durante el periodo (solapamiento)
                            {
                                [Op.and]: [
                                    { start_date: { [Op.lte]: hasta } },
                                    { end_date: { [Op.gte]: desde } }
                                ]
                            },
                            // O tiene entradas en borrador en el rango (tiempos sin enviar)
                            ...(draftTaskIds.length > 0 ? [{ id: { [Op.in]: draftTaskIds } }] : [])
                        ]
                    }
                ]
            },
            include: [{
                model: Proyecto,
                as: 'Proyecto',
                attributes: ['id', 'numero', 'nombre', 'modo', 'activo']
            }],
            order: [
                [{ model: Proyecto, as: 'Proyecto' }, 'nombre', 'ASC'],
                ['start_date', 'ASC']
            ]
        });

        // 3. Entradas de horas existentes en el rango de fechas para el usuario
        const entries = await TimesheetEntry.findAll({
            where: {
                usuario_id: uid,
                fecha: {
                    [Op.between]: [desde, hasta]
                }
            }
        });

        // 4. Obtener todas las horas históricas enviadas (para calcular esfuerzo restante real)
        const taskIds = allTasks.map(t => t.id);
        let historicalEntries = [];
        if (taskIds.length > 0) {
            historicalEntries = await TimesheetEntry.findAll({
                where: {
                    task_id: { [Op.in]: taskIds },
                    estado: 'enviado'
                },
                attributes: ['task_id', 'usuario_id', 'horas']
            });
        }

        // Mapear esfuerzo por tarea
        const taskList = allTasks.map(task => {
            const taskData = task.toJSON();
            const asignados = Array.isArray(taskData.usuarios_id) ? taskData.usuarios_id : [];
            const cantAsignados = asignados.length > 0 ? asignados.length : 1;

            // Esfuerzo total de la tarea (si horas_estimadas está seteado, o por defecto duration * 8)
            const duration = taskData.duration || 1;
            const esfuerzoTotalTarea = taskData.horas_estimadas !== null && taskData.horas_estimadas !== undefined
                ? parseFloat(taskData.horas_estimadas)
                : duration * 8;

            // Esfuerzo individual asignado a este usuario
            const esfuerzoAsignadoUsuario = parseFloat((esfuerzoTotalTarea / cantAsignados).toFixed(2));

            // Horas totales que este usuario ya envió en esta tarea históricamente
            const horasEnviadasUsuario = historicalEntries
                .filter(e => e.task_id === taskData.id && e.usuario_id === uid)
                .reduce((sum, e) => sum + parseFloat(e.horas || 0), 0);

            // Horas totales que TODOS los usuarios han enviado en la tarea
            const horasEnviadasTotales = historicalEntries
                .filter(e => e.task_id === taskData.id)
                .reduce((sum, e) => sum + parseFloat(e.horas || 0), 0);

            // Esfuerzo restante para este usuario
            const esfuerzoRestante = Math.max(0, parseFloat((esfuerzoAsignadoUsuario - horasEnviadasUsuario).toFixed(2)));

            return {
                ...taskData,
                esfuerzoTotalTarea,
                esfuerzoAsignadoUsuario,
                horasEnviadasUsuario,
                horasEnviadasTotales,
                esfuerzoRestante
            };
        });

        return {
            tasks: taskList,
            entries: entries.map(e => e.toJSON())
        };
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getMyTimesheet()",
            params: { usuarioId, desde, hasta }
        });
        throw error;
    }
};

/**
 * Guarda entradas de tiempos (en modo borrador).
 * Payload: { entries: [{ task_id, project_id, fecha, horas }] }
 */
const saveTimesheet = async ({ usuarioId, entries }) => {
    const transaction = await db.transaction();
    try {
        const uid = parseInt(usuarioId, 10);
        const results = [];

        for (const item of entries) {
            const horas = parseFloat(item.horas || 0);

            // Si las horas son 0 o vacías y ya existe borrador, eliminar o poner en 0
            if (horas <= 0) {
                await TimesheetEntry.destroy({
                    where: {
                        usuario_id: uid,
                        task_id: item.task_id,
                        fecha: item.fecha,
                        estado: 'borrador' // Solo eliminar si está en borrador
                    },
                    transaction
                });
                continue;
            }

            // Verificar si ya está enviado para no sobreescribir
            const existing = await TimesheetEntry.findOne({
                where: {
                    usuario_id: uid,
                    task_id: item.task_id,
                    fecha: item.fecha
                },
                transaction
            });

            if (existing && existing.estado === 'enviado') {
                // No se puede modificar una entrada ya enviada
                continue;
            }

            const [entry] = await TimesheetEntry.upsert({
                id: existing ? existing.id : undefined,
                usuario_id: uid,
                project_id: parseInt(item.project_id, 10),
                task_id: item.task_id,
                fecha: item.fecha,
                horas: horas,
                estado: 'borrador',
                updated_at: new Date()
            }, { transaction });

            results.push(entry);
        }

        await transaction.commit();
        return { success: true, count: results.length };
    } catch (error) {
        await transaction.rollback();
        logger.error({
            message: error.message,
            source: file,
            method: "saveTimesheet()",
            params: { usuarioId, entryCount: entries && entries.length }
        });
        throw error;
    }
};

/**
 * Envía las horas del periodo (cambia estado a 'enviado', bloquea y actualiza progreso en Gantt)
 * Payload: { desde, hasta, entries }
 */
const submitTimesheet = async ({ usuarioId, desde, hasta, entries }) => {
    const transaction = await db.transaction();
    try {
        const uid = parseInt(usuarioId, 10);
        const now = new Date();

        // 1. Si se enviaron nuevas entradas en el request, guardarlas primero
        if (Array.isArray(entries) && entries.length > 0) {
            for (const item of entries) {
                const horas = parseFloat(item.horas || 0);
                if (horas > 0) {
                    const existing = await TimesheetEntry.findOne({
                        where: {
                            usuario_id: uid,
                            task_id: item.task_id,
                            fecha: item.fecha
                        },
                        transaction
                    });

                    if (!existing || existing.estado !== 'enviado') {
                        await TimesheetEntry.upsert({
                            id: existing ? existing.id : undefined,
                            usuario_id: uid,
                            project_id: parseInt(item.project_id, 10),
                            task_id: item.task_id,
                            fecha: item.fecha,
                            horas: horas,
                            estado: 'enviado',
                            fecha_envio: now,
                            updated_at: now
                        }, { transaction });
                    }
                }
            }
        }

        // 2. Pasar todas las entradas borrador del usuario en el rango a 'enviado'
        await TimesheetEntry.update({
            estado: 'enviado',
            fecha_envio: now,
            updated_at: now
        }, {
            where: {
                usuario_id: uid,
                fecha: {
                    [Op.between]: [desde, hasta]
                },
                estado: 'borrador'
            },
            transaction
        });

        // 3. Recalcular el % de avance de todas las tareas afectadas
        const affectedEntries = await TimesheetEntry.findAll({
            where: {
                usuario_id: uid,
                fecha: {
                    [Op.between]: [desde, hasta]
                }
            },
            attributes: ['task_id', 'project_id'],
            transaction
        });

        const affectedTaskIds = [...new Set(affectedEntries.map(e => e.task_id))];

        for (const taskId of affectedTaskIds) {
            const task = await GanttTask.findByPk(taskId, { transaction });
            if (!task) continue;

            // Total horas enviadas para la tarea
            const totalHorasEnviadas = await TimesheetEntry.sum('horas', {
                where: {
                    task_id: taskId,
                    estado: 'enviado'
                },
                transaction
            }) || 0;

            const duration = task.duration || 1;
            const esfuerzoTotalTarea = task.horas_estimadas !== null && task.horas_estimadas !== undefined
                ? parseFloat(task.horas_estimadas)
                : duration * 8;

            let nuevoProgreso = 0;
            if (esfuerzoTotalTarea > 0) {
                nuevoProgreso = Math.min(100, Math.round((totalHorasEnviadas / esfuerzoTotalTarea) * 100));
            }

            await GanttTask.update({
                progress: nuevoProgreso,
                status: nuevoProgreso >= 100 ? 'completed' : nuevoProgreso > 0 ? 'in_progress' : 'pending',
                updated_at: now
            }, {
                where: { id: taskId },
                transaction
            });
        }

        await transaction.commit();
        return { success: true, tasksUpdated: affectedTaskIds.length };
    } catch (error) {
        await transaction.rollback();
        logger.error({
            message: error.message,
            source: file,
            method: "submitTimesheet()",
            params: { usuarioId, desde, hasta }
        });
        throw error;
    }
};

module.exports = {
    getMyTimesheet,
    saveTimesheet,
    submitTimesheet
};
