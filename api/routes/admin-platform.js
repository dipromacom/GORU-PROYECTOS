const express = require('express');
const SecurityUtils = require('../utils/security-utils');
const AdminPlatformController = require('../controllers/admin-platform');
const MadurezDireccionController = require('../controllers/madurez-direccion-proyectos');

const router = express.Router();

router.get('/admin/colaboradores-proyecto-config', SecurityUtils.validateToken(AdminPlatformController.getColaboradoresProyectoConfig));
router.put('/admin/colaboradores-proyecto-config', SecurityUtils.validateToken(AdminPlatformController.putColaboradoresProyectoConfig));

router.get('/admin/usuarios', SecurityUtils.validateToken(AdminPlatformController.listUsuarios));
router.patch('/admin/usuarios/:id/tipo-licencia', SecurityUtils.validateToken(AdminPlatformController.patchUsuarioTipoLicencia));
router.patch('/admin/usuarios/:id/empresa', SecurityUtils.validateToken(AdminPlatformController.patchUsuarioEmpresa));
router.post('/admin/empresas', SecurityUtils.validateToken(AdminPlatformController.createEmpresa));

router.get(
  '/admin/madurez-direccion-proyectos',
  SecurityUtils.validateToken(MadurezDireccionController.listAllAdmin)
);

module.exports = router;
