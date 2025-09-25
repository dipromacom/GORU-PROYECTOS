const express = require('express');
const UsuarioController = require('../controllers/usuario');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.post('/usuario', UsuarioController.createUsuario);
router.post('/usuario/getToken', UsuarioController.generateToken);
router.get('/usuario/:id', SecurityUtils.validateToken(UsuarioController.getUsuarioById));
router.post('/usuario/setMembresia', SecurityUtils.validateToken(UsuarioController.setMembresia));
router.put('/usuario/:id/profile', SecurityUtils.validateToken(UsuarioController.updatePersonaProfile));
router.get('/usuario/email/available/:email', UsuarioController.isEmailAvalaible);
router.put('/usuario/:email/password/update', UsuarioController.updatePassword);

module.exports = router;
