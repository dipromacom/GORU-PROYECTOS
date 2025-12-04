const express = require('express');
const PermisoController = require('../controllers/permiso');
const SecurityUtils = require('../utils/security-utils');
const PermisoMiddleware = require('../utils/permiso-middleware');

const router = express.Router();

const GESTIONAR_ROLES = 'rol_gestionar'; // Permiso requerido para gestionar permisos

// Ruta para obtener todos los Permisos
router.get(
    '/permiso',
    SecurityUtils.validateToken(
        PermisoMiddleware.check(GESTIONAR_ROLES)(PermisoController.getAllPermisos)
    )
);

// Ruta para crear un nuevo Permiso
router.post(
    '/permiso',
    SecurityUtils.validateToken(
        PermisoMiddleware.check(GESTIONAR_ROLES)(PermisoController.createPermiso)
    )
);

module.exports = router;