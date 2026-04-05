// controllers/rol-proyecto.js

const RolProyectoUtils = require('../utils/rol-proyecto-utils');
const { Proyecto } = require('../models/index');
const { decodeToken } = require('../utils/security-utils');
const PermisoProyectoUtils = require('../utils/permiso-proyecto-utils');
const { P } = PermisoProyectoUtils;
// const logger = require('../logger/logger'); // Asumiendo imports de logger y path

// --- Asignación de Rol (Ya existente) ---

const assignRolProyecto = async (req, res) => {
    const { usuarioId, proyectoId, rolProyectoId } = req.body;
    // La verificación de la empresa debe hacerse en un middleware o en esta función si se requiere.
    try {
        if (!usuarioId || !proyectoId || !rolProyectoId) {
            return res.status(400).json({ success: false, message: 'Faltan parámetros de asignación.' });
        }

        const { authorization } = req.headers;
        const { id: solicitanteId } = decodeToken(authorization);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, solicitanteId, proyectoId, P.PROYECTO_MIEMBROS_GEST);
        if (!ok) return;

        const asignacion = await RolProyectoUtils.assignRolProyectoToUsuario(
            usuarioId,
            proyectoId,
            rolProyectoId
        );

        return res.status(200).json({ success: true, data: asignacion });

    } catch (error) {
        // logger.error({ message: error.message, source: file, method: "assignRolProyecto" });
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- CRUD de Roles de Proyecto ---

const createRolProyecto = async (req, res) => {
    const { permisosIds, ...rolData } = req.body; // Separar los IDs de permisos del resto de datos
    try {
        const rol = await RolProyectoUtils.createRolProyecto(rolData, permisosIds);
        return res.status(201).json({ success: true, data: rol });
    } catch (error) {
        // logger.error(...)
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllRolesProyecto = async (req, res) => {
    try {
        const roles = await RolProyectoUtils.getAllRolesProyecto();
        return res.status(200).json({ success: true, data: roles });
    } catch (error) {
        // logger.error(...)
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateRolProyecto = async (req, res) => {
    const { id } = req.params;
    const { permisosIds, ...rolData } = req.body;

    try {
        const rol = await RolProyectoUtils.updateRolProyecto(id, rolData, permisosIds);
        return res.status(200).json({ success: true, data: rol });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        // logger.error(...)
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteRolProyecto = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await RolProyectoUtils.deleteRolProyecto(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Rol de Proyecto no encontrado' });
        }
        return res.status(204).json({ success: true, message: 'Rol de Proyecto eliminado' }); // 204 No Content
    } catch (error) {
        // logger.error(...)
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- CRUD de Permisos de Proyecto ---

const getAllPermisosProyecto = async (req, res) => {
    try {
        const permisos = await RolProyectoUtils.getAllPermisosProyecto();
        return res.status(200).json({ success: true, data: permisos });
    } catch (error) {
        // logger.error(...)
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createPermisoProyecto = async (req, res) => {
    try {
        const permiso = await RolProyectoUtils.createPermisoProyecto(req.body);
        return res.status(201).json({ success: true, data: permiso });
    } catch (error) {
        // logger.error(...)
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updatePermisoProyecto = async (req, res) => {
    const { id } = req.params;
    try {
        const permiso = await RolProyectoUtils.updatePermisoProyecto(id, req.body);
        return res.status(200).json({ success: true, data: permiso });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        // logger.error(...)
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deletePermisoProyecto = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await RolProyectoUtils.deletePermisoProyecto(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Permiso de Proyecto no encontrado' });
        }
        return res.status(204).json({ success: true, message: 'Permiso de Proyecto eliminado' });
    } catch (error) {
        // logger.error(...)
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getUsuariosProyecto = async (req, res) => {
    const { id: proyectoId } = req.params;
    try {
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, proyectoId, P.PROYECTO_MIEMBROS_VER);
        if (!ok) return;

        const usuarios = await RolProyectoUtils.getUsuariosProyecto(proyectoId);
        return res.status(200).json({ success: true, data: usuarios });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUsuarioProyecto = async (req, res) => {
    const { usuarioId, proyectoId } = req.params;
    try {
        const { authorization } = req.headers;
        const { id: solicitanteId } = decodeToken(authorization);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, solicitanteId, proyectoId, P.PROYECTO_MIEMBROS_GEST);
        if (!ok) return;

        const success = await RolProyectoUtils.deleteUsuarioProyecto(usuarioId, proyectoId);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
        }
        return res.status(204).send(); // 204 No Content
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getUserProjectRol = async (req, res) => {
    const { usuarioId, proyectoId } = req.params;
    try {
        const proyecto = await Proyecto.findByPk(proyectoId, { attributes: ['id', 'usuario_creador'] });
        if (!proyecto) {
            return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
        }

        const rol = await RolProyectoUtils.getUserProjectRol(usuarioId, proyectoId);
        if (rol) {
            return res.status(200).json({ success: true, data: rol });
        }

        if (Number(proyecto.usuario_creador) === Number(usuarioId)) {
            const permisos = await RolProyectoUtils.getAllAdminPermisos();
            return res.status(200).json({
                success: true,
                data: {
                    rol_proyecto_id: null,
                    nombre_rol: 'Administrador (Creador)',
                    PermisosProyecto: permisos.map((p) => ({ id: p.id, nombre: p.nombre })),
                },
            });
        }

        return res.status(403).json({ success: false, message: 'No tiene acceso a este proyecto.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    assignRolProyecto,
    // Roles
    createRolProyecto,
    getAllRolesProyecto,
    updateRolProyecto,
    deleteRolProyecto,
    // Permisos
    getAllPermisosProyecto,
    createPermisoProyecto,
    updatePermisoProyecto,
    deletePermisoProyecto,
    getUsuariosProyecto,
    deleteUsuarioProyecto,
    getUserProjectRol,
};