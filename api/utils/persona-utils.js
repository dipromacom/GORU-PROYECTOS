const path = require('path');
const db = require('../db');
const {
  Persona, Direccion, ContactoTelefonico, Ciudad, TipoTelefono, TipoDireccion, Empresa
} = require('../models/index');
const TipoTelefonoUtils = require('./tipo-telefono-utils');
const TipoDireccionUtils = require('./tipo-direccion-utils');

const logger = require('../logger/logger');

const file = path.basename(__filename);

const tipoTelefonoMovilId = 3;
const tipoDireccionDomicilioId = 1;

const getAllPersona = async () => {
  const items = await Persona.findAll();
  return items;
};

const getActivePersona = async () => {
  const items = await Persona.findAll({
    where: {
      activo: true,
    },
  });
  return items;
};

const getPersonaById = async (id) => {
  const item = await Persona.findOne({
    where: {
      id,
    },
    include: [
      {
        model: ContactoTelefonico,
        as: 'TipoTelefono',
        attributes: ['id', 'telefono'],
        include: {
          model: TipoTelefono,
          as: 'TipoTelefono',
          attributes: ['id', 'nombre'],
        },
      },
      {
        model: Direccion,
        as: 'TipoDireccion',
        attributes: ['id'],
        include: [
          {
            model: TipoDireccion,
            as: 'TipoDireccion',
            attributes: ['id', 'nombre'],
          },
          {
            model: Ciudad,
            as: 'Ciudad',
            attributes: ['id', 'nombre', 'pais'],
          },
        ],
      },
    ],
  });

  return item;
};

const createPersona = async (data) => {
  const transaction = await db.transaction();
  let persona = null;

  const {
    tipoIdentificacion, identificacion, nombre, apellido,
    fechaNacimiento, tipoTelefonoId, telefono, direccion,
  } = data;

  const {
    tipoDireccionId, ciudad, callePrincipal, calleSecundaria,
  } = direccion;

  try {
    persona = await Persona.create({
      tipo_identificacion: tipoIdentificacion,
      identificacion,
      nombre,
      apellido,
      fecha_nacimiento: fechaNacimiento,
      fecha_creacion: null,
      activo: true,
    }, { transaction });

    const tipoTelefono = await TipoTelefonoUtils.getTipoTelefonoById(tipoTelefonoId);

    await persona.addContactoTelefonico(tipoTelefono, {
      through: {
        telefono,
        fecha_creacion: null,
      },
      transaction,
    });

    const tipoDireccion = await TipoDireccionUtils.getTipoDireccionById(tipoDireccionId);
    await persona.addDireccion(tipoDireccion, {
      through: {
        ciudad, calle_principal: callePrincipal, calle_secundaria: calleSecundaria,
      },
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return persona;
};

const addContactoTelefonico = async (id, data) => {
  const persona = await getPersonaById(id);

  const { tipoTelefonoId, telefono } = data;
  const tipoTelefono = await TipoTelefonoUtils.getTipoTelefonoById(tipoTelefonoId);
  const result = await persona.addContactoTelefonico(tipoTelefono, {
    through: {
      telefono,
      fecha_creacion: null,
    },
  });

  return result;
};

const getPersonaByIdentificacion = async (tipoIdentificacion, identificacion, activo) => {
  const item = await Persona.findOne({
    where: {
      tipo_identificacion: tipoIdentificacion,
      identificacion,
      activo,
    },
  });

  return item;
};

const createPersonaProfile = async (usuario, data) => {
  const transaction = await db.transaction();
  let persona = null;

  const {
    nickname, nombre, apellido, empresa: empresaNombre, direccion, telefono,
  } = data;

  const {
    pais, ciudad,
  } = direccion;

  try {
    persona = await usuario.createPersona({
      nickname,
      nombre,
      apellido,
      fecha_creacion: null,
      activo: true,
      empresa: empresaNombre
    }, { transaction });

    const tipoTelefono = await TipoTelefonoUtils.getTipoTelefonoById(tipoTelefonoMovilId);
    await persona.addContactoTelefonico(tipoTelefono, {
      through: {
        telefono,
        fecha_creacion: null,
      },
      transaction,
    });

    const tipoDireccion = await TipoDireccionUtils.getTipoDireccionById(tipoDireccionDomicilioId);
    await persona.addDireccionTipoDireccion(tipoDireccion, {
      through: {
        pais, ciudad,
      },
      transaction,
    });

    let empresa;
    if (empresaNombre) {
      const empresaData = { nombre: empresaNombre, activo: true };
      if (usuario.Empresa) {
        empresa = await usuario.Empresa.update(empresaData);
      } else {
        empresa = await Empresa.create(empresaData);
        await usuario.setEmpresa(empresa);
      }
    }

    await transaction.commit();
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "createPersonaProfile()",
      params: data
    });

    await transaction.rollback();
    throw error;
  }

  return persona;
};

const updatePersonaProfile = async (usuario, persona, data) => {
  const transaction = await db.transaction();
  const {
    nickname, nombre, apellido, empresa: empresaNombre, direccion, telefono
  } = data;

  const {
    pais, ciudad,
  } = direccion;

  try {
    await persona.update({
      nickname, nombre, apellido, empresa: empresaNombre
    }, { transaction });

    await persona.setContactoTelefonico([], { transaction });
    await persona.setDireccionTipoDireccion([], { transaction });

    const tipoTelefono = await TipoTelefonoUtils.getTipoTelefonoById(tipoTelefonoMovilId);
    await persona.addContactoTelefonico(tipoTelefono, {
      through: {
        telefono,
        fecha_creacion: null,
      },
      transaction,
    });

    const tipoDireccion = await TipoDireccionUtils.getTipoDireccionById(tipoDireccionDomicilioId);
    await persona.addDireccionTipoDireccion(tipoDireccion, {
      through: {
        pais, ciudad,
      },
      transaction,
    });

    let empresa;
    if (empresaNombre) {
      const empresaData = { nombre: empresaNombre, activo: true };
      if (usuario.Empresa) {
        empresa = await usuario.Empresa.update(empresaData);
      } else {
        empresa = await Empresa.create(empresaData);
        await usuario.setEmpresa(empresa);
      }
    }

    await transaction.commit();
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "updatePersonaProfile()",
      params: data
    });

    await transaction.rollback();
    throw error;
  }
  return persona;
};

module.exports = {
  createPersona,
  getAllPersona,
  getActivePersona,
  getPersonaById,
  addContactoTelefonico,
  getPersonaByIdentificacion,
  createPersonaProfile,
  updatePersonaProfile,
};
