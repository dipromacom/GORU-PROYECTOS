// utils/rol-proyecto-utils.js

const { RolProyecto, PermisoProyecto, UsuarioProyecto, Usuario, Proyecto } = require('../models/index');
const ColabConfigUtils = require('./config-colaboradores-proyecto-utils');
const { Op } = require('sequelize');
// const logger = require('../logger/logger'); // Asumiendo que tienes logger y path importados

// --- Funciones CRUD de Rol de Proyecto ---

// Obtener un rol de proyecto con sus permisos
const getRolProyectoById = async (id) => {
    return RolProyecto.findByPk(id, {
        include: [{ model: PermisoProyecto, as: 'PermisosProyecto', through: { attributes: [] } }]
    });
};

// Obtener todos los roles de proyecto
const getAllRolesProyecto = async () => {

    return RolProyecto.findAll({
        // Incluimos la asociación 'PermisosProyecto' tal como la definiste en el modelo
        include: [{
            model: PermisoProyecto,
            as: 'PermisosProyecto',
            // Esto asegura que solo se traigan los campos del permiso, no los de la tabla intermedia (rol_proyecto_permiso)
            through: { attributes: [] }
        }]
    });
};

/**
 * Crea un rol de proyecto y asigna permisos.
 * @param {object} data - Datos del rol (nombre, descripcion).
 * @param {Array<number>} [permisosIds=[]] - IDs de los permisos a asignar.
 */
const createRolProyecto = async (data, permisosIds = []) => {
    const rol = await RolProyecto.create(data);
    if (permisosIds.length > 0) {
        // Los permisos deben existir antes de ser añadidos.
        await rol.setPermisosProyecto(permisosIds);
    }
    return getRolProyectoById(rol.id);
};

/**
 * Actualiza un rol de proyecto, incluyendo sus permisos asociados.
 * @param {number} id - ID del rol a actualizar.
 * @param {object} data - Nuevos datos del rol.
 * @param {Array<number>} [permisosIds] - Nuevos IDs de permisos (opcional: si es undefined, no se actualizan los permisos).
 */
const updateRolProyecto = async (id, data, permisosIds) => {
    const rol = await RolProyecto.findByPk(id);
    if (!rol) throw new Error('Rol de Proyecto no encontrado');

    await rol.update(data);

    // Si 'permisosIds' viene definido (incluso si es un array vacío), actualiza la asociación.
    if (permisosIds !== undefined) {
        await rol.setPermisosProyecto(permisosIds); // Reemplaza todos los permisos
    }

    return getRolProyectoById(id);
};

// Elimina un rol de proyecto
const deleteRolProyecto = async (id) => {
    const deletedCount = await RolProyecto.destroy({
        where: { id: id }
    });
    // Devuelve el número de filas eliminadas (1 si se eliminó, 0 si no)
    return deletedCount > 0;
};


// --- Funciones CRUD de Permiso de Proyecto ---

// Obtener todos los permisos de proyecto disponibles
const getAllPermisosProyecto = async () => {
    return PermisoProyecto.findAll({
        attributes: ['id', 'nombre', 'descripcion']
    });
};

// Obtener un permiso por ID
const getPermisoProyectoById = async (id) => {
    return PermisoProyecto.findByPk(id);
};

// Crear un permiso de proyecto
const createPermisoProyecto = async (data) => {
    return PermisoProyecto.create(data);
};

// Actualizar un permiso de proyecto
const updatePermisoProyecto = async (id, data) => {
    const permiso = await PermisoProyecto.findByPk(id);
    if (!permiso) throw new Error('Permiso de Proyecto no encontrado');

    await permiso.update(data);
    return permiso;
};

// Eliminar un permiso de proyecto
const deletePermisoProyecto = async (id) => {
    const deletedCount = await PermisoProyecto.destroy({
        where: { id: id }
    });
    return deletedCount > 0;
};

// --- Funciones de Asignación (Ya existente) ---

const assignRolProyectoToUsuario = async (usuarioId, proyectoId, rolProyectoId) => {
    const proyecto = await Proyecto.findByPk(proyectoId, { attributes: ['id', 'modo', 'empresa', 'nombre'] });
    if (!proyecto) {
        const e = new Error('Proyecto no encontrado.');
        e.statusCode = 404;
        throw e;
    }

    const usuarioAsignado = await Usuario.findByPk(usuarioId, { attributes: ['id', 'empresa'] });
    if (!usuarioAsignado) {
        const e = new Error('Usuario no encontrado.');
        e.statusCode = 404;
        throw e;
    }

    if (
        proyecto.empresa != null
        && usuarioAsignado.empresa != null
        && Number(proyecto.empresa) !== Number(usuarioAsignado.empresa)
    ) {
        const e = new Error('Solo puede asignar usuarios de la misma empresa del proyecto.');
        e.statusCode = 403;
        throw e;
    }

    const configPlain = await ColabConfigUtils.getConfigPlain();
    const max = ColabConfigUtils.getMaxColaboradoresForModo(proyecto.modo || 'P', configPlain);

    const existing = await UsuarioProyecto.findOne({
        where: { usuario_id: usuarioId, proyecto_id: proyectoId },
    });
    const colCount = await UsuarioProyecto.count({
        where: { proyecto_id: proyectoId, rol_proyecto_id: { [Op.ne]: null } },
    });

    const wouldAddSlot = !existing || existing.rol_proyecto_id == null;
    if (wouldAddSlot && colCount >= max) {
        const e = new Error(
            `Se alcanzó el máximo de colaboradores con rol para este proyecto (${max}). `
            + 'El límite lo define la plataforma según el tipo de proyecto (personal, equipo o programa).'
        );
        e.statusCode = 403;
        throw e;
    }

    const [asignacion, created] = await UsuarioProyecto.findOrCreate({
        where: { usuario_id: usuarioId, proyecto_id: proyectoId },
        defaults: { rol_proyecto_id: rolProyectoId }
    });

    if (!created) {
        await asignacion.update({ rol_proyecto_id: rolProyectoId });
    }

    return UsuarioProyecto.findOne({
        where: { usuario_id: usuarioId, proyecto_id: proyectoId },
        include: [{ model: RolProyecto, as: 'RolProyecto' }]
    });
};

/**
 * Obtiene la lista de usuarios y su rol asignado a un proyecto.
 * @param {number} proyectoId - ID del proyecto.
 */
const getUsuariosProyecto = async (proyectoId) => {
    return UsuarioProyecto.findAll({
        where: { proyecto_id: proyectoId },
        attributes: ['usuario_id', 'rol_proyecto_id'],
        include: [
            {
                model: Usuario,
                as: 'Usuario',
                attributes: ['id', 'username'] // Solo username e id
            },
            {
                model: RolProyecto,
                as: 'RolProyecto',
                attributes: ['id', 'nombre']
            }
        ],
    });
};

/**
 * Elimina un usuario de la tabla UsuarioProyecto (desasignar).
 */
const deleteUsuarioProyecto = async (usuarioId, proyectoId) => {
    const deletedCount = await UsuarioProyecto.destroy({
        where: { usuario_id: usuarioId, proyecto_id: proyectoId }
    });
    return deletedCount > 0;
};

/**
 * Obtiene el rol asignado a un usuario en un proyecto específico, o null si no está en la tabla.
 */
const getUserProjectRol = async (usuarioId, proyectoId) => {
    const usuarioProyecto = await UsuarioProyecto.findOne({
        where: { usuario_id: usuarioId, proyecto_id: proyectoId },
        attributes: ['rol_proyecto_id'],
        include: [{
            model: RolProyecto,
            as: 'RolProyecto',
            // Incluimos los permisos si existe un rol asignado
            include: [{ model: PermisoProyecto, as: 'PermisosProyecto', through: { attributes: [] } }]
        }]
    });

    if (!usuarioProyecto) {
        return null;
    }

    return usuarioProyecto.RolProyecto;
};

/**
 * Obtiene todos los permisos (para el caso Admin/Creador)
 */
const getAllAdminPermisos = async () => {
    // Si usas el campo 'clave' en PermisoProyecto, es mejor. Si no, usa 'nombre'.
    const permisos = await PermisoProyecto.findAll({ attributes: ['id', 'nombre'] });
    return permisos;
};


module.exports = {
    // Roles CRUD
    getRolProyectoById,
    getAllRolesProyecto,
    createRolProyecto,
    updateRolProyecto,
    deleteRolProyecto,

    // Permisos CRUD
    getAllPermisosProyecto,
    getPermisoProyectoById,
    createPermisoProyecto,
    updatePermisoProyecto,
    deletePermisoProyecto,

    // Asignación
    assignRolProyectoToUsuario,

    getUsuariosProyecto,
    deleteUsuarioProyecto,
    getUserProjectRol,
    getAllAdminPermisos,
};