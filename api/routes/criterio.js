const express = require('express');
const CriterioController = require('../controllers/criterio');

const router = express.Router();

router.get('/criterio/:id', CriterioController.getCriterioById);
router.get('/criterio/activo/tipoEvaluacion/:id', CriterioController.getActiveCriterioByTipoEvaluacion);
router.get('/criterio/:id/opciones', CriterioController.getOpcionesByCriterioId);

module.exports = router;
