const { Op } = require('sequelize');

const {
    Tarea
} = require('../models/index')


const logger = require('../logger/logger');

async function getTareas(page = 1, limit = 100, { proyectoId, isDone = null, dueDate }) {
    try {
        const offset = (page - 1) * limit;

        const filter = {};
        if (isDone === true || isDone === false) {
            filter.done = isDone;
        }

        if (proyectoId) filter.proyecto_id = proyectoId;

        if (dueDate) {
            filter.duedate = {
                [Op.gte]: dueDate ? new Date(dueDate) : new Date()
            };
        }

        const result = await Tarea.findAndCountAll({
            where: filter,
            limit: limit,
            offset: offset,
            order: [["duedate", "ASC"]],
        });

        return {
            total: result.count,
            totalPages: Math.ceil(result.count / limit),
            currentPage: page,
            tareas: result.rows,
        };
    } catch (error) {
        console.error("Error fetching tareas:", error);
        throw error;
    }
}

async function createTarea({ id, title, description, prioridad, label, dueDate, proyectoId, interesadoName, interesadoId}){
    try {
        const created = await Tarea.create({
            proyecto_id: proyectoId,
            id,
            description,
            title,
            prioridad,
            label,
            interesado: interesadoName,
            id_interesado: parseInt(interesadoId), 
            done:false,
            duedate: dueDate
        })
        return created
    }catch(error){
        throw error
    }
}

async function tareaDone(id, closeDate) {
    try {
        const [updated] = await Tarea.update(
            {
                done: true,
                closeDate: closeDate ? new Date(closeDate) : new Date() 
            },
            { where: { id }, returning: true } 
        );

        if (!updated) {
            throw new Error("Tarea no encontrada o no se pudo actualizar");
        }

        const tarea = await Tarea.findByPk(id);
        return tarea;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getTareas,
    createTarea,
    tareaDone
}