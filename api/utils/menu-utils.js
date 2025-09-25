const { Menu } = require('../models/index');

const getAllMenu = async () => {
  const items = await Menu.findAll({
    where: {
      menu_padre: null,
    },
    include: {
      model: Menu,
      as: 'Menu',
      include: {
        model: Menu,
        as: 'Menu',
      },
    },
  });
  return items;
};

const getActiveMenu = async () => {
  const items = await Menu.findAll({
    where: {
      activo: true,
      menu_padre: null,
    },
    include: {
      model: Menu,
      as: 'Menu',
      include: {
        model: Menu,
        as: 'Menu',
      },
    },
  });
  return items;
};

const getMenuById = async (id) => {
  const item = await Menu.findOne({
    where: {
      id,
    },
  });

  return item;
};

module.exports = {
  getAllMenu, getActiveMenu, getMenuById,
};
