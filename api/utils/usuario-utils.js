/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const bcrypt = require('bcrypt');
const path = require('path');
const { Usuario } = require('../models/index');
const {
  Empresa, Persona, TipoLicencia, NivelPermiso, DirectorProyecto,
  Proyecto, Menu, ContactoTelefonico, Direccion, TipoTelefono,
  TipoDireccion, Ciudad,
} = require('../models/index');

const logger = require('../logger/logger');

const file = path.basename(__filename);

const DateUils = require('./date-utils');
const TipoLicenciaUtils = require('./tipo-licencia-utils');

const getUsuarioById = async (id) => {
  const item = await Usuario.findOne({
    where: {
      id, suspendido: false, eliminado: false,
    },
    attributes: ['id', 'username', 'persona'],
    include: [
      {
        model: Persona,
        as: 'Persona',
        include: [
          {
            model: DirectorProyecto,
            as: 'DirectorProyecto',
            attributes: ['id', 'activo'],
            include: {
              model: Proyecto,
              as: 'Proyecto',
              where: { activo: true },
              required: false,
            },
          },
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
      },
      {
        model: Empresa,
        as: 'Empresa',
        attributes: ['id', 'nombre'],
      },
      {
        model: NivelPermiso,
        as: 'NivelPermiso',
        attributes: ['id', 'nombre', 'abreviatura'],
      },
      {
        model: TipoLicencia,
        as: 'TipoLicencia',
        include: {
          model: Menu,
          as: 'PermisoLicencia',
          attributes: ['id', 'nombre'],
          through: {
            attributes: [],
          },
        },
      },
    ],
  });

  return item;
};

const createUsuario = async (data) => {
  try {
    let {
      empresa, persona, tipoLicencia, nivelPermiso, username, clave, awsId,
    } = data;

    const hashedPassword = bcrypt.hashSync(clave, Number(process.env.SALT_ROUNDS));

    const usuario = await Usuario.create({
      empresa,
      persona,
      tipo_licencia: tipoLicencia,
      nivel_permiso: nivelPermiso,
      username: username.toLowerCase(),
      clave: hashedPassword,
      fecha_creacion: DateUils.getLocalDate(),
      ultima_sesion: null,
      fecha_suspension: null,
      fecha_eliminacion: null,
      fecha_limite_licencia: null,
      suspendido: false,
      eliminado: false,
      aws_id: awsId,
      confirmado: false,
    });

    return usuario;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "createUsuario()",
      params: data
    });

    throw error;
  }
};

const getUsuarioByEmail = async (email) => {
  try {
    const usuario = await Usuario.findOne({
      where: { username: email },
    });

    return usuario;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "getUsuarioByEmail()",
      params: email
    });

    throw error;
  }
};

const getUsuarioByAwsId = async (awsId) => {
  try {
    const usuario = await Usuario.findOne({
      where: { aws_id: awsId },
    });

    return usuario;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "getUsuarioByAwsId()"
    });

    throw error;
  }
};

const getOnbStep = (usuario) => {
/*   let page = '/desktop';
  if (usuario.tipo_licencia === null) {
    page = '/membership';
  } */

  const page = '/membership';
  return page;
};

const setTipoLicencia = async (usuario, tipoLicenciaId) => {
  try {
    let result = false;

    if (usuario.getTipoLicencia() != null) {
      const tipoLicencia = await TipoLicenciaUtils.getTipoLicenciaById(tipoLicenciaId);
      await usuario.setTipoLicencia(tipoLicencia);
      result = true;
    }

    return result;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "setTipoLicencia()",
    });

    throw error;
  }
};

const updatePassword = async (usuario, password) => {
  try {
    const hashedPassword = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));
    await usuario.update({ clave: hashedPassword });
    return usuario;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "updatePassword()",
      params: { usuario }
    });

    throw error;
  }
}

module.exports = {
  getUsuarioById,
  createUsuario,
  getUsuarioByEmail,
  getOnbStep,
  setTipoLicencia,
  updatePassword,
  getUsuarioByAwsId,
};
