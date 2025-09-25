const express = require('express');
const TipoEvaluacionController = require('../controllers/tipo-evaluacion');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.get('/tipo-evaluacion', TipoEvaluacionController.getAllTipoEvaluacion);
router.get('/tipo-evaluacion/activo', TipoEvaluacionController.getActiveTipoEvaluacion);
router.get('/tipo-evaluacion/:id', TipoEvaluacionController.getTipoEvaluacionById);
router.get('/tipo-evaluacion/:id/criterios', TipoEvaluacionController.getCriteriosByTipoEvaluacionId);
router.get('/tipo-evaluacion/:id/opciones', SecurityUtils.validateToken(TipoEvaluacionController.getOpcionesByTipoEvaluacionId));

module.exports = router;
