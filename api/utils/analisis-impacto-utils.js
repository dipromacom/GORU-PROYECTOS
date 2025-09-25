const { transaction } = require('sequelize');
const { AnalisisImpacto, criterioAnalisis, RespuestaAnalisis } = require('../models/index');

    // Obtener todos los registros de análisis de impacto, incluyendo los criterios relacionados
    const getAllAnalisisImpacto = async () => {
        const items = await AnalisisImpacto.findAll();
        return items;
    };

    const getAllEvaluacion = async () => {
        const items = await criterioAnalisis.findAll();
        return items;
    };


const getAnalisisImpactoById = async (projectId) => {
    try {
        console.log({ projectId });

        // Buscar análisis de impacto junto con criterios
        const items = await AnalisisImpacto.findAll({
            where: { proyecto_id: projectId },
            include: [
                {
                    model: criterioAnalisis,
                    as: 'criterioAnalisis', // Alias de la relación
                    attributes: ['id', 'descripcion'],
                },
            ],
        });

        // Obtener todas las respuestas del proyecto
        const respuestas = await RespuestaAnalisis.findAll({
            where: { proyecto_id: projectId },
            attributes: ['proyecto_id', 'link', 'total_calificacion'],
        });

        // Combinar respuestas con cada análisis de impacto
        const result = items.map((item) => ({
            ...item.toJSON(), // Convertir a objeto JSON
            RespuestaAnalisis: respuestas, // Asociar todas las respuestas al proyecto
        }));

        if (result.length === 0) {
            throw new Error('No se encontraron análisis de impacto para el proyecto con el ID especificado.');
        }

        return result;
    } catch (error) {
        console.error('Error al obtener los análisis de impacto:', error.message);
        throw error;
    }
};


    // Crear un nuevo registro de análisis de impacto
const createAnalisisImpacto = async (data) => {
    try {
        const proyectos = [];
        let totalCalificacion = 0;
        for (const item of data.payload.payload) {
            const { proyecto_id, criterio_id, weight, rating } = item;

            // Verificar si el registro ya existe
            const existe = await AnalisisImpacto.findOne({
                where: { proyecto_id, criterio_id },
                transaction,
            });

            if (existe) {
                console.log(`El análisis con proyecto_id: ${proyecto_id} y criterio_id: ${criterio_id} ya existe.`);
                continue; // Saltar este registro
            }

            const proyecto = await AnalisisImpacto.create({
                proyecto_id,
                criterio_id,
                weight,
                rating,
            });

            // Guardar el proyecto creado en el array
            proyectos.push(proyecto);
           
        }
        

        // // Confirmar la transacción
        // await transaction.commit();
        return proyectos;

    } catch (error) {
        // await  transaction.rollback();
        console.error('Error al crear el análisis de impacto:', error.message);
        throw new Error('No se pudo crear el análisis de impacto. Intente nuevamente.');
    }
};


    const updateAnalisisImpacto = async (data, id) => {
        try {
            // Buscar el análisis de impacto por ID
            const analisisImpacto = await AnalisisImpacto.findOne({ where: { id } });

            if (!analisisImpacto) {
                console.warn(`El análisis de impacto con ID ${id} no se encontró.`);
                return false;
            }

            // Actualizar los campos con los datos proporcionados
            await analisisImpacto.update({
                proyecto_id: data.proyecto_id,
                criterio_id: data.criterio_id,
                weight: data.weight,
                rating: data.rating,
            });

            return true; // Indica que la actualización fue exitosa
        } catch (error) {
            console.error('Error al actualizar el análisis de impacto:', error.message);
            return false; // Indica que la actualización falló
        }
    };

    



module.exports = {
    createAnalisisImpacto,
    getAllAnalisisImpacto,
    getAllEvaluacion,
    getAnalisisImpactoById,
    updateAnalisisImpacto,
};
