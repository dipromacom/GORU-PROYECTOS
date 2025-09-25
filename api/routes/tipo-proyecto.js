const express = require('express');
const TipoProyectoController = require('../controllers/tipo-proyecto');

const router = express.Router();

router.get('/tipo-proyecto', TipoProyectoController.getAllTipoProyecto);
router.get('/tipo-proyecto/activo', TipoProyectoController.getActiveTipoProyecto);
router.get('/tipo-proyecto/:id', TipoProyectoController.getTipoProyectoById);
router.post('/tipo-proyecto', TipoProyectoController.createTipoProyecto);

module.exports = router;
