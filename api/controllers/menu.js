const MenuUtils = require('../utils/menu-utils');

const getAllMenu = async (req, res) => {
  try {
    const items = await MenuUtils.getAllMenu();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActiveMenu = async (req, res) => {
  try {
    const items = await MenuUtils.getActiveMenu();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuUtils.getMenuById(id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Menú no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllMenu,
  getActiveMenu,
  getMenuById,
};
