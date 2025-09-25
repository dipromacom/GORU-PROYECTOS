/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const ProyectoUtils = require('../utils/proyecto-utils');
const DateUtils = require('../utils/date-utils');
const { decodeToken } = require('../utils/security-utils');

const getAllProyecto = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);

    const items = (req.query && Object.keys(req.query).length > 0)
      ? await ProyectoUtils.getFilteredProjects(req.query, usuarioId)
      : await ProyectoUtils.getAllProyecto(usuarioId)

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActiveProyecto = async (req, res) => {
  try {
    const items = await ProyectoUtils.getActiveProyecto();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProyectoById = async (req, res) => {
  try {
    const { id} = req.params;
    const item = await ProyectoUtils.getProyectoById(id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Proyecto no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createProyecto = async (req, res) => {
  try {
    const data = req.body;
    const Proyecto = await ProyectoUtils.createProyecto(data);
    return res.status(201).json({ success: true, data: Proyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createProyectoGeneralData = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);

    const data = req.body;
    const Proyecto = await ProyectoUtils.createProyectoGeneralData(data, usuarioId);
    return res.status(201).json({ success: true, data: Proyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const activarProyecto = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);
    const { projectId } = req.body
    const proyecto = await ProyectoUtils.updateProyecto(
      {
        usuario_creador: usuarioId,
        activo: true,
        estado: 'S',
        fecha_inicio: DateUtils.getLocalDate()
      }, projectId
    )
    return res.status(201).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

const cerrarProyecto = async (req, res) => {
  try {
    const { projectId, fecha_cierre } = req.body; // 👈 recibimos ambos del body

    if (!projectId) {
      return res.status(400).json({ success: false, message: "El campo projectId es obligatorio" });
    }

    if (!fecha_cierre) {
      return res.status(400).json({ success: false, message: "El campo fecha_cierre es obligatorio" });
    }

    const proyecto = await ProyectoUtils.updateProyecto(
      {
        estado: "E",
        fecha_cierre
      },
      projectId
    );

    return res.status(200).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProyecto = async (req, res) => {
  try {
    const projectId = req.params.id;
    const data = req.body
    const proyecto = await ProyectoUtils.updateProyecto(data, projectId)
    return res.status(201).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

const updateProyectoGeneralData = async (req, res) => {
  try {
    const projectId = req.params.id;
    const data = req.body
    const proyecto = await ProyectoUtils.updateProyectoGeneralData(data, projectId)
    return res.status(201).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllProyecto,
  getActiveProyecto,
  getProyectoById,
  createProyecto,
  createProyectoGeneralData,
  activarProyecto,
  cerrarProyecto,
  updateProyecto,
  updateProyectoGeneralData
};
