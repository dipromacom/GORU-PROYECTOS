const express = require('express');
const TareaController = require('../controllers/tarea')

const router = express.Router();

router.get('/tarea/todo',TareaController.getUndoneTareas);
router.post('/tarea/', TareaController.createTarea)
router.post('/tarea/batch',TareaController.createTareaBatch)
router.put('/tarea/:id/done', TareaController.markTaskAsDone)

router.get('/tarea/usuario/:usuarioId', TareaController.getTareasDashboard);


module.exports = router