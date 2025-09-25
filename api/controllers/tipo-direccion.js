const TipoDireccionUtils = require('../utils/tipo-direccion-utils');

const getAllTipoDireccion = async (req, res) => {
  try {
    const items = await TipoDireccionUtils.getAllTipoDireccion();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActiveTipoDireccion = async (req, res) => {
  try {
    const items = await TipoDireccionUtils.getActiveTipoDireccion();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTipoDireccionById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await TipoDireccionUtils.getTipoDireccionById(id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Tipo de Dirección no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllTipoDireccion,
  getActiveTipoDireccion,
  getTipoDireccionById,
};
