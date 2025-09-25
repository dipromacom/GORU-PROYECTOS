const DepartamentoUtils = require('../utils/departamento-utils');

const getAllDepartamento = async (req, res) => {
  try {
    const items = await DepartamentoUtils.getAllDepartamento();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActiveDepartamento = async (req, res) => {
  try {
    const items = await DepartamentoUtils.getActiveDepartamento();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDepartamentoById = async (req, res) => {
  try {
    const item = await DepartamentoUtils.getDepartamentoById(req.params.id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Departamento no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createDepartamento = async (req, res) => {
  try {
    const data = req.body;
    const Departamento = await DepartamentoUtils.createDepartamento(data);
    return res.status(201).json({ success: true, data: Departamento });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllDepartamento,
  getActiveDepartamento,
  getDepartamentoById,
  createDepartamento,
};
