const express = require('express');
const EvaluacionController = require('../controllers/evaluacion');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.post('/evaluacion/usuario/:id', SecurityUtils.validateToken(EvaluacionController.saveEvaluacion));
router.get('/evaluacion/tipoEvaluacion/:id', SecurityUtils.validateToken(EvaluacionController.getEvaluacionResult));
router.get('/evaluacion/tipoEvaluacion/:tipoEvaluacion/batch/:batch', EvaluacionController.getEvaluacionResultByBatchIdAndUserId);

module.exports = router;
