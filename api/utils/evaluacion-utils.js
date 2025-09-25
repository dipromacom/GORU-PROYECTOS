/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const path = require('path');
const db = require('../db');
const {
  Persona, Patrocinador, DirectorProyecto, Proyecto, Departamento, Evaluacion, EvaluacionDetalle,
} = require('../models/index');
const StringUtils = require("./string-utils");
const DateUtils = require("./date-utils");
const CriterioUtils = require("./criterio-utils");
const OpcionUtils = require("./opcion-utils");
const OpcionCustomUtils = require("./opcion-custom-utils");
const CriterioCustomUtils = require("./criterio-custom-utils");
const BatchUtils = require("./batch-utils");

const logger = require('../logger/logger');

const file = path.basename(__filename);

const saveEvaluacion = async (usuario, data) => {
  const {
    numeroProyecto,
    nombreProyecto,
    directorProyecto: directorProyectoDetails,
    patrocinadorProyecto: patrocinadorProyectoDetails,
    departamento: departamentoNombre,
    informacionBreve,
    opciones: criterios,
  } = data;

  const transaction = await db.transaction();
  let directorProyecto;
  let patrocinador;
  let departamento;
  let proyecto;
  let persona;

  try {
    if (directorProyectoDetails !== undefined) {
      const { nombre, apellido } = StringUtils.getNombreApellidoFromStr(directorProyectoDetails);

      persona = await Persona.create({
        nombre,
        apellido,
        fecha_creacion: DateUtils.getLocalDate(),
        activo: true,
      }, { transaction });

      directorProyecto = await persona.createDirectorProyecto({
        fecha_creacion: DateUtils.getLocalDate(),
        activo: true,
      }, { transaction });
    }

    if (patrocinadorProyectoDetails !== undefined) {
      if (patrocinadorProyectoDetails.toLowerCase() !== directorProyectoDetails.toLowerCase()) {
        const { nombre, apellido } = StringUtils.getNombreApellidoFromStr(patrocinadorProyectoDetails);

        persona = await Persona.create({
          nombre,
          apellido,
          fecha_creacion: DateUtils.getLocalDate(),
          activo: true,
        }, { transaction });
      }

      patrocinador = await persona.createPatrocinador({
        fecha_creacion: DateUtils.getLocalDate(),
        activo: true,
      }, { transaction });
    }

    if (departamentoNombre !== undefined) {
      departamento = await Departamento.create({
        nombre: departamentoNombre,
        fecha_creacion: DateUtils.getLocalDate(),
        activo: true,
      }, { transaction });
    }
    console.log("crea proyecto");
    if (nombreProyecto !== undefined) {
      proyecto = await Proyecto.create({
        // numero: numeroProyecto,
        nombre: nombreProyecto,
        director: directorProyecto.id,
        patrocinador: patrocinador.id,
        departamento: departamento.id,
        informacion: informacionBreve,
        fecha_creacion: DateUtils.getLocalDate(),
        activo: true,
        estado: 'C',
        modo: 'P'
      }, { transaction });
    }

    const batch = await BatchUtils.getActiveBatch(usuario.id);

    const evaluacion = await Evaluacion.create({
      tipo_evaluacion: 1,
      proyecto: proyecto.id,
      usuario: usuario.id,
      fecha_creacion: DateUtils.getLocalDate(),
      batch: batch.id,
    }, { transaction });

    const criteriosCustom = await CriterioCustomUtils.getCriterioCustomByUsuarioId(usuario.id, true);
    const isCustom = criteriosCustom.length > 0;

    let puntajeTotal = 0;
    let pesoTotal = 0;
    await Promise.all(
      criterios.map(async (criterio) => {
        let criterioDb;
        if (isCustom === true) {
          criterioDb = await CriterioCustomUtils.getCriterioCustomById(criterio.id);
        } else {
          criterioDb = await CriterioUtils.getCriterioById(criterio.id);
        }

        const opciones = criterioDb.Opcion !== undefined ? criterioDb.Opcion : criterioDb.OpcionCustom;
        const maxPuntosCriterio = opciones[0].puntos;
        const pesoLimiteCriterio = criterioDb.peso_limite;

        const opcionSelected = criterio.opciones.filter((opcion) => opcion.selected === true);
        let puntaje = 0;
        let opcionId = null;
        if (opcionSelected.length > 0) {
          let opcionDb;
          if (isCustom) {
            opcionDb = await OpcionCustomUtils.getOpcionCustomById(opcionSelected[0].id);
          } else {
            opcionDb = await OpcionUtils.getOpcionById(opcionSelected[0].id);
          }
          puntaje = opcionDb.puntos;
          opcionId = opcionDb.id;
        }

        puntajeTotal += parseFloat(puntaje);
        const pesoObtenidoCriterio = (puntaje / maxPuntosCriterio) * pesoLimiteCriterio;
        pesoTotal += pesoObtenidoCriterio;

        const evaluacionDetalle = await EvaluacionDetalle.create({
          evaluacion: evaluacion.id,
          opcion: isCustom ? null : opcionId,
          opcion_custom: isCustom ? opcionId : null,
          puntaje,
          peso_obtenido: pesoObtenidoCriterio,
          peso_limite: pesoLimiteCriterio,
        }, { transaction });
      })
    );

    await evaluacion.update({
      puntaje_total: puntajeTotal,
      peso_total: pesoTotal
    }, { transaction });

    await transaction.commit();
    return true;
  } catch (e) {
    logger.error({
      message: e.message,
      source: file,
      method: "saveEvaluacion()",
      params: data
    });

    await transaction.rollback();
    throw e;
  }
};

const getEvaluacionResult = async (usuario, batchId, tipoEvaluacionId) => {
  const items = await Evaluacion.findAll({
    where: {
      tipo_evaluacion: tipoEvaluacionId,
      usuario: usuario.id,
      batch: batchId,
    },
    attributes: ['id', 'fecha_creacion', 'puntaje_total', 'peso_total'],
    include: [
      {
        model: Proyecto,
        as: 'Proyecto',
        attributes: ['id', 'numero', 'nombre', 'estado'],
        include: [
          {
            model: DirectorProyecto,
            as: 'DirectorProyecto',
            attributes: ['id'],
            include: {
              model: Persona,
              as: 'Persona',
              attributes: ['nombre', 'apellido'],
            }
          },
          {
            model: Departamento,
            as: 'Departamento',
          },
        ]
      },
    ],
    order: [
      ['peso_total', 'DESC'],
    ],
  });

  return items;
};

const findEvaluacionByBatchAndNumero = async (batchId, numero) => {
  const items = await Evaluacion.findAll({
    where: { batch: batchId },
    include: {
      model: Proyecto,
      as: 'Proyecto',
      attributes: ['numero'],
    },
  }).then((evaluaciones) => evaluaciones.filter((evaluacion) => evaluacion.Proyecto.numero === numero && evaluacion));

  return items;
}

module.exports = {
  saveEvaluacion,
  getEvaluacionResult,
  findEvaluacionByBatchAndNumero,
}
