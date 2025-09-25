const express = require('express');
const OpcionCustomController = require('../controllers/opcion-custom');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.get('/opcion/custom/:id', SecurityUtils.validateToken(OpcionCustomController.getOpcionCustomById));
router.put('/opcion/custom/:id', SecurityUtils.validateToken(OpcionCustomController.updateOpcionCustomById));
router.put('/opcion/custom/:id/deactivate', SecurityUtils.validateToken(OpcionCustomController.deactivateOpcionCustomById));
router.post('/opcion/custom', SecurityUtils.validateToken(OpcionCustomController.addOpcionCustom));

module.exports = router;