const express = require('express');
const DepartamentoController = require('../controllers/departamento');

const router = express.Router();

router.get('/departamento', DepartamentoController.getAllDepartamento);
router.get('/departamento/activo', DepartamentoController.getActiveDepartamento);
router.get('/departamento/:id', DepartamentoController.getDepartamentoById);
router.post('/departamento', DepartamentoController.createDepartamento);

module.exports = router;
