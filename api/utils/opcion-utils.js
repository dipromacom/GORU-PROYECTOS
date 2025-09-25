const {
  Opcion, Criterio,
} = require('../models/index');

const getOpcionById = async (id) => {
  const item = await Opcion.findOne({
    where: { id },
    include: {
      model: Criterio,
      as: 'Criterio',
    },
  });

  return item;
};

module.exports = {
  getOpcionById,
};
