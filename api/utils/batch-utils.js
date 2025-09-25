const db = require('../db');
const { Batch, CriterioCustom, Criterio, Opcion, OpcionCustom, Evaluacion, Proyecto, Persona, DirectorProyecto, Departamento } = require('../models/index');
const TipoEvaluacionUtils = require('./tipo-evaluacion-utils');
const { Op,literal } = require('sequelize');

const logger = require('../logger/logger');
const path = require('path');
const batch = require('../models/batch');
const file = path.basename(__filename);

const createBatch = async (usuarioId, data) => {
  try {
    const { nombre, descripcion, paso_actual } = data;

    const date = new Date();
    const batch = await Batch.create({
      nombre,
      descripcion,
      periodo: date.getFullYear(),
      usuario: usuarioId,
      activo: true,
      cerrado: false,
      paso_actual: paso_actual,
      setup_terminado: false,
    });
  
    return batch;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "createBatch()",
      params: { usuarioId, data }
    });

    throw error;
  }
};

const usuarioHasActiveBatch = async (usuarioId) => {
  const items = await Batch.findAll({
    where: {
      usuario: usuarioId,
      activo: true,
      cerrado: false,
    },
  });

  return items;
};

const getActiveBatch = async (usuarioId) => {
  const items = await Batch.findAll({
    where: {
      usuario: usuarioId,
      activo: true,
      cerrado: false,
    },
    include: {
      model: Evaluacion,
      as: 'Evaluacion',
    },
    order: [
      [ 'id', 'DESC'],
    ],
  });

  if (items.length) {
    return items[0];
  }

  return null;
};

const getLastClosedBatch = async (usuarioId) => {
  const items = await Batch.findAll({
    where: {
      usuario: usuarioId,
      activo: true,
      cerrado: true,
    },
    order: [
      [ 'id', 'DESC'],
    ],
  });

  if (items.length) {
    return items[0];
  }

  return null;
};

const updatePasoActual = async (batch, paso_actual) => {
  try {
    await batch.update({
      paso_actual: paso_actual
    });
    return true;
  } catch (error) {
    return false;
  } 
}

const startBatchSetup = async (batchId, usuarioId, tipoEvaluacionId) => {
  try {

    const transaction = await db.transaction();
    await CriterioCustom.destroy({
      where: {
        usuario: usuarioId,
        tipo_evaluacion: tipoEvaluacionId,
        batch: batchId
      }
    }, { transaction });

    const criterios = await Criterio.findAll({
      where: {
        activo: true
      },
      include: {
        model: Opcion,
        as: 'Opcion'
      }
    });

    for (criterio of criterios) {
      let criterioCustom = await CriterioCustom.create({
        usuario: usuarioId,
        tipo_evaluacion: tipoEvaluacionId,
        descripcion: criterio.descripcion,
        orden: criterio.orden,
        peso_limite: criterio.peso_limite,
        activo: true,
        batch: batchId
      }, { transaction });

      const opcionesCustom = criterio.Opcion.map(opcion => {
        return {
          descripcion: opcion.descripcion,
          orden: opcion.orden,
          puntos: opcion.puntos,
          activo: true,
          criterio_custom: criterioCustom.id
        }
      });

      await OpcionCustom.bulkCreate(opcionesCustom, { transaction });
    }

    await transaction.commit();
    return true;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "startBatchSetup()",
      params: { batchId, usuarioId, tipoEvaluacionId }
    });

    await transaction.rollback();
    return false;
  }
}

const updateBatchSetup = async (batchId) => {
  try {
    const batch = await Batch.findOne({ where: { id: batchId }});
    await batch.update({
      setup_terminado: true
    });

    return true;
  } catch (error) {
    return false;
  }
}

const validatePesocriterios = async (usuarioId, tipoEvaluacionId) => {
  let opciones = await TipoEvaluacionUtils.getOpcionesCustomByTipoEvaluacionUsuario(tipoEvaluacionId, usuarioId);
  if (opciones === null) {
    opciones = await TipoEvaluacionUtils.getOpcionesByTipoEvaluacion(tipoEvaluacionId);
  } 

  const criterios = opciones.Criterio ? opciones.Criterio : opciones.CriterioCustom;
  const total = criterios.reduce((acum, criterio) => acum += Number(criterio.peso_limite), 0);

  return total - 100;
}

const closeBatch = async (batchId) => {
  try {
    await Batch.update(
      { cerrado: true }, 
      { where: { id: batchId } }
    );
    return true;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "closeBatch()",
      params: batchId
    });

    return false;
  } 
}

const getClosedBatches = async (usuarioId) => {
  const items = await Batch.findAll({
    where: { usuario: usuarioId, cerrado: true },
    order: [
      ['id', 'DESC'],
    ],
  });

  return items;
}

const getBatchDetailsById = async (usuarioId, batchId) => {
  const item = await Batch.findOne({
    where: {
      usuario: usuarioId,
      id: batchId,
      cerrado: true,
    },
    include: {
      model: Evaluacion,
      as: 'Evaluacion',
      attributes: ['id', 'fecha_creacion', 'puntaje_total', 'peso_total'],
      include: {
        model: Proyecto,
        as: 'Proyecto',
        attributes: ['id', 'numero', 'nombre'],
      },
    },
    order: [
      [ { model: Evaluacion, as: 'Evaluacion' }, 'peso_total', 'DESC'],
    ]
  });

  return item;
}

const getBatchByProjectId = async (usuarioId, projectId) => {
  const items = Batch.findOne({
    where: {
      id: {
        [Op.in]: literal(`(SELECT batch from evaluacion where proyecto = ${projectId})`)
      },
    },
    include: {
      model: Evaluacion,
      as: 'Evaluacion',
      attributes: ['id', 'fecha_creacion', 'puntaje_total', 'peso_total'],
      include: {
        model: Proyecto,
        as: 'Proyecto',
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
      order: [
        [ { model: Evaluacion, as: 'evaluacion' }, 'peso_total', 'DESC'],
      ]
    }
  })
  return items
}

module.exports = {
  createBatch,
  usuarioHasActiveBatch,
  getActiveBatch,
  updatePasoActual,
  startBatchSetup,
  updateBatchSetup,
  validatePesocriterios,
  getLastClosedBatch,
  closeBatch,
  getClosedBatches,
  getBatchDetailsById,
  getBatchByProjectId
};