const OpcionUtils = require('../utils/opcion-utils');

const getOpcionById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await OpcionUtils.getOpcionById(id);

    if (item == null) {
      return res.status(200).json({ success: true, message: 'Opción no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOpcionById,
};
