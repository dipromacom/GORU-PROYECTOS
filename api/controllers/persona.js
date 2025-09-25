const PersonaUtils = require('../utils/persona-utils');

const getAllPersona = async (req, res) => {
  try {
    const items = await PersonaUtils.getAllPersona();

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messge: error.message,
    });
  }
};

const getActivePersona = async (req, res) => {
  try {
    const items = await PersonaUtils.getActivePersona();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPersonaById = async (req, res) => {
  try {
    const item = await PersonaUtils.getPersonaById(req.params.id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Persona no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createPersona = async (req, res) => {
  const { body } = req;

  try {
    const persona = await PersonaUtils.createPersona(body);
    return res.status(201).json({ success: true, data: persona });
  } catch (ex) {
    return res.status(500).json({ success: false, message: ex.message });
  }
};

const addContactoTelefonico = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await PersonaUtils.addContactoTelefonico(id, data);
    return res.status(201).json({ success: true, data: result });
  } catch (ex) {
    return res.status(500).json({ success: false, message: ex.message });
  }
};

module.exports = {
  getAllPersona,
  getActivePersona,
  getPersonaById,
  createPersona,
  addContactoTelefonico,
};
