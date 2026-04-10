const express = require('express');
const SecurityUtils = require('../utils/security-utils');
const AdminPlatformController = require('../controllers/admin-platform');

const router = express.Router();

router.get('/admin/usuarios', SecurityUtils.validateToken(AdminPlatformController.listUsuarios));
router.patch('/admin/usuarios/:id/tipo-licencia', SecurityUtils.validateToken(AdminPlatformController.patchUsuarioTipoLicencia));
router.patch('/admin/usuarios/:id/empresa', SecurityUtils.validateToken(AdminPlatformController.patchUsuarioEmpresa));
router.post('/admin/empresas', SecurityUtils.validateToken(AdminPlatformController.createEmpresa));

module.exports = router;
