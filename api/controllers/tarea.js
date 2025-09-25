const TareaUtils = require('../utils/tareas-utils');

const getUndoneTareas = async (req, res) => {
    try {
        const { page, limit, projectId, done } = req.query;

        let parsedDone = null;
        if (done === "true" || done === true) parsedDone = true;
        else if (done === "false" || done === false) parsedDone = false;

        const tareas = await TareaUtils.getTareas(page, limit, {
            proyectoId: projectId,
            isDone: parsedDone
        });

        return res.status(201).json({ success: true, data: tareas });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createTarea = async (req,res) => {
    try{
        const {task} = req.body
        console.log("Nuevo req.body recibido:", req.body);
        await TareaUtils.createTarea(task)
        const { proyectoId } = task
        const tareas = await TareaUtils.getTareas(undefined,undefined,{proyectoId: parseInt(proyectoId), dueDate: new Date()})
        return res.status(201).json({success:true, data: tareas})
    }catch(error){
        return res.status(500).json({ success: false, message: error.message });
    }
}

const createTareaBatch = async (req, res) => {
    try{
        const {tasks} = req.body
        let proyectoId = tasks[0].proyectoId
        for(const task of tasks){
            await TareaUtils.createTarea(task)
        }
        const tareas = await TareaUtils.getTareas(undefined,undefined,{proyectoId, dueDate: new Date()})
        return res.status(201).json({success:true, data: tareas})
    }catch(error){
        return res.status(500).json({ success: false, message: error.message });
    }
}

const markTaskAsDone = async (req,res) =>{
    try{
        const {id} = req.params
        const { closeDate } = req.body;
        const tareaUpdated = await TareaUtils.tareaDone(id, closeDate);
        const {proyecto_id} = tareaUpdated
        const isDone = false
        const tareas = await TareaUtils.getTareas(undefined, undefined, { proyectoId: proyecto_id, isDone, dueDate: new Date()})
        return res.status(201).json({success:true, data: tareas})
    }catch(error){
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    getUndoneTareas,
    createTarea,
    createTareaBatch,
    markTaskAsDone
}