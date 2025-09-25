const CriterioUtils = require('../utils/criterio-utils');

const getActiveCriterioByTipoEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await CriterioUtils.getActiveCriterioByTipoEvaluacion(id);

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCriterioById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CriterioUtils.getCriterioById(id);

    if (item == null) {
      return res.status(200).json({ success: true, message: 'Criterio no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOpcionesByCriterioId = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CriterioUtils.getOpcionesByCriterioId(id);

    if (item == null) {
      return res.status(200).json({ success: true, message: 'Criterio no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActiveCriterioByTipoEvaluacion,
  getCriterioById,
  getOpcionesByCriterioId,
};
