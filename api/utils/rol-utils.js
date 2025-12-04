// utils/rol-utils.js

const path = require('path');
const { Rol, Permiso } = require('../models/index');

const logger = require('../logger/logger');

const file = path.basename(__filename);

/**
 * Obtiene un Rol por su ID, incluyendo sus Permisos.
 * @param {number} id - ID del Rol.
 * @returns {Promise<Rol|null>}
 */
const getRolById = async (id) => {
    try {
        const item = await Rol.findOne({
            where: { id },
            include: {
                model: Permiso,
                as: 'permisos',
                attributes: ['id', 'nombre', 'descripcion'],
                through: { attributes: [] },
            },
        });
        return item;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getRolById()",
            params: id,
        });
        throw error;
    }
};

/**
 * Obtiene todos los Roles, incluyendo sus Permisos.
 * @returns {Promise<Array<Rol>>}
 */
const getAllRoles = async () => {
    try {
        const items = await Rol.findAll({
            include: {
                model: Permiso,
                as: 'permisos',
                attributes: ['id', 'nombre', 'descripcion'],
                through: { attributes: [] },
            },
        });
        return items;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getAllRoles()",
        });
        throw error;
    }
};

/**
 * Crea un nuevo Rol y opcionalmente asocia permisos.
 * @param {object} data - Datos del rol (nombre, descripcion, y opcionalmente array de permisoIds).
 * @returns {Promise<Rol>}
 */
const createRol = async (data) => {
    try {
        const { nombre, descripcion, permisoIds = [] } = data;

        const rol = await Rol.create({ nombre, descripcion });

        // Asocia los permisos si se proporcionan IDs
        if (permisoIds.length > 0) {
            await rol.setPermisos(permisoIds);
        }

        return rol;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "createRol()",
            params: data,
        });
        throw error;
    }
};

/**
 * Asigna una lista de Permisos a un Rol. Esto reemplaza cualquier permiso existente.
 * @param {number} rolId - ID del Rol a modificar.
 * @param {Array<number>} permisoIds - Array de IDs de los Permisos a asignar.
 * @returns {Promise<Rol>} El Rol actualizado con sus nuevos permisos.
 */
const setPermisosToRol = async (rolId, permisoIds) => {
    try {
        const rol = await Rol.findByPk(rolId);

        if (!rol) {
            throw new Error(`Rol con ID ${rolId} no encontrado.`);
        }

        // El método setPermisos de Sequelize gestiona la tabla pivote:
        // - Elimina las entradas de permisos antiguos para ese rol.
        // - Crea nuevas entradas para los IDs proporcionados.
        await rol.setPermisos(permisoIds);

        // Volvemos a cargar el rol con sus nuevas asociaciones para devolver el objeto completo
        const updatedRol = await getRolById(rolId);

        return updatedRol;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "setPermisosToRol()",
            params: { rolId, permisoIds },
        });
        throw error;
    }
};

module.exports = {
    getRolById,
    getAllRoles,
    createRol,
    setPermisosToRol,
    // Aquí puedes añadir funciones para actualizar/eliminar Rol y gestionar permisos
};