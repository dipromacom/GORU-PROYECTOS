// utils/permiso-utils.js

const path = require('path');
const { Permiso } = require('../models/index');

const logger = require('../logger/logger');

const file = path.basename(__filename);

/**
 * Obtiene un Permiso por su ID.
 * @param {number} id - ID del Permiso.
 * @returns {Promise<Permiso|null>}
 */
const getPermisoById = async (id) => {
    try {
        const item = await Permiso.findOne({ where: { id } });
        return item;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getPermisoById()",
            params: id,
        });
        throw error;
    }
};

/**
 * Obtiene todos los Permisos.
 * @returns {Promise<Array<Permiso>>}
 */
const getAllPermisos = async () => {
    try {
        const items = await Permiso.findAll({
            // Aquí puedes añadir ordenación si es necesario, ej. orderBy: 'nombre'
        });
        return items;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getAllPermisos()",
        });
        throw error;
    }
};

/**
 * Crea un nuevo Permiso.
 * @param {object} data - Datos del permiso (nombre, descripcion).
 * @returns {Promise<Permiso>}
 */
const createPermiso = async (data) => {
    try {
        const { nombre, descripcion } = data;

        const permiso = await Permiso.create({
            nombre: nombre.toLowerCase(), // Es buena práctica normalizar el nombre
            descripcion
        });

        return permiso;
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "createPermiso()",
            params: data,
        });
        throw error;
    }
};

// Puedes añadir aquí funciones para updatePermiso y deletePermiso si las necesitas.

module.exports = {
    getPermisoById,
    getAllPermisos,
    createPermiso,
};