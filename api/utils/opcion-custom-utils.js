const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

const {
  OpcionCustom, CriterioCustom,
} = require('../models/index');
const { getCriterioCustomById } = require('./criterio-custom-utils');

const getOpcionCustomById = async (id) => {
  const item = await OpcionCustom.findOne({
    where: { id },
    include: {
      model: CriterioCustom,
      as: 'CriterioCustom',
    },
  });

  return item;
};

const updateOpcionCustomById = async (id, data) => {
  try {

    const opcion = await getOpcionCustomById(id);
    await opcion.update({
      descripcion:data.descripcion,
      orden: data.orden,
      puntos: data.puntos,
    });
    return true;
  } catch (error) {
    return false;
  }
};

const deactivateOpcionCustomById = async (id, data) => {
  try {

    const opcion = await getOpcionCustomById(id);
    await opcion.update({
      activo: false
    });
    return true;
  } catch (error) {
    return false;
  }
};

const addOpcionCustom = async (data) => {
  try {
    const { descripcion, orden, puntos, criterioId } = data;
    const opcionCustom = await OpcionCustom.create({
      criterio_custom: criterioId,
      descripcion: descripcion,
      orden: orden,
      puntos: puntos,
      activo: true,
    });

    return opcionCustom;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "addOpcionCustom()",
      params: data,
    });

    throw error;
  }
} 

module.exports = {
  getOpcionCustomById,
  updateOpcionCustomById,
  deactivateOpcionCustomById,
  addOpcionCustom,
};
