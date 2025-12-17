const express = require('express');
const UsuarioController = require('../controllers/usuario');
const SecurityUtils = require('../utils/security-utils');
const PermisoMiddleware = require('../utils/permiso-middleware');

const router = express.Router();

const GESTIONAR_ROLES = 'rol_gestionar';

router.post('/usuario', UsuarioController.createUsuario);
router.post('/usuario/getToken', UsuarioController.generateToken);
router.get('/usuario/:id', SecurityUtils.validateToken(UsuarioController.getUsuarioById));
router.post('/usuario/setMembresia', SecurityUtils.validateToken(UsuarioController.setMembresia));
router.put('/usuario/:id/profile', SecurityUtils.validateToken(UsuarioController.updatePersonaProfile));
router.get('/usuario/email/available/:email', UsuarioController.isEmailAvalaible);
router.put('/usuario/:email/password/update', UsuarioController.updatePassword);
router.put('/usuario/:id/rol',SecurityUtils.validateToken( PermisoMiddleware.check(GESTIONAR_ROLES)(UsuarioController.updateUsuarioRol)));
router.put('/usuario/:id/empresa',SecurityUtils.validateToken(PermisoMiddleware.check(GESTIONAR_ROLES)(UsuarioController.updateUsuarioEmpresa)));
router.get('/empresa/:id/usuarios',SecurityUtils.validateToken(UsuarioController.getUsuariosByEmpresa));
module.exports = router;
