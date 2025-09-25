const express = require('express');
const AnalisisImpactoController = require('../controllers/analisis-ambiental');

const router = express.Router();

router.get('/analisisAmbiental/', AnalisisImpactoController.getAllAnalisisImpacto);
router.get('./criteriosanalisis', AnalisisImpactoController.getAllEvaluacion);
router.get('/analisisAmbiental/:id', AnalisisImpactoController.getAnalisisImpactoById);
router.put('/analisisAmbiental/:id', AnalisisImpactoController.updateAnalisisImpacto);
router.post('/analisisAmbiental/', AnalisisImpactoController.createAnalisisImpacto);
module.exports = router;