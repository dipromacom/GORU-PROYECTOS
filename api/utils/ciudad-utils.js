const { Ciudad } = require('../models/index');

const getCiudadByPais = async (pais) => {
  const items = await Ciudad.findAll({
    where: {
      pais,
    },
  });
  return items;
};

module.exports = {
  getCiudadByPais,
};
