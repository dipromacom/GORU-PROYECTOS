const { TipoDireccion } = require('../models/index');

const getAllTipoDireccion = async () => {
  const items = await TipoDireccion.findAll();
  return items;
};

const getActiveTipoDireccion = async () => {
  const items = await TipoDireccion.findAll({
    where: {
      activo: true,
    },
  });
  return items;
};

const getTipoDireccionById = async (id) => {
  const item = await TipoDireccion.findOne({
    where: {
      id,
    },
  });

  return item;
};

module.exports = {
  getAllTipoDireccion, getActiveTipoDireccion, getTipoDireccionById,
};
