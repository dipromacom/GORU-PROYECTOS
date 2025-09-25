const db = require('../db');
const Sequelize = require('sequelize');
const { Evaluacion, Interesado, Proyecto } = require('../models/index');
const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

// Función para obtener todas las evaluaciones
const getAllEvaluaciones = async () => {
    const items = await Evaluacion.findAll();
    return items;
};

// Función para obtener evaluaciones de un interesado específico
const getEvaluacionesByInteresadoId = async (interesadoId) => {
    const items = await Evaluacion.findAll({
        where: { interesado_id: interesadoId },
        include: [
            {
                model: Proyecto,
                as: 'Proyecto',
                attributes: ['id', 'nombre'],
            },
        ],
    });
    return items;
};

// Función para obtener una evaluación específica por ID
const getEvaluacionById = async (id) => {
    const item = await Evaluacion.findOne({
        where: { id },
        include: [
            {
                model: Interesado,
                as: 'Interesado',
                attributes: ['id', 'nombre_interesado', 'email'],
            },
            {
                model: Proyecto,
                as: 'Proyecto',
                attributes: ['id', 'nombre'],
            },
        ],
    });
    return item;
};

module.exports = {
    getAllEvaluaciones,
    getEvaluacionesByInteresadoId,
    getEvaluacionById,
};
