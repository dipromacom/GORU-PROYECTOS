const InteresadoUtils = require('../utils/interesados-utils');
const InteresadoCorreoUtils = require('../utils/interesados-correo-utils');
const PermisoProyectoUtils = require('../utils/permiso-proyecto-utils');
const { P } = PermisoProyectoUtils;
const logger = require('../logger/logger');
const db = require('../db');
const path = require('path');
const file = path.basename(__filename);
const { decodeToken } = require('../utils/security-utils');


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

        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        // Pasar directamente req.body a la utilidad
        const interesado = await InteresadoUtils.createInteresados(req.body, usuarioId);

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
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const interesadoId = req.params.id; // ID del interesado recibido como parámetro de la URL
        const data = req.body; // Datos del cuerpo de la solicitud
        const interesado = await InteresadoUtils.updateInteresado(interesadoId, data, usuarioId); // Llamada a la lógica del utils

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
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        // Eliminar el interesado
        const interesado = await Interesado.findByPk(id);
        if (!interesado) {
            return res.status(404).json({ success: false, message: 'Interesado no encontrado' });
        }
        await InteresadoUtils.deleteInteresado(id, usuarioId);
        // Eliminar las fechas de no disponibilidad asociadas
        //await FechasNoDisponibilidadUtils.destroy({ where: { interesado_id: id }, transaction });

        // Eliminar la evaluación asociada
        //await EvaluacionInteresado.destroy({ where: { interesadoId: id }, transaction });

        // Eliminar el interesado
        //await interesado.destroy({ transaction });

        // Confirmar la transacción
        //await transaction.commit();

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

const MODOS_CORREO = ['todos', 'uno', 'varios'];

const getDestinatariosCorreoProyecto = async (req, res) => {
    try {
        const usuarioId = PermisoProyectoUtils.getUsuarioIdFromReq(req);
        if (usuarioId == null) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        const { proyectoId } = req.params;
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(
            res,
            usuarioId,
            proyectoId,
            P.INTERESADOS_GEST,
        );
        if (!ok) return;

        const data = await InteresadoCorreoUtils.listDestinatariosCorreoProyecto(proyectoId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: 'getDestinatariosCorreoProyecto()',
            params: req.params,
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

const postEnviarCorreoInteresados = async (req, res) => {
    try {
        const usuarioId = PermisoProyectoUtils.getUsuarioIdFromReq(req);
        if (usuarioId == null) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        const { proyectoId } = req.params;

        const { asunto, mensaje, destinatariosModo: modoBody, destinatariosEmails } = req.body || {};
        const destinatariosModo = typeof modoBody === 'string' ? modoBody.trim() : '';

        if (!MODOS_CORREO.includes(destinatariosModo)) {
            return res.status(400).json({ success: false, message: 'Modo de destinatarios no válido. Use: todos, uno o varios.' });
        }

        const ok = await PermisoProyectoUtils.assertPermisoProyecto(
            res,
            usuarioId,
            proyectoId,
            P.INTERESADOS_GEST,
        );
        if (!ok) return;

        if (!asunto || !String(asunto).trim()) {
            return res.status(400).json({ success: false, message: 'El asunto es obligatorio.' });
        }
        if (!mensaje || !String(mensaje).trim()) {
            return res.status(400).json({ success: false, message: 'El mensaje es obligatorio.' });
        }

        const emailsRaw = Array.isArray(destinatariosEmails) ? destinatariosEmails : [];
        const emailsNorm = InteresadoCorreoUtils.normalizarListaCorreosManual(emailsRaw);

        if (destinatariosModo === 'uno') {
            if (emailsNorm.length !== 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe indicar exactamente un correo en destinatariosEmails.',
                });
            }
        }
        if (destinatariosModo === 'varios') {
            if (emailsNorm.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe indicar al menos dos correos distintos (selección y/o campo Para).',
                });
            }
            if (emailsNorm.length > InteresadoCorreoUtils.MAX_CORREOS_DESTINATARIOS) {
                return res.status(400).json({
                    success: false,
                    message: `Máximo ${InteresadoCorreoUtils.MAX_CORREOS_DESTINATARIOS} destinatarios por envío.`,
                });
            }
        }

        const emailsParaEnvio = destinatariosModo === 'todos' ? undefined : emailsNorm.map((x) => x.email);

        const data = await InteresadoCorreoUtils.enviarCorreosProyecto({
            usuarioId,
            proyectoId,
            asunto: String(asunto).trim(),
            mensaje: String(mensaje).trim(),
            destinatariosModo,
            destinatariosEmails: emailsParaEnvio,
        });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        const code = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
        logger.error({
            message: error.message,
            source: file,
            method: 'postEnviarCorreoInteresados()',
            params: req.params,
        });
        return res.status(code).json({ success: false, message: error.message });
    }
};

module.exports = {
    createInteresado,
    updateInteresado,
    deleteInteresado,
    getAllInteresados,
    getInteresadoById,
    getInteresadosById,
    getDestinatariosCorreoProyecto,
    postEnviarCorreoInteresados,
};
