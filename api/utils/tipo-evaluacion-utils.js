const { TipoEvaluacion, Criterio, Opcion, CriterioCustom, OpcionCustom } = require('../models/index');

const getAllTipoEvaluacion = async () => {
  const items = await TipoEvaluacion.findAll();
  return items;
};

const getActiveTipoEvaluacion = async () => {
  const items = await TipoEvaluacion.findAll({
    where: {
      activo: true,
    },
  });
  return items;
};

const getTipoEvaluacionById = async (id) => {
  const item = await TipoEvaluacion.findOne({
    where: {
      id,
    },
  });

  return item;
};

const getCriteriosByTipoEvaluacionId = async (id) => {
  const item = await TipoEvaluacion.findOne({
    where: { id },
    include: {
      model: Criterio,
      as: 'Criterio',
      where: { activo: true },
    },
    order: [
      [{ model: Criterio, as: 'Criterio' }, 'orden', 'ASC'],
    ],
  });

  return item;
};

const getOpcionesByTipoEvaluacion = async (id) => {
  const item = await TipoEvaluacion.findOne({
    where: { id },
    include: {
      model: Criterio,
      as: 'Criterio',
      where: { activo: true },
      attributes: ['id', ['descripcion', 'criterio'], 'peso_limite'],
      include: {
        model: Opcion,
        as: 'Opcion',
        where: { activo: true },
        attributes: ['id', ['descripcion', 'criterio'], 'puntos'],
      },
    },
    order: [
      [{ model: Criterio, as: 'Criterio' }, 'orden', 'ASC'],
      [{ model: Criterio, as: 'Criterio' },
        { model: Opcion, as: 'Opcion' }, 'orden', 'ASC'],
    ],
  });

  return item;
};

const getOpcionesCustomByTipoEvaluacionUsuario = async (tipoEvaluacionId, usuarioId) => {
  const item = await TipoEvaluacion.findOne({
    where: { id: tipoEvaluacionId },
    include: {
      model: CriterioCustom,
      as: 'CriterioCustom',
      where: { activo: true, usuario: usuarioId },
      attributes: ['id', ['descripcion', 'criterio'], 'peso_limite'],
      include: {
        model: OpcionCustom,
        as: 'OpcionCustom',
        where: { activo: true },
        required: false,
        attributes: ['id', ['descripcion', 'criterio'], 'puntos'],
      },
    },
    order: [
      [{ model: CriterioCustom, as: 'CriterioCustom' }, 'orden', 'ASC'],
      [{ model: CriterioCustom, as: 'CriterioCustom' },
       { model: OpcionCustom, as: 'OpcionCustom' }, 'orden', 'ASC'],
    ],
  });

  return item
}

module.exports = {
  getAllTipoEvaluacion,
  getActiveTipoEvaluacion,
  getTipoEvaluacionById,
  getCriteriosByTipoEvaluacionId,
  getOpcionesByTipoEvaluacion,
  getOpcionesCustomByTipoEvaluacionUsuario,
};
