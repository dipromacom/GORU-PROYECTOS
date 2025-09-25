const TipoTelefonoUtils = require('../utils/tipo-telefono-utils');

const getAllTipoTelefono = async (req, res) => {
  try {
    const items = await TipoTelefonoUtils.getAllTipoTelefono();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActiveTipoTelefono = async (req, res) => {
  try {
    const items = await TipoTelefonoUtils.getActiveTipoTelefono();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTipoTelefonoById = async (req, res) => {
  try {
    const item = await TipoTelefonoUtils.getTipoTelefonoById(req.params.id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Tipo de teléfono no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllTipoTelefono,
  getActiveTipoTelefono,
  getTipoTelefonoById,
};
