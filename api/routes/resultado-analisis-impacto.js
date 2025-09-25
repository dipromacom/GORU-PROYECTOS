const express = require('express');
const ResultadosAnalisisImpactoController = require('../controllers/resultado-analisis-ambiental');

const router = express.Router();

// Obtener todos los análisis de impacto
router.get('/resultadoAnalisis/', ResultadosAnalisisImpactoController.getAllResultadosAnalisisImpacto);
router.get('/resultadoAnalisis/:id', ResultadosAnalisisImpactoController.getResultadoAnalisisImpactoById);
router.post('/resultadoAnalisis/', ResultadosAnalisisImpactoController.createResultadoAnalisisImpacto);
router.put('/resultadoAnalisis/:id', ResultadosAnalisisImpactoController.updateResultadoAnalisisImpacto);
module.exports = router;
