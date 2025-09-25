const path = require('path');
const EvaluacionUtils = require('../utils/evaluacion-utils');
const UsuarioUtils = require('../utils/usuario-utils');
const BatchUtils = require('../utils/batch-utils');

const logger = require('../logger/logger');

const file = path.basename(__filename);

const saveEvaluacion = async (req, res) => {
  const { body } = req;
  const { id: usuarioId } = req.params;

  try {
    const usuario = await UsuarioUtils.getUsuarioById(usuarioId);
    const batch = await BatchUtils.getActiveBatch(usuarioId);
    if (batch == null) {
      return res.status(200).json({ success: false, message: 'No posee un batch activo' });
    }

    const { numeroProyecto } = body;
    const items = await EvaluacionUtils.findEvaluacionByBatchAndNumero(batch.id, numeroProyecto);
    if (items.length) {
      return res.status(200).json({ success: false, message: 'Este número de proyecto ya ha sido utilizado' });
    }

    const tipoEvaluacionId = "1";
    const result = await EvaluacionUtils.saveEvaluacion(usuario, body, tipoEvaluacionId);
    return res.status(200).json({ success: result });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "saveEvaluacion()",
      params: { usuarioId }
    });

    return res.status(500).json({ success: false });
  }
};

const getEvaluacionResult = async (req, res) => {
  const { id: tipoEvaluacionId } = req.params;
  const { usuario: usuarioId } = req.headers;

  try {
    const usuario = await UsuarioUtils.getUsuarioById(usuarioId);
    const batch = await BatchUtils.getLastClosedBatch(usuarioId);

    if (batch !== null) {
      const items = await EvaluacionUtils.getEvaluacionResult(usuario, batch.id, tipoEvaluacionId);
      return res.status(200).json({ success: true, evaluacionList: items });
    }

    return res.status(200).json({ success: false, evaluacionList: [] });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "getEvaluacionResult()",
      params: { tipoEvaluacionId, usuarioId }
    });

    return res.status(500).json({ success: false });
  }
};

const getEvaluacionResultByBatchIdAndUserId = async (req, res) => {
  const { batch: batchId, tipoEvaluacion: tipoEvaluacionId } = req.params;
  const { usuario: usuarioId } = req.headers;

  try {
    const usuario = await UsuarioUtils.getUsuarioById(usuarioId);
    const items = await EvaluacionUtils.getEvaluacionResult(usuario, batchId, tipoEvaluacionId);
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "getEvaluacionResultById()",
      params: batchId,
    });

    return res.status(500).json({ success: false });
  }
}

module.exports = {
  saveEvaluacion,
  getEvaluacionResult,
  getEvaluacionResultByBatchIdAndUserId,
};
