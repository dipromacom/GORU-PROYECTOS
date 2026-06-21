const express = require('express');
const ProyectoController = require('../controllers/proyecto');
const KabanController = require('../controllers/kanban');
const encuestaController = require('../controllers/encuesta-satisfaccion');
const GanttController = require('../controllers/gantt');
const WhiteBoartController = require('../controllers/whiteboard');
const RolProyectoController = require('../controllers/rol-proyecto');
const logController = require('../controllers/log-controller');
const informeAvanceController = require('../controllers/informe-avance');
const solicitudCambioController = require('../controllers/solicitud-cambio');
const ProgramaController = require('../controllers/programa');
const interesadoController = require('../controllers/interesado');
const ScrumController = require('../controllers/scrum');

const router = express.Router();


// ─────────────────────────────────────────────
// 1. RUTAS ESTÁTICAS — GET
// ─────────────────────────────────────────────
router.get('/proyecto/activo', ProyectoController.getActiveProyecto);
router.get('/proyecto', ProyectoController.getAllProyecto);

// Roles y permisos (van antes de /:id para evitar conflicto)
router.get('/proyecto/roles', RolProyectoController.getAllRolesProyecto);
router.get('/proyecto/permisos', RolProyectoController.getAllPermisosProyecto);
router.get('/proyecto/config/colaboradores-max', ProyectoController.getColaboradoresMaxConfig);

// Dashboard por usuario (estáticas con subruta fija)
router.get('/proyecto/dashboard/gantt/usuario/:usuarioId', GanttController.getGanttByUser);
router.get('/proyecto/dashboard/kanban/usuario/:usuarioId', KabanController.getKanbanByUser);
router.get('/proyecto/dashboard/encuestas/usuario/:usuarioId', encuestaController.getEncuestasDashboard);
router.get('/proyecto/dashboard/informes/usuario/:usuarioId', informeAvanceController.getInformesDashboard);

// Programas (estáticas)
router.get('/proyecto/programas/lista', ProgramaController.getProgramasByUsuario);
router.get('/proyecto/encuesta-satisfaccion/verificar/:proyectoId', encuestaController.verificarEstadoEncuesta);
router.get('/proyecto/encuesta-satisfaccion/proyecto/:proyectoId', encuestaController.getEncuestasProyecto);
router.get('/proyecto/encuesta-satisfaccion/todas/:proyectoId', encuestaController.getAllEncuestasProyecto);

// Informe de avance por ID (estática con subruta fija)
router.get('/proyecto/informe-avance/:id', informeAvanceController.getInformeById);

// Destinatarios de correo (equipo + interesados); antes de GET /proyecto/:id
router.get('/proyecto/:proyectoId/correo/destinatarios', interesadoController.getDestinatariosCorreoProyecto);



// ─────────────────────────────────────────────
// 2. RUTAS ESTÁTICAS — POST / PUT / DELETE
// ─────────────────────────────────────────────
router.post('/proyecto', ProyectoController.createProyecto);
router.post('/proyecto/generalData', ProyectoController.createProyectoGeneralData);
router.post('/proyecto/activate', ProyectoController.activarProyecto);
router.post('/proyecto/cerrar', ProyectoController.cerrarProyecto);
router.post('/proyecto/estado', ProyectoController.updateEstadoProyecto);
router.post('/proyecto/asignarRol', RolProyectoController.assignRolProyecto);
router.post('/proyecto/:id/invitacion-correo-externo', RolProyectoController.postInvitacionCorreoExterno);

// Roles
router.post('/proyecto/roles', RolProyectoController.createRolProyecto);
router.put('/proyecto/roles/:id', RolProyectoController.updateRolProyecto);
router.delete('/proyecto/roles/:id', RolProyectoController.deleteRolProyecto);

// Permisos
router.post('/proyecto/permisos', RolProyectoController.createPermisoProyecto);
router.put('/proyecto/permisos/:id', RolProyectoController.updatePermisoProyecto);
router.delete('/proyecto/permisos/:id', RolProyectoController.deletePermisoProyecto);

// Encuesta satisfacción — acciones
router.post('/proyecto/encuesta-satisfaccion', encuestaController.guardarEncuesta);
router.post('/proyecto/encuesta-satisfaccion/rechazar', encuestaController.rechazarEncuesta);

// Control de cambios — create (sin :id)
router.post('/proyecto/control-cambio', solicitudCambioController.createSolicitud);

// Informe de avance — create (sin :id)
router.post('/proyecto/informe-avance', informeAvanceController.createInforme);
router.put('/proyecto/informe-avance/:id', informeAvanceController.updateInforme);
router.delete('/proyecto/informe-avance/:id', informeAvanceController.deleteInforme);


// ─────────────────────────────────────────────
// 3. RUTAS DINÁMICAS — con :id o :proyectoId
// ─────────────────────────────────────────────

// Proyecto base
router.get('/proyecto/:id', ProyectoController.getProyectoById);
router.put('/proyecto/:id', ProyectoController.updateProyecto);
router.put('/proyecto/:id/generalData', ProyectoController.updateProyectoGeneralData);

// Usuarios del proyecto
router.get('/proyecto/:id/usuarios', RolProyectoController.getUsuariosProyecto);
router.delete('/proyecto/:proyectoId/usuario/:usuarioId', RolProyectoController.deleteUsuarioProyecto);
router.get('/proyecto/:proyectoId/usuario/:usuarioId/rol', RolProyectoController.getUserProjectRol);

// Kanban
router.post('/proyecto/:id/kanban', KabanController.setKanban);
router.get('/proyecto/:id/kanban', KabanController.getKanban);

// Gantt
router.post('/proyecto/:id/gantt', GanttController.setGantt);
router.get('/proyecto/:id/gantt', GanttController.getGantt);
router.delete('/proyecto/:id/gantt/:taskId', GanttController.deleteGantt);

// Whiteboard
router.post('/proyecto/:id/whiteboard', WhiteBoartController.setWhiteboard);
router.get('/proyecto/:id/whiteboard', WhiteBoartController.getWhiteboard);
router.delete('/proyecto/:id/whiteboard', WhiteBoartController.deleteWhiteboard);

// Scrum
router.get('/proyecto/:id/scrum', ScrumController.getScrumOverview);
router.post('/proyecto/:id/scrum/epics', ScrumController.createEpic);
router.put('/proyecto/:id/scrum/epics/:epicId', ScrumController.updateEpic);
router.delete('/proyecto/:id/scrum/epics/:epicId', ScrumController.deleteEpic);
router.post('/proyecto/:id/scrum/stories', ScrumController.createStory);
router.put('/proyecto/:id/scrum/stories/reorder', ScrumController.reorderStories);
router.put('/proyecto/:id/scrum/stories/:storyId', ScrumController.updateStory);
router.post('/proyecto/:id/scrum/stories/:storyId/duplicate', ScrumController.duplicateStory);
router.post('/proyecto/:id/scrum/stories/:storyId/archive', ScrumController.archiveStory);
router.post('/proyecto/:id/scrum/stories/:storyId/unarchive', ScrumController.unarchiveStory);
router.delete('/proyecto/:id/scrum/stories/:storyId', ScrumController.deleteStory);
router.post('/proyecto/:id/scrum/priorities/recalculate', ScrumController.recalculatePriorities);
router.put('/proyecto/:id/scrum/config', ScrumController.updateConfig);
router.post('/proyecto/:id/scrum/sprints', ScrumController.createSprint);
router.put('/proyecto/:id/scrum/sprints/:sprintId', ScrumController.updateSprint);
router.delete('/proyecto/:id/scrum/sprints/:sprintId', ScrumController.deleteSprint);
router.get('/proyecto/:id/scrum/sprints/:sprintId/planning', ScrumController.getSprintPlanning);
router.put('/proyecto/:id/scrum/sprints/:sprintId/planning', ScrumController.saveSprintPlanning);
router.post('/proyecto/:id/scrum/sprints/:sprintId/stories/:storyId', ScrumController.assignStoryToSprint);
router.delete('/proyecto/:id/scrum/sprints/:sprintId/stories/:storyId', ScrumController.removeStoryFromSprint);
router.post('/proyecto/:id/scrum/sprints/:sprintId/clear', ScrumController.clearSprintStories);
router.post('/proyecto/:id/scrum/sprints/:sprintId/activate', ScrumController.activateSprint);
router.post('/proyecto/:id/scrum/sprints/:sprintId/close', ScrumController.closeSprint);


// Historial de estados
router.get('/proyecto/:proyectoId/estados', logController.getHistorialEstados);

// Informes de avance por proyecto
router.get('/proyecto/:proyectoId/informes-avance', informeAvanceController.getAllInformesByProyecto);

// Control de cambios por proyecto
router.put('/proyecto/control-cambio/:id/estado', solicitudCambioController.changeStatus);
router.get('/proyecto/:proyectoId/control-cambio', solicitudCambioController.getSolicitudesProyecto);

// Programa
router.get('/proyecto/:id/programa/proyectos', ProgramaController.getProyectosDelPrograma);
router.get('/proyecto/:id/programa/disponibles', ProgramaController.getProyectosDisponibles);
router.post('/proyecto/:id/programa/asignar', ProgramaController.asignarProyecto);
router.delete('/proyecto/:proyectoId/programa', ProgramaController.desasignarProyecto);

module.exports = router;