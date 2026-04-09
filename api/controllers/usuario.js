/* eslint-disable quotes */
const path = require('path');
const UsuarioUtils = require('../utils/usuario-utils');
const PersonaUtils = require('../utils/persona-utils');
const SecurityUtils = require('../utils/security-utils');
const { saveLog } = require('../utils/log-service');

const logger = require('../logger/logger');

const file = path.basename(__filename);

const { PLAN_PERSONAL_ID } = require('../constants/plan-licencia');

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
  const data = { ...req.body };
  delete data.tipoLicencia;
  try {
    const { username } = data;
    if (await UsuarioUtils.getUsuarioByEmail(username)) {
      return res.status(400).json({ success: false, message: 'Usuario ya existe con este email' });
    }

    let usuario = await UsuarioUtils.createUsuario(data);

    usuario = await UsuarioUtils.getUsuarioById(usuario.id);

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
    let actionType = 'USER_LOGIN_EMAIL';
    let usuario = await UsuarioUtils.getUsuarioByEmail(email);

    if (!usuario) {
      if (!awsId) {
        return res.status(403).json({ success: false, message: "No tiene permisos para realizar esta operación" });
      }

      usuario = await UsuarioUtils.createUsuario({ username: email, clave, awsId });

      usuario = await UsuarioUtils.getUsuarioById(usuario.id);
      actionType = 'USER_CREATED_VIA_SSO';
    } else if (awsId) {
      actionType = 'USER_LOGIN_SSO'; // Si existe y usa AWS, es un login SSO
      usuario = await UsuarioUtils.getUsuarioById(usuario.id);
    } else {
      usuario = await UsuarioUtils.getUsuarioById(usuario.id);
    }

    const page = UsuarioUtils.getOnbStep(usuario);
    const jwtToken = await SecurityUtils.generateToken(usuario);

    await saveLog({
      userId: usuario.id,
      actionType: actionType, // USER_LOGIN_EMAIL, USER_LOGIN_SSO, o USER_CREATED_VIA_SSO
      resourceType: 'Usuario',
      resourceId: usuario.id,
      details: {
        email: usuario.username,
        ip: req.ip // Opcional: Si tu entorno expone la IP del cliente en req.ip
      }
    });

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
      if (usuario.tipo_licencia == null) {
        result = await UsuarioUtils.setTipoLicencia(usuario, PLAN_PERSONAL_ID);
      } else {
        result = true;
      }
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

    const action = persona == null ? 'PROFILE_CREATED' : 'PROFILE_UPDATED';

    if (persona == null) {
      persona = await PersonaUtils.createPersonaProfile(usuario, body);
    } else {
      persona = await PersonaUtils.updatePersonaProfile(usuario, persona, body);

      await saveLog({
        userId: parseInt(id, 10),
        actionType: action,
        resourceType: 'Persona',
        resourceId: persona.id,
        details: {
          // Registramos los campos que llegaron en el body como indicio de lo actualizado
          fields: Object.keys(body),
        }
      });
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

const updateUsuarioRol = async (req, res) => {
  // Asumimos que el middleware ya verificó el permiso 'rol_gestionar'
  const { id } = req.params; // ID del usuario a modificar
  const { rolId } = req.body; // Nuevo ID del rol

  const adminUserId = req.user.id;

  try {
    if (!rolId) {
      return res.status(400).json({ success: false, message: 'El rolId es obligatorio.' });
    }

    // Validación y parseo de IDs
    const userId = parseInt(id, 10);
    const newRolId = parseInt(rolId, 10);

    if (isNaN(userId) || isNaN(newRolId)) {
      return res.status(400).json({ success: false, message: 'IDs de usuario y rol deben ser números válidos.' });
    }

    const updatedUsuario = await UsuarioUtils.updateUsuarioRol(userId, newRolId, adminUserId);

    // Formatear el objeto para la respuesta
    const usuarioData = updatedUsuario.get({ plain: true });
    delete usuarioData.clave; // Nunca devolver la clave

    logger.info({ message: `Rol de usuario ${id} actualizado a Rol ID ${rolId} exitosamente.` });
    return res.status(200).json({ success: true, data: usuarioData });

  } catch (error) {
    // Manejo de errores 404 de rol o usuario no encontrado
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ success: false, message: error.message });
    }

    logger.error({
      message: error.message,
      source: file,
      method: "updateUsuarioRol()",
      params: { id, body: req.body },
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUsuarioEmpresa = async (req, res) => {
  const { id } = req.params; // ID del usuario a modificar
  const { empresaId } = req.body; // Nuevo ID de la empresa

  try {
    if (!empresaId) {
      return res.status(400).json({ success: false, message: 'El empresaId es obligatorio.' });
    }

    const updatedUsuario = await UsuarioUtils.updateUsuarioEmpresa(id, empresaId);

    const usuarioData = updatedUsuario.get({ plain: true });
    delete usuarioData.clave;

    logger.info({ message: `Empresa de usuario ${id} actualizada a Empresa ID ${empresaId} exitosamente.` });
    return res.status(200).json({ success: true, data: usuarioData });

  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ success: false, message: error.message });
    }

    logger.error({ message: error.message, source: file, method: "updateUsuarioEmpresa()", params: { id, body: req.body } });
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUsuariosByEmpresa = async (req, res) => {
  const { id: empresaId } = req.params;

  // NOTA IMPORTANTE: Aquí se debe añadir una validación de seguridad
  // para asegurar que el usuario autenticado (desde req.headers/token)
  // pertenece a esa empresa o tiene permiso para ver esa empresa.

  try {
    const usuarios = await UsuarioUtils.getUsuariosByEmpresaId(empresaId);

    // Ocultar información sensible como la clave, aunque ya limitamos los atributos en utils
    const cleanData = usuarios.map(usuario => {
      const cleanUser = usuario.get({ plain: true });
      delete cleanUser.clave; // Asegurar que no se envía la clave
      return cleanUser;
    });

    return res.status(200).json({ success: true, data: cleanData });
  } catch (error) {
    // logger.error({ ... });
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsuarioById,
  createUsuario,
  generateToken,
  setMembresia,
  updatePersonaProfile,
  isEmailAvalaible,
  updatePassword,
  updateUsuarioRol,
  updateUsuarioEmpresa,
  getUsuariosByEmpresa,
};
