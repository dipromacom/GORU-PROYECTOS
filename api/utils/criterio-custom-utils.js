const {
  CriterioCustom, TipoEvaluacion, OpcionCustom,
} = require('../models/index');

const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

const getCriterioCustomByUsuarioId = async (usuarioId, activo) => {
  const items = await CriterioCustom.findAll({
    where: {
      usuario: usuarioId,
      activo,
    }
  })

  return items;
}

const getCriterioCustomById = async (id) => {
  const item = await CriterioCustom.findOne({
    where: { id },
    include: [
      {
        model: TipoEvaluacion,
        as: 'TipoEvaluacion',
      },
      {
        model: OpcionCustom,
        as: 'OpcionCustom',
      },
    ],
    order: [
       [{ model: OpcionCustom, as: 'OpcionCustom' }, 'puntos', 'DESC'],
    ],
  });

  return item;
};

const updateCriterioCustomById = async (id, data) => {
  try {

    const criterio = await getCriterioCustomById(id);
    await criterio.update({
      descripcion: data.descripcion,
      orden: data.orden,
      peso_limite: data.peso_limite,
    });
    return true;
  } catch (error) {
    return false;
  }
}

const deactivateCriterioCustomById = async (id) => {
  try {

    const criterio = await getCriterioCustomById(id);
    await criterio.update({
      activo: false
    });
    return true;
  } catch (error) {
    return false;
  }
}

const addCriterioCustom = async (data) => {
  try {
    const { descripcion, orden, pesoLimite, tipoEvaluacionId, batchId, usuarioId } = data;
    const criterioCustom = await CriterioCustom.create({
      tipo_evaluacion: tipoEvaluacionId,
      batch: batchId,
      usuario: usuarioId,
      descripcion: descripcion,
      orden: orden,
      peso_limite: pesoLimite,
      activo: true,
    });

    return criterioCustom;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "addCriterioCustom()",
      params: data
    });

    throw error;
  }
  
}

module.exports = {
  getCriterioCustomByUsuarioId,
  getCriterioCustomById,
  updateCriterioCustomById,
  deactivateCriterioCustomById,
  addCriterioCustom
}