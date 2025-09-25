const express = require('express');
const TipoTelefonoController = require('../controllers/tipo-telefono');

const router = express.Router();

router.get('/tipo-telefono', TipoTelefonoController.getAllTipoTelefono);
router.get('/tipo-telefono/activo', TipoTelefonoController.getActiveTipoTelefono);
router.get('/tipo-telefono/:id', TipoTelefonoController.getTipoTelefonoById);

module.exports = router;
