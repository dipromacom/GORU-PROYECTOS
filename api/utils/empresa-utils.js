const { Op, fn, col, where: sequelizeWhere } = require('sequelize');
const { Empresa } = require('../models/index');

const cleanString = (value) => (typeof value === 'string' ? value.trim() : value);

const getAllEmpresa = async () => {
  const items = await Empresa.findAll();
  return items;
};

const getActiveEmpresa = async () => {
  const items = await Empresa.findAll({
    where: {
      activo: true,
    },
  });
  return items;
};

const getEmpresaById = async (id) => {
  const item = await Empresa.findOne({
    where: {
      id,
    },
  });

  return item;
};

const existsEmpresaNombreCaseInsensitive = async (nombre, excludeId = null) => {
  if (!nombre) return false;
  const conditions = [sequelizeWhere(fn('lower', fn('btrim', col('nombre'))), nombre.trim().toLowerCase())];

  if (excludeId !== null) {
    conditions.push({ id: { [Op.ne]: excludeId } });
  }

  const count = await Empresa.count({ where: { [Op.and]: conditions } });
  return count > 0;
};

const createEmpresa = async (data) => {
  const { tipoIdentificacion, identificacion, nombre } = data;

  const empresa = await Empresa.create({
    tipo_identificacion: cleanString(tipoIdentificacion) || null,
    identificacion: cleanString(identificacion) || null,
    nombre: nombre.trim(),
    fecha_creacion: null,
    activo: true,
  });

  return empresa;
};

const updateEmpresa = async (id, data) => {
  const { tipoIdentificacion, identificacion, nombre, activo } = data;
  const empresa = await Empresa.findByPk(id);
  if (!empresa) return null;

  await empresa.update({
    tipo_identificacion: tipoIdentificacion !== undefined ? cleanString(tipoIdentificacion) : empresa.tipo_identificacion,
    identificacion: identificacion !== undefined ? cleanString(identificacion) : empresa.identificacion,
    nombre: nombre !== undefined ? nombre.trim() : empresa.nombre,
    activo: activo !== undefined ? activo : empresa.activo,
  });

  return empresa;
};

module.exports = {
  getAllEmpresa,
  getActiveEmpresa,
  getEmpresaById,
  existsEmpresaNombreCaseInsensitive,
  createEmpresa,
  updateEmpresa,
};
