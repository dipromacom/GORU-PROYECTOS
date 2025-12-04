const SecurityUtils = require('./security-utils');
const UsuarioUtils = require('./usuario-utils'); // Necesitamos este para buscar el usuario
const path = require('path');
const logger = require('../logger/logger');

const file = path.basename(__filename);

/**
 * Middleware para verificar si el usuario logueado tiene un permiso específico.
 * @param {string} requiredPermission - El nombre del permiso requerido (ej. 'rol_gestionar').
 * @returns {function} Un función que devuelve el middleware.
 */
const check = (requiredPermission) => (callback) => async (req, res) => {
    // 1. Obtener el token (asumiendo que validateToken ya se ejecutó o se ejecutará).
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        // En teoría, esto no debería pasar si se usa validateToken antes.
        return res.status(401).json({ success: false, message: "Token no proporcionado" });
    }

    try {
        // 2. Decodificar el token para obtener el ID del usuario
        // Nota: Necesitamos que decodeToken devuelva el ID del usuario
        const payload = SecurityUtils.decodeToken(authHeaders);
        const userId = payload.id;

        // 3. Cargar el usuario con su rol y permisos
        const usuario = await UsuarioUtils.getUsuarioById(userId);

        if (!usuario) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        // 4. Extraer los permisos
        const userPermissions = usuario.Rol.permisos.map(p => p.nombre);

        // 5. Verificar si el permiso requerido está en la lista del usuario
        const hasPermission = userPermissions.includes(requiredPermission);

        if (hasPermission) {
            // Adjuntar datos de usuario al request si es necesario (ej. req.user = usuario)
            // para que el controlador tenga acceso a ellos.
            req.user = usuario;

            // Si tiene el permiso, continuar con la función del controlador
            callback(req, res);
        } else {
            // 6. Denegar acceso
            logger.warn({
                message: `Acceso denegado a usuario ${userId} para permiso ${requiredPermission}`,
                source: file,
                method: "check()",
            });
            return res.status(403).json({ success: false, message: `Permiso requerido: ${requiredPermission}` });
        }

    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "check()",
        });
        // Si hay un error de decodificación de token o de BD, devolver 500 o 403
        return res.status(403).json({ success: false, message: "Error de autorización" });
    }
};

module.exports = {
    check,
};