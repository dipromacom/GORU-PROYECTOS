const express = require('express');
const ProyectoController = require('../controllers/proyecto');
const KabanController = require('../controllers/kanban');
const GanttController = require('../controllers/gantt');

const router = express.Router();

router.get('/proyecto', ProyectoController.getAllProyecto);
router.get('/proyecto/activo', ProyectoController.getActiveProyecto);
router.get('/proyecto/:id', ProyectoController.getProyectoById);
router.post('/proyecto', ProyectoController.createProyecto);
router.post('/proyecto/generalData', ProyectoController.createProyectoGeneralData);
router.post('/proyecto/activate', ProyectoController.activarProyecto);
router.post('/proyecto/cerrar', ProyectoController.cerrarProyecto);
router.post('/proyecto/estado', ProyectoController.updateEstadoProyecto);
router.put('/proyecto/:id', ProyectoController.updateProyecto)
router.put('/proyecto/:id/generalData', ProyectoController.updateProyectoGeneralData)
router.post('/proyecto/:id/kanban', KabanController.setKanban)
router.get('/proyecto/:id/kanban', KabanController.getKanban)
router.post('/proyecto/:id/gantt', GanttController.setGantt)
router.get('/proyecto/:id/gantt', GanttController.getGantt)
router.delete('/proyecto/:id/gantt/:taskId', GanttController.deleteGantt)

module.exports = router;
