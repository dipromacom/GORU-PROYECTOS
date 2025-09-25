const express = require('express');
const DirectorProyectoController = require('../controllers/director-proyecto');

const router = express.Router();

router.get('/director-proyecto/', DirectorProyectoController.getAllDirectorProyecto);
router.get('/director-proyecto/activo', DirectorProyectoController.getActiveDirectorProyecto);
router.get('/director-proyecto/:id', DirectorProyectoController.getDirectorProyectoById);
router.post('/director-proyecto/:id/deshabilitar', DirectorProyectoController.deactivateDirectorProyecto);
router.post('/director-proyecto', DirectorProyectoController.createDirectorProyecto);

module.exports = router;
