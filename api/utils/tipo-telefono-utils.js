const { TipoTelefono } = require('../models/index');

const getAllTipoTelefono = async () => {
  const items = await TipoTelefono.findAll();
  return items;
};

const getActiveTipoTelefono = async () => {
  const items = await TipoTelefono.findAll({
    where: {
      activo: true,
    },
  });
  return items;
};

const getTipoTelefonoById = async (id) => {
  const item = await TipoTelefono.findOne({
    where: {
      id,
    },
  });

  return item;
};

module.exports = {
  getAllTipoTelefono, getActiveTipoTelefono, getTipoTelefonoById,
};
