const path = require('path');
const { EncuestaSatisfaccion, Usuario, Proyecto, Persona } = require('../models/index');
const { saveLog } = require('./log-service');
const logger = require('../logger/logger');

const file = path.basename(__filename);

/**
 * Verifica si un usuario ya completó o rechazó la encuesta de un proyecto
 * @param {number} proyectoId 
 * @param {number} usuarioId 
 * @returns {Promise<Object|null>} Encuesta existente o null
 */
const getEncuestaByProyectoUsuario = async (proyectoId, usuarioId) => {
    try {
        const encuesta = await EncuestaSatisfaccion.findOne({
            where: {
                proyecto_id: proyectoId,
                usuario_id: usuarioId
            },
            include: [
                {
                    model: Usuario,
                    as: 'Usuario',
                    attributes: ['id', 'username'],
                    include: {
                        model: Persona,
                        as: 'Persona',
                        attributes: ['nombre', 'apellido']
                    }
                }
            ]
        });

        return encuesta;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getEncuestaByProyectoUsuario()",
            params: { proyectoId, usuarioId }
        });
        throw error;
    }
};

/**
 * Obtiene todas las encuestas de un proyecto
 * @param {number} proyectoId 
 * @returns {Promise<Array>}
 */
const getEncuestasByProyecto = async (proyectoId) => {
    try {
        const encuestas = await EncuestaSatisfaccion.findAll({
            where: {
                proyecto_id: proyectoId,
                completada: true
            },
            include: [
                {
                    model: Usuario,
                    as: 'Usuario',
                    attributes: ['id', 'username'],
                    include: {
                        model: Persona,
                        as: 'Persona',
                        attributes: ['nombre', 'apellido']
                    }
                }
            ],
            order: [['fecha_completada', 'DESC']]
        });

        return encuestas;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getEncuestasByProyecto()",
            params: { proyectoId }
        });
        throw error;
    }
};

/**
 * Crea o actualiza una encuesta de satisfacción
 * @param {Object} data - Datos de la encuesta
 * @param {number} usuarioId - ID del usuario que responde
 * @returns {Promise<EncuestaSatisfaccion>}
 */
const createOrUpdateEncuesta = async (data, usuarioId) => {
    try {
        const {
            proyectoId,
            nombre,
            comunicacion,
            rapidez_respuesta,
            manejo_reuniones,
            cumplimiento_plazos,
            cumplimiento_alcance,
            calidad_entregado,
            nivel_capacitaciones,
            gestion_documentacion,
            experiencia_director,
            satisfaccion_general,
            comentario_comunicacion,
            comentario_rapidez,
            comentario_reuniones,
            comentario_plazos,
            comentario_alcance,
            comentario_calidad,
            comentario_capacitaciones,
            comentario_documentacion,
            comentario_director,
            comentario_general,
            comentarios_generales,
            tipo_proyecto
        } = data;

        // Verificar si ya existe
        let encuesta = await EncuestaSatisfaccion.findOne({
            where: {
                proyecto_id: proyectoId,
                usuario_id: usuarioId
            }
        });

        const encuestaData = {
            proyecto_id: proyectoId,
            nombre: nombre,
            usuario_id: usuarioId,
            comunicacion,
            rapidez_respuesta,
            manejo_reuniones,
            cumplimiento_plazos,
            cumplimiento_alcance,
            calidad_entregado,
            nivel_capacitaciones,
            gestion_documentacion,
            experiencia_director,
            satisfaccion_general,
            comentario_comunicacion,
            comentario_rapidez,
            comentario_reuniones,
            comentario_plazos,
            comentario_alcance,
            comentario_calidad,
            comentario_capacitaciones,
            comentario_documentacion,
            comentario_director,
            comentario_general,
            comentarios_generales,
            completada: true,
            tipo_proyecto: tipo_proyecto,
            fecha_completada: new Date()
        };

        if (encuesta) {
            // Actualizar encuesta existente
            await encuesta.update(encuestaData);

            await saveLog({
                userId: usuarioId,
                actionType: 'SURVEY_UPDATED',
                resourceType: 'EncuestaSatisfaccion',
                resourceId: encuesta.id,
                details: { proyectoId }
            });
        } else {
            // Crear nueva encuesta
            encuesta = await EncuestaSatisfaccion.create(encuestaData);

            await saveLog({
                userId: usuarioId,
                actionType: 'SURVEY_COMPLETED',
                resourceType: 'EncuestaSatisfaccion',
                resourceId: encuesta.id,
                details: { proyectoId }
            });
        }

        return encuesta;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "createOrUpdateEncuesta()",
            params: { data, usuarioId }
        });
        throw error;
    }
};

/**
 * Marca una encuesta como rechazada (el usuario no quiere responder)
 * @param {number} proyectoId 
 * @param {number} usuarioId 
 * @returns {Promise<EncuestaSatisfaccion>}
 */
const rechazarEncuesta = async (proyectoId, usuarioId) => {
    try {
        let encuesta = await EncuestaSatisfaccion.findOne({
            where: {
                proyecto_id: proyectoId,
                usuario_id: usuarioId
            }
        });

        const encuestaData = {
            proyecto_id: proyectoId,
            usuario_id: usuarioId,
            rechazada: true,
            fecha_rechazo: new Date()
        };

        if (encuesta) {
            await encuesta.update(encuestaData);
        } else {
            encuesta = await EncuestaSatisfaccion.create(encuestaData);
        }

        await saveLog({
            userId: usuarioId,
            actionType: 'SURVEY_DECLINED',
            resourceType: 'EncuestaSatisfaccion',
            resourceId: encuesta.id,
            details: { proyectoId }
        });

        return encuesta;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "rechazarEncuesta()",
            params: { proyectoId, usuarioId }
        });
        throw error;
    }
};

/**
 * Calcula estadísticas de las encuestas de un proyecto
 * @param {number} proyectoId 
 * @returns {Promise<Object>}
 */
const getEstadisticasEncuesta = async (proyectoId) => {
    try {
        const encuestas = await EncuestaSatisfaccion.findAll({
            where: {
                proyecto_id: proyectoId,
                completada: true
            }
        });

        if (encuestas.length === 0) {
            return {
                totalEncuestas: 0,
                promedios: {},
                satisfaccionGeneral: 0
            };
        }

        const campos = [
            'comunicacion',
            'rapidez_respuesta',
            'manejo_reuniones',
            'cumplimiento_plazos',
            'cumplimiento_alcance',
            'calidad_entregado',
            'nivel_capacitaciones',
            'gestion_documentacion',
            'experiencia_director',
            'satisfaccion_general'
        ];

        const promedios = {};
        campos.forEach(campo => {
            const valores = encuestas
                .map(e => e[campo])
                .filter(v => v !== null && v !== undefined);

            if (valores.length > 0) {
                const suma = valores.reduce((acc, val) => acc + val, 0);
                promedios[campo] = (suma / valores.length).toFixed(2);
            } else {
                promedios[campo] = 0;
            }
        });

        return {
            totalEncuestas: encuestas.length,
            promedios,
            satisfaccionGeneral: parseFloat(promedios.satisfaccion_general || 0)
        };
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getEstadisticasEncuesta()",
            params: { proyectoId }
        });
        throw error;
    }
};

const getAllEncuestasByProyecto = async (proyectoId) => {
    try {
        const encuestas = await EncuestaSatisfaccion.findAll({
            where: {
                proyecto_id: proyectoId,
                completada: true // Solo las completadas
            },
            include: [
                {
                    model: Usuario,
                    as: 'Usuario',
                    attributes: ['id', 'username'],
                    include: {
                        model: Persona,
                        as: 'Persona',
                        attributes: ['nombre', 'apellido']
                    }
                }
            ],
            order: [['fecha_completada', 'DESC']]
        });

        return encuestas;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getAllEncuestasByProyecto()",
            params: { proyectoId }
        });
        throw error;
    }
};

module.exports = {
    getEncuestaByProyectoUsuario,
    getEncuestasByProyecto,
    getAllEncuestasByProyecto,
    createOrUpdateEncuesta,
    rechazarEncuesta,
    getEstadisticasEncuesta
};