const TipoEvaluacionUtils = require('../utils/tipo-evaluacion-utils');

const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

const getAllTipoEvaluacion = async (req, res) => {
  try {
    const items = await TipoEvaluacionUtils.getAllTipoEvaluacion();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActiveTipoEvaluacion = async (req, res) => {
  try {
    const items = await TipoEvaluacionUtils.getActiveTipoEvaluacion();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTipoEvaluacionById = async (req, res) => {
  try {
    const item = await TipoEvaluacionUtils.getTipoEvaluacionById(req.params.id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Tipo de evaluación no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCriteriosByTipoEvaluacionId = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await TipoEvaluacionUtils.getCriteriosByTipoEvaluacionId(id);

    if (item == null) {
      return res.status(200).json({ success: true, message: 'Tipo de evaluación  no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOpcionesByTipoEvaluacionId = async (req, res) => {
  const { id: tipoEvaluacionId } = req.params;
  const { usuario } = req.headers;
  try {
    const opcionesCustom = await TipoEvaluacionUtils.getOpcionesCustomByTipoEvaluacionUsuario(tipoEvaluacionId, usuario);
    const opcionesBase = await TipoEvaluacionUtils.getOpcionesByTipoEvaluacion(tipoEvaluacionId); 

    const opciones = opcionesCustom === null ? opcionesBase.Criterio : opcionesCustom.CriterioCustom;
    const isCustom = opcionesCustom === null ? false : true ;

    if (opciones == null) {
      return res.status(200).json({ success: true, message: 'Tipo de evaluación  no existe' });
    }

    return res.status(200).json({ success: true, data: opciones, isCustom: isCustom });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "getOpcionesByTipoEvaluacionId()",
      params: { id, usuario }
    });

    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllTipoEvaluacion,
  getActiveTipoEvaluacion,
  getTipoEvaluacionById,
  getCriteriosByTipoEvaluacionId,
  getOpcionesByTipoEvaluacionId,
};
