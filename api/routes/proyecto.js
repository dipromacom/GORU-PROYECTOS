const express = require('express');
const ProyectoController = require('../controllers/proyecto');
const KabanController = require('../controllers/kanban');
const GanttController = require('../controllers/gantt');
const WhiteBoartController = require('../controllers/whiteboard');
const RolProyectoController = require('../controllers/rol-proyecto')

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
router.post('/proyecto/:id/whiteboard', WhiteBoartController.setWhiteboard);
router.get('/proyecto/:id/whiteboard', WhiteBoartController.getWhiteboard);
router.delete('/proyecto/:id/whiteboard', WhiteBoartController.deleteWhiteboard);
//roles y permisos por proyecto
router.post('/proyecto/asignarRol', RolProyectoController.assignRolProyecto);
router.get('/proyecto/roles', RolProyectoController.getAllRolesProyecto);
router.post('/proyecto/roles',RolProyectoController.createRolProyecto);
router.put('/proyecto/roles/:id',RolProyectoController.updateRolProyecto);
router.delete('/proyecto/roles/:id',RolProyectoController.deleteRolProyecto);
router.get('/proyecto/permisos', RolProyectoController.getAllPermisosProyecto);
router.post('/proyecto/permisos',RolProyectoController.createPermisoProyecto);
router.put('/proyecto/permisos/:id',RolProyectoController.updatePermisoProyecto);
router.delete('/proyecto/permisos/:id',RolProyectoController.deletePermisoProyecto);

module.exports = router;
