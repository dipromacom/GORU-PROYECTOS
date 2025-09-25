const { Empresa } = require('../models/index');

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

const createEmpresa = async (data) => {
  const { tipoIdentificacion, identificacion, nombre } = data;

  const empresa = await Empresa.create({
    tipo_identificacion: tipoIdentificacion,
    identificacion,
    nombre,
    fecha_creacion: null,
    activo: true,
  });

  return empresa;
};

module.exports = {
  getAllEmpresa,
  getActiveEmpresa,
  getEmpresaById,
  createEmpresa,
};
