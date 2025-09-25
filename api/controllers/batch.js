const BatchUtils = require('../utils/batch-utils');
const TipoEvaluacionUtils = require('../utils/tipo-evaluacion-utils');

const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

const createBatch = async (req, res) => {
  let { body } = req;

  try {
    const { usuarioId } = body;
    const batches = await BatchUtils.usuarioHasActiveBatch(usuarioId);
    if (batches.length) {
      return res.status(200).json({ success: false, message: 'Ya existe un batch activo' });
    }
    
    body = { ...body, paso_actual: 'select_criterios' };
    const batch = await BatchUtils.createBatch(usuarioId, body);
    return res.status(200).json({ success: true, data: batch });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "createBatch()",
      params: body
    });
    
    return res.status(500).json({ success: false });
  }
};

const usuarioHasActiveBatch = async (req, res) => {
  try {
    const { id: usuarioId } = req.params;
    const batch = await BatchUtils.getActiveBatch(usuarioId);
    let data = { hasBatch: false, activeBatch: null, setupTerminado: false };
    if (batch !== null) {
      data.hasBatch = true;
      data.activeBatch = batch;
      data.setupTerminado = batch.setup_terminado != null && batch.setup_terminado;
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "usuarioHasActiveBatch()",
      params: usuarioId
    });

    return res.status(500).json({ success: false, hasBatch: false });
  }
}

const startBatchSetup = async (req, res) => {
  const { usuario: usuarioId } = req.headers;
  const { id: tipoEvaluacionId } = req.params;
  try {

    const batch = await BatchUtils.getActiveBatch(usuarioId);
    if (batch === null) {
      return res.status(200).json({ success: false, message: 'No existe un batch activo' });
    }

    if (batch.setup_terminado !== null && batch.setup_terminado === true) {
      return res.status(200).json({ success: false, message: 'Este batch ya se encuentra configurado'})
    }

    const result = await BatchUtils.startBatchSetup(batch.id, usuarioId, tipoEvaluacionId);
    const opcionList = await TipoEvaluacionUtils.getOpcionesCustomByTipoEvaluacionUsuario(tipoEvaluacionId, usuarioId); 
    return res.status(200).json({ success: result, data: opcionList.CriterioCustom, isCustom: true });
  } catch (e) {
    logger.error({
      message: e.message,
      source: file,
      method: "usuarioHasActiveBatch()",
      params: { usuarioId, tipoEvaluacionId }
    });

    return res.status(500).json({ success: false });
  }
}

const getBatchStatus = async (req, res) => {
  const { usuario: usuarioId } = req.headers;
  try {
    let activeBatch = await BatchUtils.getActiveBatch(usuarioId);
    let lastClosedBatch = await BatchUtils.getLastClosedBatch(usuarioId);

    let closedBatch = lastClosedBatch != null ? true : false;
    let data = { activeBatch: false, setupTerminado: false, evaluaciones: 0, closedBatch: closedBatch  };
    if (activeBatch === null) {
      return res.status(200).json({ success: true, data: data });
    }

    data.activeBatch = true;
    data.evaluaciones = activeBatch.Evaluacion.length;

    data.setupTerminado = activeBatch.setup_terminado;
    return res.status(200).json({ success: true, data: data });
  } catch (e) {
    logger.error({
      message: e.message,
      source: file,
      method: "getBatchStatus()",
      params: usuarioId
    });

    return res.status(500).json({ success: false });
  }
}

const updateBatchSetup = async (req, res) => {
  const { usuario: usuarioId } = req.headers;
  const { id: tipoEvaluacionId } = req.params;
  try {
    const batch = await BatchUtils.getActiveBatch(usuarioId);
    if (batch === null) {
      return res.status(200).json({ success: false, message: 'No existe un batch activo' });
    }

    if (batch.setup_terminado !== null && batch.setup_terminado === true) {
      return res.status(200).json({ success: false, message: 'Este batch ya se encuentra configurado'})
    }

    const validate = await BatchUtils.validatePesocriterios(usuarioId, tipoEvaluacionId);
    let message = 'El peso total de los criterios debe sumar un 100%';
    if (validate > 0) {
      message += '. Se sobrepasa con ' + validate + '%';
      return res.status(200).json({ success: false, message: message });
    } else if (validate < 0) {
      message += '. Falta un ' + Math.abs(validate) + '%';
      return res.status(200).json({ success: false, message: message });
    }

    message = 'Batch configurado con éxito';
    const result = await BatchUtils.updateBatchSetup(batch.id);
    if (!result) {
      message = 'Ocurrio un problema al terminar la configuración del batch'
    }

    return res.status(200).json({ success: result, message: message });
  } catch (e) {
    logger.error({
      message: e.message,
      source: file,
      method: "updateBatchSetup()",
      params: { usuarioId, tipoEvaluacionId }
    });

    return res.status(500).json({ success: false });
  }
}

const closeBatch = async (req, res) => {
  const { id: usuarioId } = req.params;

  try {
    const batch = await BatchUtils.getActiveBatch(usuarioId);
    if (batch == null) {
      return res.status(500).json({ success: false, message: 'No posee un batch activo'});
    }

    const result = await BatchUtils.closeBatch(batch.id);
    return res.status(200).json({ success: result });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "closeBatch()",
      params: usuarioId
    });

    return res.status(500).json({ success: false });
  }
}

const getClosedBatches = async (req, res) => {
  const { id: usuarioId } = req.params;
  try {
    const items = await BatchUtils.getClosedBatches(usuarioId);
    return res.status(200).json({ success: true, data: items });
  } catch(e) {
    logger.error({
      message: e.message,
      source: file,
      method: "getClosedBatches()",
      params: usuarioId
    });

    return res.status(500).json({ success: false });
  }
}

const getBatchDetailsById = async (req, res) => {
  const { id: batchId } = req.params;
  const { usuario: usuarioId } = req.headers;
  try {
    const batch = await BatchUtils.getBatchDetailsById(usuarioId, batchId);
    if (batch != null) {
      return res.status(200).json({ success: true, data: batch });
    }

    return res.status(200).json({ success: false });
  } catch (e) {
    logger.error({
      message: e.message,
      source: file,
      method: "getBatchDetailsById()",
      params: { batchId, usuarioId }
    });

    return res.status(500).json({ success: false });
  }

}

const getBatchByProjectId = async(req, res) => {
  const { id: projectId } = req.params;
  const { usuario: usuarioId } = req.headers
  try {
    const batch = await BatchUtils.getBatchByProjectId(usuarioId, projectId);
    if (batch != null) {
      return res.status(200).json({ success: true, data: batch });
    }
    return res.status(200).json({ success: false });
  } catch (e) {
    logger.error({
      message: e.message,
      source: file,
      method: "getBatchByProjectId()",
      params: { projectId, usuarioId }
    });

    return res.status(500).json({ success: false });
  }
}

module.exports = {
  createBatch,
  usuarioHasActiveBatch,
  startBatchSetup,
  getBatchStatus,
  updateBatchSetup,
  closeBatch,
  getClosedBatches,
  getBatchDetailsById,
  getBatchByProjectId
}