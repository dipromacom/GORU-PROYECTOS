const { Op } = require('sequelize');
const db = require('../db')
const { KanbanStatus, KanbanTask, Proyecto, Usuario } = require('../models/index');
const path = require('path');
const file = path.basename(__filename);
const logger = require('../logger/logger');



const setKanban = async ({ status, tasks, projectId }) => {
    const transaction = await db.transaction();
    try {
        const { allIds: allStatusIds, byId: statusById } = status
        const { allIds: allTasksIds, byId: tasksById } = tasks

        await KanbanTask.destroy({
            where: {
                [Op.and]: [
                    { status_id: { [Op.in]: allStatusIds } },
                    { id: { [Op.notIn]: allTasksIds } }
                ]
            }
        }, { transaction })

        await KanbanStatus.destroy({
            where: {
                [Op.and]: [
                    { project_id: parseInt(projectId) },
                    { id: { [Op.notIn]: allStatusIds } }
                ]
            }
        }, { transaction })

        for (let index =0 ; index < allStatusIds.length; index++) {
            const statusId = allStatusIds[index];
            const statusRequest = statusById[statusId]
            const statusInstance = {
                ...statusRequest,
                index: index, project_id: projectId,
            }
            const [status, created] = await KanbanStatus.upsert( statusInstance, { transaction })
            for (let indexTask = 0; indexTask < statusRequest.tasks.length; indexTask++) {
                const taskId  = statusRequest.tasks[indexTask];
                const [task, createdTask] = await KanbanTask.upsert({
                    ...tasksById[taskId],
                    status_id: statusId,
                    index: indexTask,
                    interesadoId: tasksById[taskId].interesadoId || null,
                    deadline: tasksById[taskId].deadline || null,
                    closed_at: tasksById[taskId].closed_at || null
                }, { transaction })
            }
        }
        await transaction.commit();
        return true
    } catch (e) {
        logger.error({
            message: e.message,
            source: file,
            method: "setKanban()",
            params: { status, tasks, projectId }
        });
        await transaction.rollback();
        throw e;
    }
}

const getKanban = async ({projectId})=>{
    try{
        const status = await KanbanStatus.findAll({
            where:{
                project_id: projectId
            },
            attributes: ['id', 'title'],
            include: [{
                as: 'tasks',
                model: KanbanTask,
                attributes: ['id', 'content', 'priority', 'interesadoId', 'deadline', 'closed_at']
            }],
            order: [
                ['index', 'ASC'],                   
                [{ model: KanbanTask, as: 'tasks' }, 'index', 'ASC'] 
            ]
        })
        return status
    }catch(e){
        logger.error({
            message: e.message,
            source: file,
            method: "getKanban()",
            params: {}
        });
        throw e;
    }
}

const getKanbanByUser = async ({ usuarioId, modo }) => {
    try {
        const status = await KanbanStatus.findAll({
            include: [
                {
                    model: KanbanTask,
                    as: 'tasks',
                },
                {
                    model: Proyecto,
                    as: 'Proyecto',
                    where: { modo: modo },
                    required: true,
                    include: [{
                        model: Usuario,
                        as: 'Usuarios',
                        where: { id: usuarioId },
                        required: true,
                        through: { attributes: [] }
                    }]
                }
            ],
            order: [
                ['index', 'ASC'],
                [{ model: KanbanTask, as: 'tasks' }, 'index', 'ASC']
            ]
        });
        return status;
    } catch (e) {
        logger.error({ message: e.message, source: file, method: "getKanbanByUser()" });
        throw e;
    }
};

module.exports = {
    setKanban, getKanban, getKanbanByUser
}