const { TipoProyecto } = require('../models/index');

const getAllTipoProyecto = async () => {
  const items = await TipoProyecto.findAll();
  return items;
};

const getActiveTipoProyecto = async () => {
  const items = await TipoProyecto.findAll({
    where: {
      activo: true,
    },
  });
  return items;
};

const getTipoProyectoById = async (id) => {
  const item = await TipoProyecto.findOne({
    where: {
      id,
    },
  });

  return item;
};

const createTipoProyecto = async (data) => {
  const { nombre, descripcion } = data;

  const tipoProyecto = await TipoProyecto.create({
    nombre,
    descripcion,
    fecha_creacion: null,
    activo: true,
  });

  return tipoProyecto;
};

module.exports = {
  getAllTipoProyecto,
  getActiveTipoProyecto,
  getTipoProyectoById,
  createTipoProyecto,
};
