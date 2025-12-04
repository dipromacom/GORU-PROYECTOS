/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const bcrypt = require('bcrypt');
const path = require('path');
const { Usuario } = require('../models/index');
const {
  Empresa, Persona, TipoLicencia, NivelPermiso, DirectorProyecto,
  Proyecto, Menu, ContactoTelefonico, Direccion, TipoTelefono,
  TipoDireccion, Ciudad, Rol, Permiso,
} = require('../models/index');

const logger = require('../logger/logger');

const file = path.basename(__filename);

const DateUils = require('./date-utils');
const TipoLicenciaUtils = require('./tipo-licencia-utils');

let DEFAULT_ROL_ID = null;

(async () => {
  try {
    const defaultRol = await Rol.findOne({ where: { nombre: 'colaborador' } });
    if (defaultRol) {
      DEFAULT_ROL_ID = defaultRol.id;
    } else {
      logger.warn({ message: 'Rol por defecto "colaborador" no encontrado. Esto puede causar errores de FK.' });
    }
  } catch (e) {
    logger.error({ message: `Error al obtener Rol por defecto: ${e.message}` });
  }
})();

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
        model: Rol,
        as: 'Rol',
        attributes: ['id', 'nombre'], // Sólo nombre del rol
        include: { // Incluir los permisos del rol (opcional, pero útil)
          model: Permiso,
          as: 'permisos',
          attributes: ['nombre'],
          through: { attributes: [] } // No incluir campos de la tabla pivote
        }
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

    const rol_id = data.rol_id || DEFAULT_ROL_ID;
    if (!rol_id) {
      throw new Error('No se pudo determinar el ID del rol para el nuevo usuario.');
    }

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
      rol_id: rol_id,
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
      include: { // <-- Añadimos la inclusión del rol
        model: Rol,
        as: 'Rol',
        attributes: ['id', 'nombre'],
        include: {
          model: Permiso,
          as: 'permisos',
          attributes: ['nombre'],
          through: { attributes: [] }
        }
      },
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

/**
 * Actualiza el rol de un usuario existente.
 * @param {number} userId - ID del usuario a modificar.
 * @param {number} rolId - Nuevo ID del rol a asignar.
 * @returns {Promise<Usuario>} El objeto Usuario actualizado (con su rol y permisos cargados).
 */
const updateUsuarioRol = async (userId, rolId) => {
  try {
    const usuario = await Usuario.findByPk(userId);

    if (!usuario) {
      throw new Error(`Usuario con ID ${userId} no encontrado.`);
    }

    // Verificación de existencia del Rol
    const rolExiste = await Rol.findByPk(rolId);

    if (!rolExiste) {
      throw new Error(`Rol con ID ${rolId} no encontrado.`);
    }

    // Actualizar el rol_id
    await usuario.update({ rol_id: rolId });

    // Obtener el usuario completo con las nuevas asociaciones (rol y permisos) para la respuesta
    const updatedUsuario = await getUsuarioById(userId);

    return updatedUsuario;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "updateUsuarioRol()",
      params: { userId, rolId },
    });
    throw error;
  }
};

module.exports = {
  getUsuarioById,
  createUsuario,
  getUsuarioByEmail,
  getOnbStep,
  setTipoLicencia,
  updatePassword,
  getUsuarioByAwsId,
  updateUsuarioRol,
};
