const NivelPermisoUtils = require('../utils/nivel-permiso-utils');

const getAllNivelPermiso = async (req, res) => {
  try {
    const items = await NivelPermisoUtils.getAllNivelPermiso();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActiveNivelPermiso = async (req, res) => {
  try {
    const items = await NivelPermisoUtils.getActiveNivelPermiso();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getNivelPermisoById = async (req, res) => {
  try {
    const item = await NivelPermisoUtils.getNivelPermisoById(req.params.id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'El nivel de permiso no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllNivelPermiso,
  getActiveNivelPermiso,
  getNivelPermisoById,
};
