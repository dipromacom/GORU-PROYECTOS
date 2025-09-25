const express = require('express');
const TipoLicenciaController = require('../controllers/tipo-licencia');

const router = express.Router();

router.get('/tipo-licencia', TipoLicenciaController.getAllTipoLicencia);
router.get('/tipo-licencia/activo', TipoLicenciaController.getActiveTipoLicencia);
router.get('/tipo-licencia/:id', TipoLicenciaController.getTipoLicenciaById);
router.post('/tipo-licencia', TipoLicenciaController.createTipoLicencia);
router.get('/tipo-licencia/:id/permisos', TipoLicenciaController.getPermisosByTipoLicenciaId);
router.put('/tipo-licencia/:id/menu', TipoLicenciaController.addMenu);

module.exports = router;
