const PatrocinadorUtils = require('../utils/patrocinador-utils');

const getAllPatrocinador = async (req, res) => {
  try {
    const items = await PatrocinadorUtils.getAllPatrocinador();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getActivePatrocinador = async (req, res) => {
  try {
    const items = await PatrocinadorUtils.getActivePatrocinador();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPatrocinadorById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await PatrocinadorUtils.getPatrocinadorById(id);

    if (item == null) {
      return res.status(200).json({ success: true, message: 'Patrocinador no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createPatrocinador = async (req, res) => {
  const { body } = req;
  try {
    const persona = await PatrocinadorUtils.createPatrocinador(body);
    return res.status(201).json({ success: true, data: persona });
  } catch (ex) {
    return res.status(500).json({ success: false, message: ex.message });
  }
};

const deactivatePatrocinador = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PatrocinadorUtils.deactivatePatrocinador(id);
    return res.status(200).json({ success: true, data: result });
  } catch (ex) {
    return res.status(500).json({ success: false, message: ex.message });
  }
};

module.exports = {
  getAllPatrocinador,
  getActivePatrocinador,
  getPatrocinadorById,
  createPatrocinador,
  deactivatePatrocinador,
};
