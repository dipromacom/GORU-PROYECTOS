const { Departamento } = require('../models/index');

const getAllDepartamento = async () => {
  const items = await Departamento.findAll();
  return items;
};

const getActiveDepartamento = async () => {
  const items = await Departamento.findAll({
    where: {
      activo: true,
    },
  });
  return items;
};

const getDepartamentoById = async (id) => {
  const item = await Departamento.findOne({
    where: {
      id,
    },
  });

  return item;
};

const createDepartamento = async (data) => {
  const { nombre, abreviacion } = data;

  const departamento = await Departamento.create({
    nombre,
    abreviacion,
    fecha_creacion: null,
    activo: true,
  });

  return departamento;
};

module.exports = {
  getAllDepartamento,
  getActiveDepartamento,
  getDepartamentoById,
  createDepartamento,
};
