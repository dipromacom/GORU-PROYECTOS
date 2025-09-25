/* eslint-disable quotes */
const path = require('path');
const UsuarioUtils = require('../utils/usuario-utils');
const PersonaUtils = require('../utils/persona-utils');
const SecurityUtils = require('../utils/security-utils');

const logger = require('../logger/logger');

const file = path.basename(__filename);

const TIPO_LICENCIA_DEMO_ID = 3;

const getUsuarioById = async (req, res) => {
  try {
    const item = await UsuarioUtils.getUsuarioById(req.params.id);

    if (item == null) {
      return res.status(404).json({ success: false, message: 'Usuario no existe' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "getUsuarioById()",
      params: req.params.id
    });

    return res.status(500).json({ success: false, message: error.message });
  }
};

const createUsuario = async (req, res) => {
  const data = req.body;
  try {
    const { username } = data;
    if (await UsuarioUtils.getUsuarioByEmail(username)) {
      return res.status(400).json({ success: false, message: 'Usuario ya existe con este email' });
    }

    let usuario = await UsuarioUtils.createUsuario(data);
    usuario = usuario.get({ plain: true });
    delete usuario.clave;

    const page = UsuarioUtils.getOnbStep(usuario);
    usuario.page = page;

    logger.info({ message: 'Usuario creado exitosamente' });
    return res.status(201).json({ success: true, data: usuario });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "createUsuario()",
      params: data
    });

    return res.status(500).json({ success: false, message: error.message });
  }
};

const generateToken = async (req, res) => {
  const { email, clave, awsId } = req.body;

  try {
    let usuario = await UsuarioUtils.getUsuarioByEmail(email);

    if (!usuario) {
      if (!awsId) {
        return res.status(403).json({ success: false, message: "No tiene permisos para realizar esta operación" });
      }

      usuario = await UsuarioUtils.createUsuario({ username: email, clave, awsId });
    }
    const page = UsuarioUtils.getOnbStep(usuario);
    const jwtToken = await SecurityUtils.generateToken(usuario);

    usuario = usuario.get({ plain: true });
    delete usuario.clave;
    return res.status(200).json({ success: true, data: { usuario, page, token: jwtToken } });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "generateToken()",
      params: { email, awsId },
    });

    return res.status(500).json({ success: false, message: error.message });
  }
};

const setMembresia = async (req, res) => {
  try {
    const { usuarioId } = req.body;
    const usuario = await UsuarioUtils.getUsuarioById(usuarioId);

    let result = false;
    if (usuario != null) {
      // TODO: put demo in a configuration table
      result = await UsuarioUtils.setTipoLicencia(usuario, TIPO_LICENCIA_DEMO_ID);
    }

    return res.status(200).json({ success: result });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "setMembresia()",
      params: req.body
    });

    return res.status(500).json({ success: false, message: error.message });
  }
};

const updatePersonaProfile = async (req, res) => {
  const { body } = req;
  const { id } = req.params;

  try {
    const usuario = await UsuarioUtils.getUsuarioById(id);
    let persona = await usuario.getPersona();

    if (persona == null) {
      persona = await PersonaUtils.createPersonaProfile(usuario, body);
    } else {
      persona = await PersonaUtils.updatePersonaProfile(usuario, persona, body);
    }
    persona = await PersonaUtils.getPersonaById(persona.id);
    return res.status(200).json({ success: true, data: persona });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "updatePersonaProfile()",
      params: { body, id }
    });

    return res.status(500).json({ success: false, message: error.message });
  }
};

const isEmailAvalaible = async (req, res) => {
  const { email } = req.params;
  try {
    const item = await UsuarioUtils.getUsuarioByEmail(email);

    let available = true;
    if (item !== null) {
      available = false;
    }

    return res.status(200).json({ success: true, data: { available } });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "isEmailAvalaible()",
      params: email
    });

    return res.status(500).json({ success: false, message: error.message });
  }
}

const updatePassword = async (req, res) => {
  const { email } = req.params;
  const data = req.body;

  try {
    const { clave } = data;
    let usuario = await UsuarioUtils.getUsuarioByEmail(email);

    if (usuario !== null) {
      usuario = await UsuarioUtils.updatePassword(usuario, clave);
    } else {
      usuario = await UsuarioUtils.createUsuario({ username: email, clave });
    }

    const success = !!usuario;
    return res.status(201).json({ success });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "updatePassword()",
      params: data
    });

    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getUsuarioById,
  createUsuario,
  generateToken,
  setMembresia,
  updatePersonaProfile,
  isEmailAvalaible,
  updatePassword,
};
