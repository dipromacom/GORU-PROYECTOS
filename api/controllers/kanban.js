const KanbanUtils = require('../utils/kanban-utils')
const { decodeToken } = require('../utils/security-utils')
const PermisoProyectoUtils = require('../utils/permiso-proyecto-utils')
const { P } = PermisoProyectoUtils

const setKanban = async (req, res) => {
    const { id: projectId } = req.params
    const { body } = req
    try {
        const { authorization } = req.headers
        const { id: usuarioId } = decodeToken(authorization)
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, projectId, P.KANBAN_GEST)
        if (!ok) return

        const success = await KanbanUtils.setKanban({ ...body, projectId })
        return res.status(200).json(success)
    } catch (e) {
        return res.status(500).json({ success: false });
    }

}

const getKanban = async (req, res) => {
    const { id: projectId } = req.params
    try {
        const { authorization } = req.headers
        const { id: usuarioId } = decodeToken(authorization)
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, projectId, P.KANBAN_VER)
        if (!ok) return

        const statusQuery = await KanbanUtils.getKanban({ projectId })
        let allStatusIds = []
        let allStatusById = {}
        let allTasksIds = []
        let allTasksById = {}
        for (let index = 0; index < statusQuery.length; index++) {
            const tempStatus = statusQuery[index]
            allStatusIds.push(tempStatus.id)
            const innerTasks = []
            for (let indexTasks = 0; indexTasks < tempStatus.tasks.length; indexTasks++) {
                const tempTask = tempStatus.tasks[indexTasks]
                innerTasks.push(tempTask.id)
                allTasksIds.push(tempTask.id)
                allTasksById[tempTask.id] = {
                    id: tempTask.id,
                    content: tempTask.content,
                    priority: tempTask.priority,
                    interesadoId: tempTask.interesadoId || null,
                    deadline: tempTask.deadline || null,
                    closed_at: tempTask.closed_at || null,
                    observacion: tempTask.observacion || null
                }
            }
            allStatusById[tempStatus.id] = {
                id: tempStatus.id, title: tempStatus.title,
                tasks: innerTasks
            }
        }
        const status = {
            allIds: allStatusIds,
            byId: allStatusById
        }
        const tasks = {
            allIds: allTasksIds,
            byId: allTasksById
        }
        return res.status(200).json({ success: true, status, tasks })
    } catch (e) {
        return res.status(500).json({ success: false });
    }
}

const getKanbanByUser = async (req, res) => {
    const { usuarioId } = req.params;
    const { modo } = req.query;
    try {
        const statusQuery = await KanbanUtils.getKanbanByUser({ usuarioId, modo });

        let allStatusIds = [];
        let allStatusById = {};
        let allTasksIds = [];
        let allTasksById = {};

        for (let index = 0; index < statusQuery.length; index++) {
            const tempStatus = statusQuery[index];
            allStatusIds.push(tempStatus.id);

            const innerTasks = [];
            for (let indexTasks = 0; indexTasks < tempStatus.tasks.length; indexTasks++) {
                const tempTask = tempStatus.tasks[indexTasks];
                innerTasks.push(tempTask.id);
                allTasksIds.push(tempTask.id);

                allTasksById[tempTask.id] = {
                    id: tempTask.id,
                    content: tempTask.content,
                    priority: tempTask.priority,
                    interesadoId: tempTask.interesadoId || null,
                    deadline: tempTask.deadline || null,
                    closed_at: tempTask.closed_at || null,
                    observacion: tempTask.observacion || null,
                    projectName: tempStatus.Proyecto && tempStatus.Proyecto.nombre
                };
            }

            allStatusById[tempStatus.id] = {
                id: tempStatus.id,
                title: tempStatus.title,
                projectName: tempStatus.Proyecto && tempStatus.Proyecto.nombre,
                tasks: innerTasks
            };
        }

        const status = { allIds: allStatusIds, byId: allStatusById };
        const tasks = { allIds: allTasksIds, byId: allTasksById };

        return res.status(200).json({ success: true, status, tasks });

    } catch (e) {
        console.error("Error en getKanbanByUser:", e);
        return res.status(500).json({ success: false, error: e.message });
    }
};

module.exports = {
    setKanban, getKanban, getKanbanByUser
}