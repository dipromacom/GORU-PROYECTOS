// controllers/rol.js

const path = require('path');
const RolUtils = require('../utils/rol-utils'); // <-- Importar las nuevas utils

const logger = require('../logger/logger');

const file = path.basename(__filename);

const getAllRoles = async (req, res) => {
    // Nota: Esta ruta debería estar protegida con un middleware de permisos
    // que valide si el usuario tiene, por ejemplo, 'rol_gestionar'.
    try {
        const items = await RolUtils.getAllRoles();
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getAllRoles()",
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createRol = async (req, res) => {
    // Nota: Esta ruta también requiere un permiso de alto nivel, ej. 'rol_gestionar'.
    const data = req.body;
    try {
        // Validación básica (puedes añadir más si lo necesitas)
        if (!data.nombre) {
            return res.status(400).json({ success: false, message: 'El nombre del rol es obligatorio' });
        }

        const rol = await RolUtils.createRol(data);

        logger.info({ message: `Rol "${rol.nombre}" creado exitosamente` });
        return res.status(201).json({ success: true, data: rol });

    } catch (error) {
        // En caso de duplicidad de nombre (Unique constraint), Sequelize devuelve un error
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'El nombre del rol ya existe.' });
        }

        logger.error({
            message: error.message,
            source: file,
            method: "createRol()",
            params: data,
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

const setPermisosToRol = async (req, res) => {
    // Permiso requerido: 'rol_gestionar' (ya validado por el middleware)
    const { id } = req.params;
    const { permisoIds } = req.body; // Esperamos un array de IDs aquí

    try {
        if (!permisoIds || !Array.isArray(permisoIds)) {
            return res.status(400).json({ success: false, message: 'Se requiere un array de permisoIds en el cuerpo de la solicitud.' });
        }

        const updatedRol = await RolUtils.setPermisosToRol(id, permisoIds);

        logger.info({ message: `Permisos actualizados para el Rol con ID ${id}` });
        return res.status(200).json({ success: true, data: updatedRol });

    } catch (error) {
        // Manejar error si el Rol no existe o si algún permisoId es inválido
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ success: false, message: error.message });
        }

        logger.error({
            message: error.message,
            source: file,
            method: "setPermisosToRol()",
            params: { id, body: req.body },
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllRoles,
    createRol,
    setPermisosToRol,
    // ... otros controladores de gestión de rol (getById, update, delete)
};