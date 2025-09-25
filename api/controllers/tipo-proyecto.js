const TipoProyectoUtils = require('../utils/tipo-proyecto-utils');

const getAllTipoProyecto = async (req, res) => {
  try {
    const items = await TipoProyectoUtils.getAllTipoProyecto();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActiveTipoProyecto = async (req, res) => {
  try {
    const items = await TipoProyectoUtils.getActiveTipoProyecto();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTipoProyectoById = async (req, res) => {
  try {
    const item = await TipoProyectoUtils.getTipoProyectoById(req.params.id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Tipo de proyecto no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTipoProyecto = async (req, res) => {
  try {
    const data = req.body;
    const tipoProyecto = await TipoProyectoUtils.createTipoProyecto(data);
    return res.status(201).json({ success: true, data: tipoProyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllTipoProyecto,
  getActiveTipoProyecto,
  getTipoProyectoById,
  createTipoProyecto,
};
