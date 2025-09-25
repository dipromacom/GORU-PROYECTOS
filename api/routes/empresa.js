const express = require('express');
const EmpresaController = require('../controllers/empresa');

const router = express.Router();

router.get('/empresa', EmpresaController.getAllEmpresa);
router.get('/empresa/activo', EmpresaController.getActiveEmpresa);
router.get('/empresa/:id', EmpresaController.getEmpresaById);
router.post('/empresa', EmpresaController.createEmpresa);

module.exports = router;
