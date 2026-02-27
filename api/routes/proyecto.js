const express = require('express');
const ProyectoController = require('../controllers/proyecto');
const KabanController = require('../controllers/kanban');
const encuestaController = require('../controllers/encuesta-satisfaccion');
const GanttController = require('../controllers/gantt');
const WhiteBoartController = require('../controllers/whiteboard');
const RolProyectoController = require('../controllers/rol-proyecto');
const logController = require('../controllers/log-controller');
const informeAvanceController = require('../controllers/informe-avance');
const permisoMiddleware = require('../utils/permiso-middleware');

const router = express.Router();

// 1. RUTAS ESTÁTICAS (Deben ir PRIMERO)
router.get('/proyecto/activo', ProyectoController.getActiveProyecto);
router.get('/proyecto', ProyectoController.getAllProyecto); // Obtener todos (puede tener query params)

// --- RUTAS DE CONFIGURACIÓN DE ROLES (Mover aquí arriba) ---
// Estas causaban el conflicto porque "roles" y "permisos" se confundían con un ID
router.get('/proyecto/roles', RolProyectoController.getAllRolesProyecto);
router.get('/proyecto/permisos', RolProyectoController.getAllPermisosProyecto);

// 2. RUTAS POST/PUT ESPECÍFICAS (Sin parámetros dinámicos conflictivos)
router.post('/proyecto', ProyectoController.createProyecto);
router.post('/proyecto/generalData', ProyectoController.createProyectoGeneralData);
router.post('/proyecto/activate', ProyectoController.activarProyecto);
router.post('/proyecto/cerrar', ProyectoController.cerrarProyecto);
router.post('/proyecto/estado', ProyectoController.updateEstadoProyecto);
router.post('/proyecto/asignarRol', RolProyectoController.assignRolProyecto);

// Rutas de gestión de roles (Crear/Editar/Eliminar)
router.post('/proyecto/roles', RolProyectoController.createRolProyecto); // Añadir middleware si es necesario
router.put('/proyecto/roles/:id', RolProyectoController.updateRolProyecto);
router.delete('/proyecto/roles/:id', RolProyectoController.deleteRolProyecto);

router.post('/proyecto/permisos', RolProyectoController.createPermisoProyecto);
router.put('/proyecto/permisos/:id', RolProyectoController.updatePermisoProyecto);
router.delete('/proyecto/permisos/:id', RolProyectoController.deletePermisoProyecto);


// 3. RUTAS DINÁMICAS (Con :id) - Deben ir AL FINAL

router.get('/proyecto/:id/usuarios', RolProyectoController.getUsuariosProyecto); // NUEVO
router.delete('/proyecto/:proyectoId/usuario/:usuarioId', RolProyectoController.deleteUsuarioProyecto); // NUEVO
router.get('/proyecto/:proyectoId/usuario/:usuarioId/rol', RolProyectoController.getUserProjectRol); // NUEVO

// Express evalúa en orden. Si pones esto arriba, "/proyecto/roles" entra aquí y falla.
router.get('/proyecto/:id', ProyectoController.getProyectoById);
router.put('/proyecto/:id', ProyectoController.updateProyecto);
router.put('/proyecto/:id/generalData', ProyectoController.updateProyectoGeneralData);

// Rutas de submódulos con ID
router.post('/proyecto/:id/kanban', KabanController.setKanban);
router.get('/proyecto/:id/kanban', KabanController.getKanban);

router.post('/proyecto/:id/gantt', GanttController.setGantt);
router.get('/proyecto/:id/gantt', GanttController.getGantt);
router.delete('/proyecto/:id/gantt/:taskId', GanttController.deleteGantt);

router.post('/proyecto/:id/whiteboard', WhiteBoartController.setWhiteboard);
router.get('/proyecto/:id/whiteboard', WhiteBoartController.getWhiteboard);
router.delete('/proyecto/:id/whiteboard', WhiteBoartController.deleteWhiteboard);

//encuesta satisfacción
router.get('/proyecto/encuesta-satisfaccion/verificar/:proyectoId',encuestaController.verificarEstadoEncuesta);
router.get('/proyecto/encuesta-satisfaccion/proyecto/:proyectoId',encuestaController.getEncuestasProyecto);
router.post('/proyecto/encuesta-satisfaccion',encuestaController.guardarEncuesta);
router.get('/proyecto/encuesta-satisfaccion/todas/:proyectoId', encuestaController.getAllEncuestasProyecto);
router.post('/proyecto/encuesta-satisfaccion/rechazar',encuestaController.rechazarEncuesta);

router.get('/proyecto/:proyectoId/estados', logController.getHistorialEstados);

// Rutas de informes de avance
router.get('/proyecto/:proyectoId/informes-avance', informeAvanceController.getAllInformesByProyecto);
router.get('/proyecto/informe-avance/:id', informeAvanceController.getInformeById);
router.post('/proyecto/informe-avance', informeAvanceController.createInforme);
router.put('/proyecto/informe-avance/:id', informeAvanceController.updateInforme);
router.delete('/proyecto/informe-avance/:id', informeAvanceController.deleteInforme);

// Rutas para Dashboard (Por Usuario y Modo)
router.get('/proyecto/dashboard/gantt/usuario/:usuarioId', GanttController.getGanttByUser);
router.get('/proyecto/dashboard/kanban/usuario/:usuarioId', KabanController.getKanbanByUser);
router.get('/proyecto/dashboard/encuestas/usuario/:usuarioId', encuestaController.getEncuestasDashboard);
router.get('/proyecto/dashboard/informes/usuario/:usuarioId', informeAvanceController.getInformesDashboard);

module.exports = router;