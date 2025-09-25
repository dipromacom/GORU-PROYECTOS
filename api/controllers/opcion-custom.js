const OpcionCustomUtils = require('../utils/opcion-custom-utils');

const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

const getOpcionCustomById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await OpcionCustomUtils.getOpcionCustomById(id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Opción no existe'});
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "getOpcionCustomById()",
      params: id
    });

    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateOpcionCustomById = async (req, res) => {
  const { id } = req.params;
  const { body: data } = req;
  try {
    const result = await OpcionCustomUtils.updateOpcionCustomById(id, data);
    return res.status(200).json({ success: result });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "updateOpcionCustomById()",
      params: { id, data }
    });

    return res.status(500).json({ success: false });
  }
};

const deactivateOpcionCustomById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await OpcionCustomUtils.deactivateOpcionCustomById(id);
    return res.status(200).json({ success: result });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "deactivateOpcionCustomById()",
      params: id
    });

    return res.status(500).json({ success: false });
  }
};

const addOpcionCustom = async (req, res) => {
  const { body: data } = req;
  try {
    const opcion = await OpcionCustomUtils.addOpcionCustom(data);
    if (opcion != null) {
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ success: false });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "addOpcionCustom()",
      params: data
    });

    return res.status(500).json({ success: false });
  }
}

module.exports = {
  getOpcionCustomById,
  updateOpcionCustomById,
  deactivateOpcionCustomById,
  addOpcionCustom,
}