// controllers/rol-proyecto.js

const RolProyectoUtils = require('../utils/rol-proyecto-utils');
const { Proyecto, Usuario } = require('../models/index');
const { decodeToken } = require('../utils/security-utils');
const PermisoProyectoUtils = require('../utils/permiso-proyecto-utils');
const { P } = PermisoProyectoUtils;
const MailUtils = require('../utils/mail-utils');
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
        const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

/**
 * Invita por correo a alguien que aún no tiene cuenta en Goru (no agrega al proyecto).
 */
const postInvitacionCorreoExterno = async (req, res) => {
    const { id: proyectoId } = req.params;
    const { email } = req.body || {};
    try {
        const { authorization } = req.headers;
        const { id: solicitanteId } = decodeToken(authorization);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, solicitanteId, proyectoId, P.PROYECTO_MIEMBROS_GEST);
        if (!ok) return;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ success: false, message: 'Indique un correo electrónico.' });
        }
        const normalized = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
            return res.status(400).json({ success: false, message: 'Correo electrónico no válido.' });
        }

        const exist = await Usuario.findOne({ where: { username: normalized } });
        if (exist) {
            return res.status(400).json({
                success: false,
                message: 'Este correo ya corresponde a un usuario de Goru. Agréguelo como colaborador desde la lista de usuarios de su empresa.',
            });
        }

        const proyecto = await Proyecto.findByPk(proyectoId, { attributes: ['id', 'nombre'] });
        if (!proyecto) {
            return res.status(404).json({ success: false, message: 'Proyecto no encontrado.' });
        }

        const DEFAULT_REGISTRO_URL = 'https://goru.grupogonzalez.ec/signUp';
        const baseUrl = (process.env.FRONTEND_PUBLIC_URL || process.env.REACT_APP_PUBLIC_URL || '').replace(/\/$/, '');
        const registroUrl = baseUrl ? `${baseUrl}/signUp` : DEFAULT_REGISTRO_URL;
        const motivo = `Invitación a Goru — ${proyecto.nombre || 'Proyecto'}`;
        const nombreProy = proyecto.nombre || 'un proyecto';
        const mensaje = `Hola,

Le han invitado a colaborar en el proyecto "${nombreProy}" en la plataforma Goru.

Para crear su cuenta de usuario, ingrese a:
${registroUrl}

Una vez registrado y asociado a la misma empresa, quien le invitó podrá agregarlo al proyecto desde Configuración → Agregar colaborador al proyecto.

Este mensaje fue enviado automáticamente; no responda a este correo.`;

        await MailUtils.enviarMail(normalized, motivo, mensaje);
        return res.status(200).json({ success: true, message: 'Se envió el correo de invitación.' });
    } catch (error) {
        const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
        return res.status(status).json({ success: false, message: error.message });
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
        const data = usuarios.map((u) => (typeof u.toJSON === 'function' ? u.toJSON() : u));
        return res.status(200).json({ success: true, data });
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
    postInvitacionCorreoExterno,
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