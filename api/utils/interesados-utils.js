const db = require('../db');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { Interesado, NoDisponibilidad, EvaluacionInteresado } = require('../models/index');
const logger = require('../logger/logger');
const path = require('path');
const interesados = require('../models/interesados');
const evaluacionInteresados = require('../models/evaluacion-interesados');
const { access } = require('fs');
const file = path.basename(__filename);
const { saveLog } = require('../utils/log-service');

const normalizeNumericField = (value) => {
    // Si el valor es una cadena vacía, retornamos null
    if (value === "") {
        return null;
    }
    return value;
}

const createInteresados = async (data, usuarioId) => {
    const transaction = await db.transaction();
    console.log('Enviando a la API:', JSON.stringify(data, null, 2));

    try {
        const interesadosArray = Array.isArray(data) ? data : [data];

        const interesadosCreados = [];

        for (const interesadoData of interesadosArray) {
            const {
                id_interesado = null, 
                nombre_interesado,
                telefono = null,
                email = null,
                proyecto_id = null,
                otrosDatos: otros_datos_contacto = null,
                codigo = null,
                rol = null,
                cargo = null,
                companiaClasificacion: compania_clasificacion = null,
                expectativasProyecto: expectativas = null,
                fechasNoDisponibilidad = [],
                evaluacion = null,
                accionEstrategica = null,
                responsableEstrategia = null,
                compromiso = null,
                poder = null,
                influencia = null,
                conocimiento = null,
                interesActitud = null,
                valoracion = null
            } = interesadoData;

            if (!nombre_interesado) {
                throw new Error('El nombre del interesado es obligatorio.');
            }

            // Se pasa id_interesado solo si es obligatorio
            const interesado = await Interesado.create({
                ...(id_interesado ? { id_interesado } : {}), // Solo lo incluye si tiene valor
                nombre_interesado,
                telefono,
                email,
                proyecto_id,
                otros_datos_contacto,
                codigo,
                rol,
                cargo,
                compania_clasificacion,
                expectativas,
                fecha_creacion: new Date(),
            }, { transaction });

            if (Array.isArray(fechasNoDisponibilidad) && fechasNoDisponibilidad.length > 0) {
                try {
                    const noDisponibilidadRecords = fechasNoDisponibilidad
                        .filter(({ fechaInicio, fechaFin }) => fechaInicio && fechaFin) // Validar que existan fechas
                        .map(({ fechaInicio, fechaFin, descripcion }) => ({
                            interesado_id: interesado.id,
                            fechaInicio: new Date(fechaInicio), // Convertir a formato Date si es necesario
                            fechaFin: new Date(fechaFin),
                            motivo: descripcion || 'No especificado',
                        }));

                    if (noDisponibilidadRecords.length > 0) {
                        // Verificar si ya existen registros solapados antes de insertar
                        const solapados = await NoDisponibilidad.findAll({
                            where: {
                                interesado_id: interesado.id,
                                [Op.or]: noDisponibilidadRecords.map(({ fechaInicio, fechaFin }) => ({
                                    [Op.and]: [
                                        { fechaInicio: { [Op.lte]: fechaFin } },
                                        { fechaFin: { [Op.gte]: fechaInicio } }
                                    ]
                                }))
                            }
                        });

                        if (solapados.length === 0) {
                            await NoDisponibilidad.bulkCreate(noDisponibilidadRecords, { transaction });
                        } else {
                            console.warn(`⚠️ Fechas solapadas para ${nombre_interesado}, no se insertaron.`);
                        }
                    }
                } catch (error) {
                    console.error(`⚠️ Error guardando fechas de no disponibilidad para ${nombre_interesado}:`, error);
                }
            }


            if (evaluacion && Object.keys(evaluacion).length > 0) {
                try {
                    await EvaluacionInteresado.create({
                        interesadoId: interesado.id,
                        compromiso: evaluacion.compromiso !== "" ? Number(evaluacion.compromiso) : null,
                        poder: evaluacion.poder !== "" ? Number(evaluacion.poder) : null,
                        influencia: evaluacion.influencia !== "" ? Number(evaluacion.influencia) : null,
                        conocimiento: evaluacion.conocimiento !== "" ? Number(evaluacion.conocimiento) : null,
                        interesActitud: evaluacion.interesActitud !== "" ? Number(evaluacion.interesActitud) : null,
                        valoracion: evaluacion.valoracion !== "" ? Number(evaluacion.valoracion) : null,
                        accionEstrategica: accionEstrategica || null,
                        responsableEstrategia: responsableEstrategia || null,
                        fecha_evaluacion: new Date(),
                    }, { transaction });
                } catch (error) {
                    console.error(`⚠️ Error guardando evaluación para ${nombre_interesado}:`, error);
                }
            }

            interesadosCreados.push(interesado);

            await saveLog({
                userId: usuarioId,
                actionType: 'STAKEHOLDER_CREATED',
                resourceType: 'Interesado',
                resourceId: interesado.id,
                details: {
                    nombre: interesado.nombre_interesado,
                    proyecto_id: interesado.proyecto_id
                }
            });
            interesadosCreados.push(interesado);
        }

        await transaction.commit();

        return {
            message: 'Interesados creados con éxito',
            data: interesadosCreados
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error al crear interesados:', error);
        throw new Error(`No se pudo crear los interesados: ${error.message}`);
    }
};


const getAllInteresados = async () => {
    try {
        // Realizamos la consulta de todos los interesados
        const items = await Interesado.findAll();
        return items; // Retornamos la data que encontramos (será un array vacío si no hay datos)
    } catch (error) {
        // Manejamos cualquier error que ocurra en la consulta
        console.error('Error al obtener los interesados:', error.message);
        throw new Error('No se pudieron obtener los datos de interesados. Intente nuevamente.');
    }
};


const updateInteresado = async (id, data, usuarioId) => {
    // --- Lógica de Logs: Capturar estado inicial ---
    const estadoAnterior = await Interesado.findOne({
        where: { id_interesado: data.id_interesado, proyecto_id: data.proyecto_id },
        include: [
            { model: NoDisponibilidad, as: 'NoDisponibilidad' },
            { model: EvaluacionInteresado, as: 'EvaluacionInteresado' } // 💡 Cambio de 'Evaluaciones' a 'EvaluacionInteresado'
        ]
    });
    // ----------------------------------------------

    const transaction = await db.transaction();

    try {
        const {
            proyecto_id,
            id_interesado,
            nombre_interesado,
            telefono,
            email,
            otrosDatos,
            codigo,
            rol,
            cargo,
            companiaClasificacion,
            expectativasProyecto,
            fechasNoDisponibilidad,
            evaluacion,
            evaluaciones,
            accionEstrategica,
            responsableEstrategia,
            id_interesados
        } = data;

        // Buscar interesado por ID y proyecto
        const interesado = await Interesado.findOne({
            where: { id_interesado, proyecto_id },
        });

        if (!interesado) {
            throw new Error(`Interesado con id ${id_interesado} y proyecto_id ${proyecto_id} no encontrado`);
        }

        // Actualizar datos principales
        await interesado.update(
            {
                nombre_interesado,
                telefono,
                email,
                otros_datos_contacto: otrosDatos,
                codigo,
                rol,
                cargo,
                compania_clasificacion: companiaClasificacion,
                expectativas: expectativasProyecto,
            },
            { transaction }
        );

        if (fechasNoDisponibilidad) {

            // 1. Obtener los IDs de las fechas que DEBEN MANTENERSE (las que vienen en el payload y ya tienen un ID real)
            const datesToKeepIds = fechasNoDisponibilidad
                // Filtramos por ID y excluimos IDs temporales que genera el frontend (ej: 'temp-1000')
                .filter(noDisp => noDisp.id && !String(noDisp.id).startsWith('temp-'))
                .map(noDisp => noDisp.id);

            // 2. ELIMINAR todos los registros de NoDisponibilidad que NO están en la lista `datesToKeepIds`
            // Esto borra los elementos que fueron eliminados desde el frontend.
            await NoDisponibilidad.destroy({
                where: {
                    interesadoId: id_interesados,
                    id: { [Op.notIn]: datesToKeepIds } // Usamos Op.notIn para borrar los IDs que NO están en la lista
                },
                transaction,
            });

            // 3. Crear/Actualizar las fechas restantes
            for (const noDisp of fechasNoDisponibilidad) {
                // Verificar si es una fecha existente (tiene ID real) o una nueva (no tiene ID o tiene ID temporal)
                if (noDisp.id && !String(noDisp.id).startsWith('temp-')) {
                    // Actualizar existente
                    await NoDisponibilidad.update(
                        {
                            fechaInicio: noDisp.fechaInicio,
                            fechaFin: noDisp.fechaFin,
                            motivo: noDisp.motivo,
                        },
                        {
                            where: { id: noDisp.id, interesadoId: id_interesados },
                            transaction,
                        }
                    );
                } else {
                    // Crear nueva
                    await NoDisponibilidad.create(
                        {
                            interesadoId: id_interesados,
                            fechaInicio: noDisp.fechaInicio,
                            fechaFin: noDisp.fechaFin,
                            motivo: noDisp.motivo,
                        },
                        { transaction }
                    );
                }
            }
        }
        // =========================================================

        // Normalizar evaluaciones (El resto de tu código no necesita cambios)
        let evaluacionesToProcess = [];
        if (Array.isArray(evaluaciones)) {
            evaluacionesToProcess = evaluaciones;
        } else if (evaluacion) {
            evaluacionesToProcess = [evaluacion];
        }

        // Manejo de evaluaciones del interesado
        // FIX: Cambiar 'eval' por 'evaluationData' para evitar el error de 'strict mode'.
        for (const evaluationData of evaluacionesToProcess) {
            // ... (Lógica de Actualizar/Crear EvaluacionInteresado - Mantenida igual)
            if (evaluationData.id) {
                await EvaluacionInteresado.update(
                    {
                        compromiso: normalizeNumericField(evaluationData.compromiso),
                        poder: normalizeNumericField(evaluationData.poder),
                        influencia: normalizeNumericField(evaluationData.influencia),
                        conocimiento: normalizeNumericField(evaluationData.conocimiento),
                        interesActitud: normalizeNumericField(evaluationData.interesActitud),
                        valoracion: normalizeNumericField(evaluationData.valoracion),

                        accionEstrategica: evaluationData.accionEstrategica || accionEstrategica,
                        responsableEstrategia: evaluationData.responsableEstrategia || responsableEstrategia,
                        fechaEvaluacion: evaluationData.fechaEvaluacion || new Date(),
                    },
                    {
                        where: { id: evaluationData.id, interesadoId: id_interesados },
                        transaction,
                    }
                );
            } else {
                await EvaluacionInteresado.create(
                    {
                        interesadoId: id_interesados,
                        compromiso: normalizeNumericField(evaluationData.compromiso),
                        poder: normalizeNumericField(evaluationData.poder),
                        influencia: normalizeNumericField(evaluationData.influencia),
                        conocimiento: normalizeNumericField(evaluationData.conocimiento),
                        interesActitud: normalizeNumericField(evaluationData.interesActitud),
                        valoracion: normalizeNumericField(evaluationData.valoracion),

                        accionEstrategica: evaluationData.accionEstrategica || accionEstrategica,
                        responsableEstrategia: evaluationData.responsableEstrategia || responsableEstrategia,
                        fechaEvaluacion: evaluationData.fechaEvaluacion || new Date(),
                    },
                    { transaction }
                );
            }
        }


        // --- Lógica de Logs: Comparar y Guardar ---
        if (estadoAnterior) {
            const changes = {};
            const trackChange = (key, oldVal, newVal) => {
                if (oldVal !== newVal && newVal !== undefined) {
                    changes[key] = { old: oldVal, new: newVal };
                }
            };

            trackChange('nombre', estadoAnterior.nombre_interesado, nombre_interesado);
            trackChange('email', estadoAnterior.email, email);
            trackChange('telefono', estadoAnterior.telefono, telefono);
            trackChange('rol', estadoAnterior.rol, rol);
            trackChange('cargo', estadoAnterior.cargo, cargo);
            trackChange('expectativas', estadoAnterior.expectativas, expectativasProyecto);

            // Comparación de evaluaciones (usando el alias correcto también aquí)
            if (JSON.stringify(estadoAnterior.EvaluacionInteresado) !== JSON.stringify(evaluacionesToProcess)) {
                changes['evaluacion'] = { info: "Se actualizaron los datos de evaluación o estrategia" };
            }

            if (Object.keys(changes).length > 0) {
                await saveLog({
                    userId: usuarioId,
                    actionType: 'STAKEHOLDER_UPDATED',
                    resourceType: 'Interesado',
                    resourceId: interesado.id,
                    details: {
                        nombre: interesado.nombre_interesado,
                        changed_fields: changes
                    }
                });
            }
        }
        // ------------------------------------------
        await transaction.commit();
        return { message: "Interesado actualizado exitosamente", interesado };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


    // const getInteresadoListById = async (id) => {
    //     try {
    //         // Busca el interesado por su ID
    //         const interesado = await Interesado.findByPk(id);

    //         // Si no se encuentra el interesado, lanza un error
    //         if (!interesado) {
    //             throw new Error('Interesado no encontrado');
    //         }

    //         // Retorna el interesado encontrado
    //         return interesado;
    //     } catch (error) {
    //         // Maneja errores de la consulta
    //         console.error('Error al obtener el interesado por ID:', error.message);
    //         throw new Error('No se pudo obtener el interesado. Intente nuevamente.');
    //     }
    // };

const getInteresadoById = async (id) => {
    try {
        const interesado = await Interesado.findOne({
            where: { id: id },  // Ajusta aquí si necesitas buscar por proyecto_id
            include: [
                {
                    model: EvaluacionInteresado,
                    as: 'EvaluacionInteresado',
                    attributes: ['id', 'compromiso' , 'poder', 'influencia', 'conocimiento', 'interesActitud', 'valoracion', 'accionEstrategica', 'responsableEstrategia', 'fechaEvaluacion'],
                },
                {
                    model: NoDisponibilidad,
                    as: 'NoDisponibilidad',
                    attributes: ['id', 'interesadoId', 'fechaInicio', 'fechaFin', 'motivo'],
                },
            ],
        });

        if (!interesado) {
            // Mensaje de error si no se encuentran interesados
            //console.log("No se encontraron interesados para el proyecto especificado");
            return null;
        }

        return interesado;
    } catch (error) {
        console.error("Error al obtener el interesado:", error.message);
        throw error;
    }
};

const getInteresadosById = async (id) => {
    try {
        // Realiza la búsqueda de interesado solo con id y nombre
        const interesado = await Interesado.findAll({
            where: { proyecto_id: id },  // Filtra por el id del proyecto
            attributes: 
            [
                'id', 'codigo', 'nombre_interesado', 'rol', 'cargo', 'compania_clasificacion', 'proyecto_id', 'email', 'fecha_creacion',
                // aqui va la evaluacion
            ], 
            include: [
                {
                    model: EvaluacionInteresado,
                    as: 'EvaluacionInteresado', // Asegúrate de que este alias coincide con el definido en la relación
                    attributes: [
                        'id',  'valoracion', 'fechaEvaluacion'
                    ]
                }
            ]
        });

        if (!interesado) {
            // Si no se encuentra el interesado, retorna null
            return null;
        }

        return interesado;  // Retorna el objeto con id y nombre_interesado
    } catch (error) {
        console.error("Error al obtener el interesado:", error.message);
        throw error;  // Lanza el error para que lo manejes en el llamado
    }
};


// Eliminar un interesado
const deleteInteresado = async (interesadoId, usuarioId) => {

    const interesado = await Interesado.findByPk(interesadoId);
    if (!interesado) throw new Error("Interesado no encontrado");


    const t = await db.transaction(); // Iniciar transacción

    try {

        const nombreEliminado = interesado.nombre_interesado;
        // Primero eliminamos las fechas de no disponibilidad asociadas al interesado
        await NoDisponibilidad.destroy({
            where: { interesadoId },
            transaction: t,
        });

        // Luego eliminamos las evaluaciones asociadas al interesado
        await EvaluacionInteresado.destroy({
            where: { interesadoId },
            transaction: t,
        });

        // Finalmente eliminamos al interesado
        const interesado = await Interesado.destroy({
            where: { id: interesadoId },
            transaction: t,
        });

        await saveLog({
            userId: usuarioId,
            actionType: 'STAKEHOLDER_DELETED',
            resourceType: 'Interesado',
            resourceId: interesadoId,
            details: { nombre: nombreEliminado, info: "Eliminación completa de interesado y registros asociados" }
        });

        // Confirmar transacción
        await t.commit();

        return interesado; // Retorna el interesado eliminado
    } catch (error) {
        // Si ocurre un error, revertir la transacción
        await t.rollback();
        throw error; // Lanza el error para manejo posterior
    }
};

module.exports = {
    createInteresados,
    getAllInteresados,
    getInteresadoById,
    getInteresadosById,
    updateInteresado,
    deleteInteresado,
};
