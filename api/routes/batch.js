const express = require('express');
const BatchController = require('../controllers/batch');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.post('/batch', SecurityUtils.validateToken(BatchController.createBatch));
router.get('/batch/user/:id', SecurityUtils.validateToken(BatchController.usuarioHasActiveBatch));
router.put('/batch/tipoEvaluacion/:id/start', SecurityUtils.validateToken(BatchController.startBatchSetup));
router.get('/batch/status', SecurityUtils.validateToken(BatchController.getBatchStatus));
router.put('/batch/tipoEvaluacion/:id/update', SecurityUtils.validateToken(BatchController.updateBatchSetup));
router.put('/batch/close/user/:id', SecurityUtils.validateToken(BatchController.closeBatch));
router.get('/batch/closed/user/:id', BatchController.getClosedBatches);
router.get('/batch/:id', BatchController.getBatchDetailsById);
router.get('/batch/project/:id', BatchController.getBatchByProjectId);

module.exports = router;
