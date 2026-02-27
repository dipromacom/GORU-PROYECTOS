const path = require('path');
const { InformeAvance, Proyecto, Usuario, Persona } = require('../models/index');
const logger = require('../logger/logger');

const file = path.basename(__filename);

const getAllInformesByProyecto = async (proyectoId) => {
    const items = await InformeAvance.findAll({
        where: {
            proyecto_id: proyectoId,
        },
        include: [
            {
                model: Usuario,
                as: 'CreadoPor',
                attributes: ['id', 'username'],
                include: {
                    model: Persona,
                    as: 'Persona',
                    attributes: ['nombre', 'apellido'],
                },
            },
        ],
        order: [['fecha_informe', 'DESC']],
    });
    return items;
};

const getInformeById = async (id) => {
    const item = await InformeAvance.findOne({
        where: { id },
        include: [
            {
                model: Usuario,
                as: 'CreadoPor',
                attributes: ['id', 'username'],
                include: {
                    model: Persona,
                    as: 'Persona',
                    attributes: ['nombre', 'apellido'],
                },
            },
            {
                model: Proyecto,
                as: 'Proyecto',
                attributes: ['id', 'nombre', 'numero'],
            },
        ],
    });
    return item;
};

const createInforme = async (data, usuarioId) => {
    try {
        const informe = await InformeAvance.create({
            proyecto_id: data.proyectoId,
            nombre_persona: data.nombrePersona,
            fecha_informe: data.fechaInforme || new Date(),
            conclusiones: data.conclusiones,
            proximos_pasos: data.proximosPasos,
            creado_por: usuarioId,
        });

        return informe;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: 'createInforme()',
            params: data,
        });
        throw error;
    }
};

const updateInforme = async (id, data) => {
    try {
        const informe = await InformeAvance.findByPk(id);

        if (!informe) {
            throw new Error('Informe no encontrado');
        }

        await informe.update({
            nombre_persona: data.nombrePersona, 
            conclusiones: data.conclusiones,
            proximos_pasos: data.proximosPasos,
            fecha_informe: data.fechaInforme,
        });

        return informe;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: 'updateInforme()',
            params: { id, data },
        });
        throw error;
    }
};

const deleteInforme = async (id) => {
    try {
        const informe = await InformeAvance.findByPk(id);

        if (!informe) {
            throw new Error('Informe no encontrado');
        }

        await informe.destroy();
        return true;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: 'deleteInforme()',
            params: { id },
        });
        throw error;
    }
};

const getInformesByUser = async (usuarioId, modo) => {
    return await InformeAvance.findAll({
        include: [{
            model: Proyecto,
            as: 'Proyecto',
            where: { modo },
            required: true,
            include: [{
                model: Usuario,
                as: 'Usuarios',
                where: { id: usuarioId },
                required: true,
                through: { attributes: [] }
            }]
        }],
        order: [['fecha_informe', 'DESC']]
    });
};

module.exports = {
    getAllInformesByProyecto,
    getInformeById,
    createInforme,
    updateInforme,
    deleteInforme,
    getInformesByUser
};