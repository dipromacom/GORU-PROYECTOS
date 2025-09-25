const express = require('express');
const CriterioCustomController = require('../controllers/criterio-custom');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.get('/criterio/custom/:id', SecurityUtils.validateToken(CriterioCustomController.getCriterioCustomById));
router.put('/criterio/custom/:id', SecurityUtils.validateToken(CriterioCustomController.updateCriterioCustomById));
router.put('/criterio/custom/:id/deactivate', SecurityUtils.validateToken(CriterioCustomController.deactivateCriterioCustomById));
router.post('/criterio/custom', SecurityUtils.validateToken(CriterioCustomController.addCriterioCustom));

module.exports = router;