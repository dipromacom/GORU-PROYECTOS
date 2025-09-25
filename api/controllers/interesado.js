const InteresadoUtils = require('../utils/interesados-utils')
const logger = require('../logger/logger');
const db = require('../db');
const path = require('path');
const file = path.basename(__filename);


// Crear un nuevo interesado, fechas de no disponibilidad y evaluación
// const createInteresado = async (req, res) => {
//     const {
//         proyecto_id,
//         id_interesado,
//         nombre_interesado,
//         telefono,
//         email,
//         otros_datos_contacto,
//         codigo,
//         rol,
//         cargo,
//         compania_clasificacion,
//         expectativas,
//         fechasNoDisponibilidad,
//         evaluacion
//     } = req.body;


//     try {
        
//         const interesado = await InteresadoUtils.createInteresados({
//             proyecto_id,
//             id_interesado,
//             nombre_interesado,
//             telefono,
//             email,
//             otros_datos_contacto,
//             codigo,
//             rol,
//             cargo,
//             compania_clasificacion,
//             expectativas
//         })

//         return res.status(201).json({ success: true, data: interesado });
//     } catch (error) {
//         await transaction.rollback();
//         logger.error({
//             message: error.message,
//             source: file,
//             method: "createInteresado()",
//             params: req.body
//         });
//         return res.status(500).json({ success: false, message: 'Error al crear el interesado' });
//     }
// };

const createInteresado = async (req, res) => {
    try {
        // Pasar directamente req.body a la utilidad
        const interesado = await InteresadoUtils.createInteresados(req.body);

        // Respuesta exitosa
        return res.status(201).json({ success: true, data: interesado });
    } catch (error) {
        // Registrar el error
        logger.error({
            message: error.message,
            source: __filename, // Usar el nombre del archivo actual
            method: "createInteresado()",
            params: req.body,
        });

        // Respuesta en caso de error
        return res.status(500).json({ success: false, message: 'Error al crear el interesado' });
    }
};


// Actualizar interesado, fechas de no disponibilidad y evaluación
const updateInteresado = async (req, res) => {
    try {
        const interesadoId = req.params.id; // ID del interesado recibido como parámetro de la URL
        const data = req.body; // Datos del cuerpo de la solicitud
        const interesado = await InteresadoUtils.updateInteresado(interesadoId, data); // Llamada a la lógica del utils

        return res.status(201).json({ success: true, data: interesado });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// Eliminar interesado, fechas de no disponibilidad y evaluación
const deleteInteresado = async (req, res) => {
    const { id } = req.params;

    const transaction = await db.transaction();

    try {
        // Eliminar el interesado
        const interesado = await Interesado.findByPk(id);
        if (!interesado) {
            return res.status(404).json({ success: false, message: 'Interesado no encontrado' });
        }

        // Eliminar las fechas de no disponibilidad asociadas
        await FechasNoDisponibilidadUtils.destroy({ where: { interesado_id: id }, transaction });

        // Eliminar la evaluación asociada
        await EvaluacionInteresado.destroy({ where: { interesadoId: id }, transaction });

        // Eliminar el interesado
        await interesado.destroy({ transaction });

        // Confirmar la transacción
        await transaction.commit();

        return res.status(200).json({ success: true, message: 'Interesado y sus datos asociados eliminados' });
    } catch (error) {
        await transaction.rollback();
        logger.error({
            message: error.message,
            source: file,
            method: "deleteInteresado()",
            params: req.params
        });
        return res.status(500).json({ success: false, message: 'Error al eliminar el interesado' });
    }
};

// Obtener todos los interesados
const getAllInteresados = async (req, res) => {
    try {
        const interesados = await InteresadoUtils.getAllInteresados(); // Trae todos los registros
        return res.status(200).json({ success: true, data: interesados });
    } catch (error) {
        return res.status(500).json({
            success: false,
            messge: error.message,
        });
    }
};


const getInteresadoById = async (req, res) => {
    try {
        console.log("ID de proyecto recibido:", req.params.id);

        const item = await InteresadoUtils.getInteresadoById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'No se encontraron interesados para el proyecto especificado' });
        }

        return res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error en getInteresadoById:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getInteresadosById = async (req, res) => {
    try {
        console.log("ID de proyecto recibido:", req.params.id);  // Muestra el ID del proyecto recibido en la solicitud

        // Llama a la función getInteresadoById desde el archivo de utils
        const item = await InteresadoUtils.getInteresadosById(req.params.id);

        if (!item) {
            // Si no se encuentra el interesado, responde con estado 404 y mensaje
            return res.status(404).json({ success: false, message: 'No se encontraron interesados para el proyecto especificado' });
        }

        // Si se encuentra el interesado, responde con estado 200 y los datos
        return res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error en getInteresadoById:", error.message);  // Muestra el error en la consola
        return res.status(500).json({ success: false, message: error.message });  // Responde con error 500
    }
};

module.exports = {
    createInteresado,
    updateInteresado,
    deleteInteresado,
    getAllInteresados,
    getInteresadoById,
    getInteresadosById,
};
