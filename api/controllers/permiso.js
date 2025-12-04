// controllers/permiso.js

const path = require('path');
const PermisoUtils = require('../utils/permiso-utils');

const logger = require('../logger/logger');

const file = path.basename(__filename);

const GESTIONAR_ROLES = 'rol_gestionar'; // Permiso necesario para administrar permisos

const getAllPermisos = async (req, res) => {
    try {
        const items = await PermisoUtils.getAllPermisos();
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getAllPermisos()",
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createPermiso = async (req, res) => {
    const data = req.body;
    try {
        if (!data.nombre) {
            return res.status(400).json({ success: false, message: 'El nombre del permiso es obligatorio' });
        }

        const permiso = await PermisoUtils.createPermiso(data);

        logger.info({ message: `Permiso "${permiso.nombre}" creado exitosamente` });
        return res.status(201).json({ success: true, data: permiso });

    } catch (error) {
        // En caso de duplicidad de nombre (Unique constraint)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'El nombre del permiso ya existe.' });
        }

        logger.error({
            message: error.message,
            source: file,
            method: "createPermiso()",
            params: data,
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllPermisos,
    createPermiso,
    // ... otros controladores de gestión de permiso (getById, update, delete)
};