const {
  TipoEvaluacion, Criterio, Opcion,
} = require('../models/index');

const getActiveCriterioByTipoEvaluacion = async (tipoEvaluacionId) => {
  const items = await Criterio.findAll({
    where: { activo: true, tipo_evaluacion: tipoEvaluacionId },
    include: {
      model: TipoEvaluacion,
      as: 'TipoEvaluacion',
    },
  });

  return items;
};

const getCriterioById = async (id) => {
  try {
    const item = await Criterio.findOne({
      where: { id },
      include: [
        {
          model: TipoEvaluacion,
          as: 'TipoEvaluacion',
        },
        {
          model: Opcion,
          as: 'Opcion',
        }
      ],
      order: [
        [{ model: Opcion, as: 'Opcion' }, 'puntos', 'DESC'],
      ],
    });
    return item;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "getCriterioById()",
      params: data
    });
  }
  
  throw error;
};

const getOpcionesByCriterioId = async (id) => {
  const item = await Criterio.findOne({
    where: { id },
    include: [
      {
        model: TipoEvaluacion,
        as: 'TipoEvaluacion',
      },
      {
        model: Opcion,
        as: 'Opcion',
        where: { activo: true },
      },
    ],
    order: [
      [{ model: Opcion, as: 'Opcion' }, 'orden', 'ASC'],
    ],
  });

  return item;
};

module.exports = {
  getActiveCriterioByTipoEvaluacion,
  getCriterioById,
  getOpcionesByCriterioId,
};
