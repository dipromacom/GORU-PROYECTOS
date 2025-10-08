const GanttUtils = require('../utils/gantt-utils')

const setGantt = async (req, res) => {
    const { id: projectId } = req.params;
    const { task, tasks } = req.body;

    try {
        if (Array.isArray(tasks) && tasks.length > 0) {
            // 🟢 Caso: Sync masivo con tasks[]
            for (const t of tasks) {
                if (!t.id) {
                    console.warn(`task sin id detectada en setGantt:`, t);
                    continue; // saltar tareas sin id
                }
                await GanttUtils.setGantt({ task: t, projectId });
            }
        } else if (task) {
            // 🟢 Caso: Una sola tarea (createTask / editTask)
            if (!task.id) {
                return res.status(400).json({ success: false, message: "El task recibido no tiene id" });
            }
            await GanttUtils.setGantt({ task, projectId });
        } else {
            return res.status(400).json({
                success: false,
                message: "No se envió ninguna tarea válida. Debe enviarse task o tasks"
            });
        }

        return res.status(200).json({ success: true });
    } catch (e) {
        console.error("Error en setGantt:", e);
        return res.status(500).json({ success: false });
    }
};

const getGantt = async (req, res) => {
    const { id: projectId } = req.params
    try {
        const tasks = await GanttUtils.getGantt({ projectId })

        let allIds = []
        let byId = {}

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i]
            allIds.push(task.id)
            byId[task.id] = {
                id: task.id,
                name: task.name,
                description: task.description,
                start_date: task.start_date,
                end_date: task.end_date,
                progress: task.progress,
                status: task.status,
                dependencies: task.dependencies || [],
                interesados_id: task.interesados_id || []
            }
        }

        return res.status(200).json({
            success: true,
            tasks: { allIds, byId }
        })
    } catch (e) {
        return res.status(500).json({ success: false });
    }
}

const deleteGantt = async (req, res) => {
    const { id: projectId, taskId } = req.params;

    try {
        const deleted = await GanttUtils.deleteGantt({ projectId, taskId });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Tarea no encontrada para eliminar"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tarea eliminada correctamente"
        });
    } catch (e) {
        console.error("Error en deleteGantt:", e);
        return res.status(500).json({ success: false, message: "Error interno al eliminar la tarea" });
    }
};


module.exports = {
    setGantt, getGantt, deleteGantt
}