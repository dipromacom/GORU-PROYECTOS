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
const { saveLog } = require('./log-service');

const logger = require('../logger/logger');

const file = path.basename(__filename);

const DateUils = require('./date-utils');
const TipoLicenciaUtils = require('./tipo-licencia-utils');
const { PLAN_PERSONAL_ID } = require('../constants/plan-licencia');

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
    attributes: ['id', 'username', 'persona', 'tipo_licencia'],
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

    const tipoLicenciaFinal = (tipoLicencia !== undefined && tipoLicencia !== null)
      ? tipoLicencia
      : PLAN_PERSONAL_ID;

    const usuario = await Usuario.create({
      empresa,
      persona,
      tipo_licencia: tipoLicenciaFinal,
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

    await saveLog({
      userId: usuario.id, // El ID del usuario que fue creado
      actionType: 'USER_CREATED',
      resourceType: 'Usuario',
      resourceId: usuario.id,
      details: {
        email: usuario.username,
        rol_id: usuario.rol_id
      }
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
      include: [
        {
          model: Rol,
          as: 'Rol',
          attributes: ['id', 'nombre'],
          include: {
            model: Permiso,
            as: 'permisos',
            attributes: ['nombre'],
            through: { attributes: [] },
          },
        },
        {
          model: TipoLicencia,
          as: 'TipoLicencia',
          attributes: ['id', 'nombre'],
        },
      ],
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
    const tipoLicencia = await TipoLicenciaUtils.getTipoLicenciaById(tipoLicenciaId);
    await usuario.setTipoLicencia(tipoLicencia);
    return true;
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

    await saveLog({
      userId: usuario.id,
      actionType: 'PASSWORD_UPDATED',
      resourceType: 'Usuario',
      resourceId: usuario.id,
      details: {
        message: `Contraseña de usuario ${usuario.username} cambiada.`
      }
    });

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

    const oldRolId = usuario.rol_id;

    // Verificación de existencia del Rol
    const rolExiste = await Rol.findByPk(rolId);

    if (!rolExiste) {
      throw new Error(`Rol con ID ${rolId} no encontrado.`);
    }

    // Actualizar el rol_id
    await usuario.update({ rol_id: rolId });

    await saveLog({
      userId: userId, // Usuario afectado. Mejorar si tienes el ID del admin.
      actionType: 'USER_ROL_UPDATED',
      resourceType: 'Usuario',
      resourceId: userId,
      details: {
        rol_id: {
          old: oldRolId,
          new: rolId
        }
      }
    });

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

/**
 * Actualiza la empresa de un usuario existente.
 * @param {number} userId - ID del usuario a modificar.
 * @param {number} empresaId - Nuevo ID de la empresa a asignar.
 * @returns {Promise<Usuario>} El objeto Usuario actualizado (con su nueva empresa).
 */
const updateUsuarioEmpresa = async (userId, empresaId) => {
  try {
    const usuario = await Usuario.findByPk(userId);

    if (!usuario) {
      throw new Error(`Usuario con ID ${userId} no encontrado.`);
    }

    // Verificación de existencia de la Empresa
    const empresaExiste = await Empresa.findByPk(empresaId);

    if (!empresaExiste) {
      throw new Error(`Empresa con ID ${empresaId} no encontrado.`);
    }

    // Actualizar el empresa_id
    await usuario.update({ empresa_id: empresaId });

    // Obtener el usuario completo con las nuevas asociaciones
    const updatedUsuario = await getUsuarioById(userId);

    return updatedUsuario;
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "updateUsuarioEmpresa()",
      params: { userId, empresaId },
    });
    throw error;
  }
};

/**
 * Obtiene todos los usuarios que pertenecen a una empresa específica.
 * @param {number} empresaId - ID de la empresa.
 * @returns {Promise<Array<Usuario>>} Lista de usuarios de la empresa.
 */
const getUsuariosByEmpresaId = async (empresaId) => {
  try {
    const items = await Usuario.findAll({
      where: {
        empresa: empresaId,
      },
      attributes: ['id', 'username', 'empresa', 'fecha_creacion'],

      include: [
        {
          model: Rol,
          as: 'Rol',
          attributes: ['id', 'nombre'],
        },
        {
          model: Empresa,
          as: 'Empresa',
          attributes: ['id', 'nombre'],
        },
      ],
      order: [['username', 'ASC']], // Ordenamos por el campo de correo
    });
    return items;
  } catch (error) {
    // logger.error({ ... }); 
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
  updateUsuarioEmpresa,
  getUsuariosByEmpresaId,
};
