const KanbanUtils = require('../utils/kanban-utils')

const setKanban = async (req, res) => {
    const { id: projectId } = req.params
    const { body } = req
    try {
        const success = await KanbanUtils.setKanban({ ...body, projectId })
        return res.status(200).json(success)
    } catch (e) {
        return res.status(500).json({ success: false });
    }

}

const getKanban = async (req, res) => {
    const { id: projectId } = req.params
    try {
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
                    interesadoId: tempTask.interesadoId || null
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

module.exports = {
    setKanban, getKanban
}