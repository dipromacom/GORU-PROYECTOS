const { transaction } = require('sequelize');
const { RespuestaAnalisis } = require('../models/index');

// Obtener todos los registros de análisis de impacto, incluyendo los criterios relacionados
const getAllResultadoAnalisisImpacto = async () => {
    const items = await RespuestaAnalisis.findAll();
    return items;
};



const getResultadosAnalisisImpactoById = async (projectId) => {
    try {
        console.log({projectId})
        const items = await RespuestaAnalisis.findOne({
            where: { proyecto_id: projectId },
            attributes: ['proyecto_id', 'link', 'total_calificacion']
        });

        return items;
    } catch (error) {
        console.error('Error al obtener los resultados de análisis de impacto:', error.message);
        throw error; // Lanza el error para que sea manejado en el lugar donde se llama a esta función
    }
};
// Crear un nuevo registro de análisis de impacto
const createResultadoAnalisisImpacto = async (data) => {
    try {
        const { proyecto_id, link, usuario_id, totalCalificacion } = data;

        const respuesta = await RespuestaAnalisis.create({
            proyecto_id: proyecto_id,
            total_calificacion: totalCalificacion,
            link: link || null,
            usuario_id: usuario_id || null,
        });

        // Verificar si el registro fue exitoso
        if (!respuesta) {
            throw new Error('No se pudo crear la respuesta de análisis. Por favor, intente nuevamente.');
        }

        console.log('RespuestaAnalisis creada exitosamente.');
        return respuesta;
    } catch (error) {
        console.error('Error al crear el resultado del análisis de impacto:', error.message);
        throw new Error('No se pudo crear el resultado del análisis de impacto. Intente nuevamente.');
    }
};


const updateResultadoAnalisisImpacto = async (id, data) => {
    try {
        let resultadoanalisisImpacto = await RespuestaAnalisis.findOne({ where: { proyecto_id: id } });

        if (!resultadoanalisisImpacto) {
            console.warn(`El análisis de impacto con ID ${id} no se encontró. Creando nuevo registro...`);
            resultadoanalisisImpacto = await RespuestaAnalisis.create({
                proyecto_id: id,
                link: data.link || null,
                usuario_id: data.usuario_id || null, // Si es necesario
                total_calificacion: data.totalCalificacion || 0 // Valor por defecto si aplica
            });

            return { success: true, message: "Nuevo registro creado", data: resultadoanalisisImpacto };
        }

        await resultadoanalisisImpacto.update({
            link: data.link,
        });

        return { success: true, message: "Registro actualizado exitosamente" };
    } catch (error) {
        console.error('Error al actualizar/crear el análisis de impacto:', error.message);
        return { success: false, message: error.message };
    }
};


module.exports = {
    createResultadoAnalisisImpacto,
    getAllResultadoAnalisisImpacto,
    getResultadosAnalisisImpactoById,
    updateResultadoAnalisisImpacto,
};