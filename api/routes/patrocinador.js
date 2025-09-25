const express = require('express');
const PatrocinadorController = require('../controllers/patrocinador');

const router = express.Router();

router.get('/patrocinador/', PatrocinadorController.getAllPatrocinador);
router.get('/patrocinador/activo', PatrocinadorController.getActivePatrocinador);
router.get('/patrocinador/:id', PatrocinadorController.getPatrocinadorById);
router.post('/patrocinador/:id/deshabilitar', PatrocinadorController.deactivatePatrocinador);
router.post('/patrocinador', PatrocinadorController.createPatrocinador);

module.exports = router;
