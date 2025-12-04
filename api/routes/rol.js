const express = require('express');
const RolController = require('../controllers/rol'); 
const SecurityUtils = require('../utils/security-utils');
const PermisoMiddleware = require('../utils/permiso-middleware');

const router = express.Router();

const GESTIONAR_ROLES = 'rol_gestionar'; 

// Ruta para crear un rol (Requiere autenticación Y el permiso 'rol_gestionar')
router.post(
    '/rol',
    SecurityUtils.validateToken(
        PermisoMiddleware.check(GESTIONAR_ROLES)(RolController.createRol)
    )
);

// Ruta para obtener todos los roles (Requiere autenticación Y el permiso 'rol_gestionar')
router.get(
    '/rol',
    SecurityUtils.validateToken(
        PermisoMiddleware.check(GESTIONAR_ROLES)(RolController.getAllRoles)
    )
);

// Asignar/Actualizar permisos de un rol
router.put(
    '/rol/:id/permisos', // Ejemplo: PUT /api/rol/2/permisos
    SecurityUtils.validateToken(
        PermisoMiddleware.check(GESTIONAR_ROLES)(RolController.setPermisosToRol)
    )
);

module.exports = router;