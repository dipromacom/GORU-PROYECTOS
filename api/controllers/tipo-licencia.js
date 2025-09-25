const TipoLicenciaUtils = require('../utils/tipo-licencia-utils');

const getAllTipoLicencia = async (req, res) => {
  try {
    const items = await TipoLicenciaUtils.getAllTipoLicencia();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActiveTipoLicencia = async (req, res) => {
  try {
    const items = await TipoLicenciaUtils.getActiveTipoLicencia();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTipoLicenciaById = async (req, res) => {
  try {
    const item = await TipoLicenciaUtils.getTipoLicenciaById(req.params.id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Tipo de Licencia no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTipoLicencia = async (req, res) => {
  try {
    const data = req.body;
    const TipoLicencia = await TipoLicenciaUtils.createTipoLicencia(data);
    return res.status(201).json({ success: true, data: TipoLicencia });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPermisosByTipoLicenciaId = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await TipoLicenciaUtils.getPermisosByTipoLicenciaId(id);

    if (item == null) {
      return res.status(200).json({ success: true, message: 'Tipo de Licencia  no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await TipoLicenciaUtils.addMenu(id, data);
    return res.status(201).json({ success: true, data: result });
  } catch (ex) {
    return res.status(500).json({ success: false, message: ex.message });
  }
};

module.exports = {
  getAllTipoLicencia,
  getActiveTipoLicencia,
  getTipoLicenciaById,
  createTipoLicencia,
  getPermisosByTipoLicenciaId,
  addMenu,
};
