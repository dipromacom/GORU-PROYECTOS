const EmpresaUtils = require('../utils/empresa-utils');

const getAllEmpresa = async (req, res) => {
  try {
    const items = await EmpresaUtils.getAllEmpresa();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActiveEmpresa = async (req, res) => {
  try {
    const items = await EmpresaUtils.getActiveEmpresa();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmpresaById = async (req, res) => {
  try {
    const item = await EmpresaUtils.getEmpresaById(req.params.id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Empresa no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createEmpresa = async (req, res) => {
  try {
    const data = req.body;
    const empresa = await EmpresaUtils.createEmpresa(data);
    return res.status(201).json({ success: true, data: empresa });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllEmpresa,
  getActiveEmpresa,
  getEmpresaById,
  createEmpresa,
};
