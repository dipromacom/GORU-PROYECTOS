const express = require('express');
const AnalisisImpactoController = require('../controllers/analisis-ambiental');

const router = express.Router();

router.get('/criterioAnalisis/', AnalisisImpactoController.getAllEvaluacion);
module.exports = router;