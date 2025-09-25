const db = require('../db');
const Sequelize = require('sequelize');
const { FechasNoDisponibilidad, Interesado } = require('../models/index');
const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

// Función para obtener todas las fechas de no disponibilidad
const getAllFechasNoDisponibilidad = async () => {
    const items = await FechasNoDisponibilidad.findAll();
    return items;
};

// Función para obtener fechas de no disponibilidad de un interesado específico
const getFechasNoDisponibilidadByInteresadoId = async (interesadoId) => {
    const items = await FechasNoDisponibilidad.findAll({
        where: { interesado_id: interesadoId },
        include: [
            {
                model: Interesado,
                as: 'Interesado',
                attributes: ['id', 'nombre_interesado', 'email'],
            },
        ],
    });
    return items;
};

// Función para obtener una fecha de no disponibilidad específica por ID
const getFechaNoDisponibilidadById = async (id) => {
    const item = await FechasNoDisponibilidad.findOne({
        where: { id },
        include: [
            {
                model: Interesado,
                as: 'Interesado',
                attributes: ['id', 'nombre_interesado', 'email'],
            },
        ],
    });
    return item;
};

module.exports = {
    getAllFechasNoDisponibilidad,
    getFechasNoDisponibilidadByInteresadoId,
    getFechaNoDisponibilidadById,
};
