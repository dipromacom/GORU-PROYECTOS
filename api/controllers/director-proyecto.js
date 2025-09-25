const DirectorProyectoUtils = require('../utils/director-proyecto-utils');

const getAllDirectorProyecto = async (req, res) => {
  try {
    const items = await DirectorProyectoUtils.getAllDirectorProyecto();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveDirectorProyecto = async (req, res) => {
  try {
    const items = await DirectorProyectoUtils.getActiveDirectorProyecto();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDirectorProyectoById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await DirectorProyectoUtils.getDirectorProyectoById(id);

    if (item == null) {
      return res.status(200).json({ success: true, message: 'Director de Proyecto no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createDirectorProyecto = async (req, res) => {
  const { body } = req;
  try {
    const persona = await DirectorProyectoUtils.createDirectorProyecto(body);
    return res.status(201).json({ success: true, data: persona });
  } catch (ex) {
    return res.status(500).json({ success: false, message: ex.message });
  }
};

const deactivateDirectorProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DirectorProyectoUtils.deactivateDirectorProyecto(id);
    return res.status(200).json({ success: true, data: result });
  } catch (ex) {
    return res.status(500).json({ success: false, message: ex.message });
  }
};

module.exports = {
  getAllDirectorProyecto,
  getActiveDirectorProyecto,
  getDirectorProyectoById,
  createDirectorProyecto,
  deactivateDirectorProyecto,
};
