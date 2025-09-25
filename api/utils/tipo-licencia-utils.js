const { TipoLicencia, Menu, PermisoLicencia } = require('../models/index');
const MenuUtils = require('./menu-utils');

const getAllTipoLicencia = async () => {
  const items = await TipoLicencia.findAll();
  return items;
};

const getActiveTipoLicencia = async () => {
  const items = await TipoLicencia.findAll({
    where: {
      activo: true,
    },
  });
  return items;
};

const getTipoLicenciaById = async (id) => {
  const item = await TipoLicencia.findOne({
    where: {
      id,
    },
  });

  return item;
};

const createTipoLicencia = async (data) => {
  const { nombre, descripcion } = data;

  const tipoLicencia = await TipoLicencia.create({
    nombre,
    descripcion,
    fecha_creacion: null,
    activo: true,
  });

  return tipoLicencia;
};

const getPermisosByTipoLicenciaId = async (id) => {
  const item = await TipoLicencia.findOne({
    where: {
      id,
    },
    include: {
      model: PermisoLicencia,
      as: 'Menu',
      include: {
        model: Menu,
        as: 'Menu',
      },
    },
  });

  return item;
};

const addMenu = async (id, data) => {
  const tipoLicencia = await getTipoLicenciaById(id);

  const { menuId } = data;
  const menu = await MenuUtils.getMenuById(menuId);
  const result = await tipoLicencia.addPermisoLicencia(menu, {
    through: {
      fecha_creacion: null,
    },
  });

  return result;
};

module.exports = {
  getAllTipoLicencia,
  getActiveTipoLicencia,
  getTipoLicenciaById,
  createTipoLicencia,
  getPermisosByTipoLicenciaId,
  addMenu,
};
