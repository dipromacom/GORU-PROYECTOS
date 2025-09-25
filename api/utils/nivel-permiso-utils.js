const { NivelPermiso } = require('../models/index');

const getAllNivelPermiso = async () => {
  const items = await NivelPermiso.findAll();
  return items;
};

const getActiveNivelPermiso = async () => {
  const items = await NivelPermiso.findAll({
    where: {
      activo: true,
    },
  });
  return items;
};

const getNivelPermisoById = async (id) => {
  const item = await NivelPermiso.findOne({
    where: {
      id,
    },
  });

  return item;
};

module.exports = {
  getAllNivelPermiso, getActiveNivelPermiso, getNivelPermisoById,
};
