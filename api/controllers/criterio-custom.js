const CriterioCustomUtils = require('../utils/criterio-custom-utils');
const BatchUtils = require('../utils/batch-utils');
const OpcionCustomUtils = require('../utils/opcion-custom-utils');

const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

const getCriterioCustomById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await CriterioCustomUtils.getCriterioCustomById(id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Criterio no existe'});
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "getCriterioCustomById()",
      params: id
    });

    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCriterioCustomById = async (req, res) => {
  const { id } = req.params;
  const { body: data } = req;
  try {
    const result = await CriterioCustomUtils.updateCriterioCustomById(id, data);
    return res.status(200).json({ success: result });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "updateCriterioCustomById()",
      params: { id, data }
    });

    return res.status(500).json({ success: false });
  }
};

const deactivateCriterioCustomById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await CriterioCustomUtils.deactivateCriterioCustomById(id);
    return res.status(200).json({ success: result });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "deactivateCriterioCustomById()",
      params: id
    });

    return res.status(500).json({ success: false });
  }
};

const addCriterioCustom = async (req, res) => {
  const { body: data } = req;
  try {
    const batch = await BatchUtils.getActiveBatch(data.usuarioId);
    const updatedData = { ...data, batchId: batch.id };
    const criterio = await CriterioCustomUtils.addCriterioCustom(updatedData);
    if (criterio != null) {
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ success: false });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "addCriterioCustom()",
      params: data
    });

    return res.status(500).json({ success: false });
  }
}

module.exports = {
  getCriterioCustomById,
  updateCriterioCustomById,
  deactivateCriterioCustomById,
  addCriterioCustom,
}