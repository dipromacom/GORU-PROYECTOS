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

const createInteresados = async (data) => {
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


            if (Object.keys(evaluacion).length > 0) {
                try {
                    await EvaluacionInteresado.create({
                        interesadoId: interesado.id,
                        compromiso: limpiarValor(evaluacion.compromiso),
                        poder: limpiarValor(evaluacion.poder),
                        influencia: limpiarValor(evaluacion.influencia),
                        conocimiento: limpiarValor(evaluacion.conocimiento),
                        interesActitud: limpiarValor(evaluacion.interesActitud),
                        valoracion: evaluacion.valoracion !== "" ? evaluacion.valoracion : null,
                        accionEstrategica: limpiarValor(accionEstrategica),
                        responsableEstrategia: limpiarValor(responsableEstrategia),
                        fecha_evaluacion: new Date(),
                    }, { transaction });
                } catch (error) {
                    console.error(`⚠️ Error guardando evaluación para ${nombre_interesado}:`, error);
                }
            }

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


const updateInteresado = async (id, data) => {
    const transaction = await db.transaction();

    const {
        proyecto_id,
        nombre_interesado,
        telefono,
        email,
        otros_datos_contacto,
        codigo,
        rol,
        cargo,
        compania_clasificacion,
        expectativas,
        fechasNoDisponibilidad, // Array de objetos { id, fechaInicio, fechaFin, motivo }
        evaluaciones, // Array de objetos { id, compromiso, poder, etc. }
    } = data;

    try {
        // Buscar interesado por ID y proyecto
        const interesado = await Interesado.findOne({
            where: { id, proyecto_id },
        });

        if (!interesado) {
            throw new Error(`Interesado con id ${id} y proyecto_id ${proyecto_id} no encontrado`);
        }

        // Actualizar datos del interesado
        await interesado.update(
            {
                nombre_interesado,
                telefono,
                email,
                otros_datos_contacto,
                codigo,
                rol,
                cargo,
                compania_clasificacion,
                expectativas,
            },
            { transaction }
        );

        // Manejo de fechas de no disponibilidad
        if (fechasNoDisponibilidad && fechasNoDisponibilidad.length > 0) {
            for (const noDisp of fechasNoDisponibilidad) {
                if (noDisp.id) {
                    // Actualizar si existe
                    await NoDisponibilidad.update(
                        {
                            fechaInicio: noDisp.fechaInicio,
                            fechaFin: noDisp.fechaFin,
                            motivo: noDisp.motivo,
                        },
                        {
                            where: { id: noDisp.id, interesadoId: id },
                            transaction,
                        }
                    );
                } else {
                    // Crear nuevo registro
                    await NoDisponibilidad.create(
                        {
                            interesadoId: id,
                            fechaInicio: noDisp.fechaInicio,
                            fechaFin: noDisp.fechaFin,
                            motivo: noDisp.motivo,
                        },
                        { transaction }
                    );
                }
            }
        }

        // Manejo de evaluaciones del interesado
        if (evaluaciones && evaluaciones.length > 0) {
            for (const eval of evaluaciones) {
                if (eval.id) {
                    // Actualizar si existe
                    await EvaluacionInteresado.update(
                        {
                            compromiso: eval.compromiso,
                            poder: eval.poder,
                            influencia: eval.influencia,
                            conocimiento: eval.conocimiento,
                            interesActitud: eval.interesActitud,
                            valoracion: eval.valoracion,
                            accionEstrategica: eval.accionEstrategica,
                            responsableEstrategia: eval.responsableEstrategia,
                            fechaEvaluacion: eval.fechaEvaluacion,
                        },
                        {
                            where: { id: eval.id, interesadoId: id },
                            transaction,
                        }
                    );
                } else {
                    // Crear nuevo registro
                    await EvaluacionInteresado.create(
                        {
                            interesadoId: id,
                            compromiso: eval.compromiso,
                            poder: eval.poder,
                            influencia: eval.influencia,
                            conocimiento: eval.conocimiento,
                            interesActitud: eval.interesActitud,
                            valoracion: eval.valoracion,
                            accionEstrategica: eval.accionEstrategica,
                            responsableEstrategia: eval.responsableEstrategia,
                            fechaEvaluacion: eval.fechaEvaluacion || new Date(),
                        },
                        { transaction }
                    );
                }
            }
        }

        // Confirmar transacción
        await transaction.commit();

        return { message: "Interesado actualizado exitosamente", interesado };
    } catch (error) {
        // Revertir transacción en caso de error
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
const deleteInteresado = async (interesadoId) => {
    const t = await db.transaction(); // Iniciar transacción

    try {
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
