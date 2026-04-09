/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const ProyectoUtils = require('../utils/proyecto-utils');
const DateUtils = require('../utils/date-utils');
const { decodeToken } = require('../utils/security-utils');
const PermisoProyectoUtils = require('../utils/permiso-proyecto-utils');
const { P } = PermisoProyectoUtils;

const httpErrorStatus = (error, fallback = 500) => (
  error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : fallback
);

// ─────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────

const getAllProyecto = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);

    // FIX: unificado en una sola llamada — getFilteredProjects
    // soporta query vacío y se comporta igual que getAllProyecto
    const items = await ProyectoUtils.getFilteredProjects(req.query || {}, usuarioId);

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(httpErrorStatus(error)).json({ success: false, message: error.message });
  }
};

const getActiveProyecto = async (req, res) => {
  try {
    const items = await ProyectoUtils.getActiveProyecto();
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProyectoById = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);
    const { id } = req.params;

    const puedeVer = await PermisoProyectoUtils.assertMiembroProyecto(res, usuarioId, id);
    if (!puedeVer) return;

    const item = await ProyectoUtils.getProyectoById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Proyecto no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

const createProyecto = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);
    const proyecto = await ProyectoUtils.createProyecto(req.body, usuarioId);
    return res.status(201).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(httpErrorStatus(error)).json({ success: false, message: error.message });
  }
};

const createProyectoGeneralData = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);
    const proyecto = await ProyectoUtils.createProyectoGeneralData(req.body, usuarioId);
    return res.status(201).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(httpErrorStatus(error)).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

const updateProyecto = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);
    const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, req.params.id, P.PROYECTO_CONFIG_GEST);
    if (!ok) return;

    const proyecto = await ProyectoUtils.updateProyecto(req.body, req.params.id, usuarioId);
    return res.status(200).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(httpErrorStatus(error)).json({ success: false, message: error.message });
  }
};

const updateProyectoGeneralData = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);
    const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, req.params.id, P.PROYECTO_CONFIG_GEST);
    if (!ok) return;

    const proyecto = await ProyectoUtils.updateProyectoGeneralData(req.body, req.params.id, usuarioId);
    return res.status(200).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ESTADO
// ─────────────────────────────────────────────

const activarProyecto = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);
    const { projectId } = req.body;

    const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, projectId, P.PROYECTO_CONFIG_GEST);
    if (!ok) return;

    const proyecto = await ProyectoUtils.logUpdateEstadoProyecto(
      projectId, 'S', usuarioId,
      { usuario_creador: usuarioId, activo: true, fecha_inicio: DateUtils.getLocalDate() },
      'PROJECT_ACTIVATED'
    );

    await ProyectoUtils.assignCreatorToProject(projectId, usuarioId);

    return res.status(201).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cerrarProyecto = async (req, res) => {
  try {
    const { projectId, fecha_cierre } = req.body;
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);

    if (!projectId) return res.status(400).json({ success: false, message: 'El campo projectId es obligatorio' });
    if (!fecha_cierre) return res.status(400).json({ success: false, message: 'El campo fecha_cierre es obligatorio' });

    const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, projectId, P.PROYECTO_CONFIG_GEST);
    if (!ok) return;

    const proyecto = await ProyectoUtils.logUpdateEstadoProyecto(
      projectId, 'E', usuarioId,
      { fecha_cierre },
      'PROJECT_CLOSED'
    );

    return res.status(200).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateEstadoProyecto = async (req, res) => {
  try {
    const { projectId, estado } = req.body;
    const { authorization } = req.headers;
    const { id: usuarioId } = decodeToken(authorization);

    const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, projectId, P.PROYECTO_CONFIG_GEST);
    if (!ok) return;

    const proyecto = await ProyectoUtils.logUpdateEstadoProyecto(
      projectId, estado, usuarioId, {}, 'PROJECT_STATUS_CHANGED'
    );

    return res.status(200).json({ success: true, data: proyecto });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllProyecto,
  getActiveProyecto,
  getProyectoById,
  createProyecto,
  createProyectoGeneralData,
  activarProyecto,
  cerrarProyecto,
  updateEstadoProyecto,
  updateProyecto,
  updateProyectoGeneralData,
};