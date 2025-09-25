const CiudadUtils = require('../utils/ciudad-utils');

const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

const getCiudadByPais = async (req, res) => {
  try {
    const { pais } = req.params;
    const items = await CiudadUtils.getCiudadByPais(pais);

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "getCiudadByPais()",
      params: req.params
    });

    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCiudadByPais,
};
