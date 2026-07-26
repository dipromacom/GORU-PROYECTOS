import { v4 as uuidv4 } from "uuid";
import axios from "axios";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

// const url = "http://localhost:9001";
// const url = "https://api.goru.grupogonzalez.ec:9443";
const url = `${process.env.REACT_APP_API_URL}`;

const api = axios.create({
  baseURL: `${url}/api`
});

const apiWithToken = axios.create({
  baseURL: `${url}/api`
});

let store;

export const injectStore = _store => {
  store = _store
}

apiWithToken.interceptors.request.use(config => {
  const jwtToken = store.getState().session.jwtToken;
  if (jwtToken) {
    config.headers.authorization = `Bearer ${jwtToken}`;
    return config;
  }

});

export const createUsuario = payload => api.post(`/usuario`, payload);
export const validateEmail = email => api.get(`/usuario/email/available/${email}`);
export const getToken = payload => api.post(`/usuario/getToken`, payload);
export const updatePassword = (email, payload) => api.put(`/usuario/${email}/password/update`, payload);

export const setMembresia = payload => apiWithToken.post(`/usuario/setMembresia`, payload);

export const getUsuarioById = id => apiWithToken.get(`/usuario/${id}`);
export const updateProfile = (id, payload) => apiWithToken.put(`/usuario/${id}/profile`, payload);
export const getCiudadByPais = pais => apiWithToken.get(`/ciudad/pais/${pais}`);

export const getOpcionesByTipoEvaluacion = (tipoEvaluacionId, usuarioId) => apiWithToken.get(`/tipo-evaluacion/${tipoEvaluacionId}/opciones`, { headers: { usuario: usuarioId } });
export const saveEvaluacion = (usuario, payload) => apiWithToken.post(`/evaluacion/usuario/${usuario}`, payload);

export const sendMail = (payload) => api.post(`/mail/send`, payload);

export const createBatch = (payload) => apiWithToken.post(`/batch`, payload);
export const userHasActiveBatch = (usuarioId) => apiWithToken.get(`/batch/user/${usuarioId}`);

export const closeBatch = (usuarioId) => apiWithToken.put(`/batch/close/user/${usuarioId}`, {});
export const getEvaluacionResult = (tipoEvaluacionId, usuarioId) => apiWithToken.get(`/evaluacion/tipoEvaluacion/${tipoEvaluacionId}`, { headers: { usuario: usuarioId } });
export const getClosedBatches = (usuarioId) => apiWithToken.get(`/batch/closed/user/${usuarioId}`);
export const getEvaluacionResultByBatch = (tipoEvaluacionId, usuarioId, batchId) => apiWithToken.get(`/evaluacion/tipoEvaluacion/${tipoEvaluacionId}/batch/${batchId}`, { headers: { usuario: usuarioId } });

export const startBatchSetup = (tipoEvaluacionId, usuarioId) => apiWithToken.put(`/batch/tipoEvaluacion/${tipoEvaluacionId}/start`, {}, { headers: { usuario: usuarioId } });

export const getCriterioCustom = (id) => apiWithToken.get(`/criterio/custom/${id}`);
export const updateCriterioCustom = (id, payload) => apiWithToken.put(`/criterio/custom/${id}`, payload);
export const disableCriterioCustom = (id, payload) => apiWithToken.put(`/criterio/custom/${id}/deactivate`);

export const addCriterioCustom = (payload) => apiWithToken.post(`/criterio/custom`, payload);
export const addOpcionCustom = (payload) => apiWithToken.post(`/opcion/custom`, payload);

export const getOpcionCustom = (id) => apiWithToken.get(`/opcion/custom/${id}`);
export const updateOpcionCustom = (id, payload) => apiWithToken.put(`/opcion/custom/${id}`, payload);
export const disableOpcionCustom = (id, payload) => apiWithToken.put(`/opcion/custom/${id}/deactivate`);

export const getBatchStatus = (usuarioId) => apiWithToken.get(`/batch/status`, { headers: { usuario: usuarioId } });
export const updateBatchSetup = (usuarioId, tipoEvaluacionId) => apiWithToken.put(`/batch/tipoEvaluacion/${tipoEvaluacionId}/update`, {}, { headers: { usuario: usuarioId } });

export const getBatchDetails = (batchId, usuarioId) => apiWithToken.get(`/batch/${batchId}`, { headers: { usuario: usuarioId } });
export const getBatchByProjectId = (projectId) => apiWithToken.get(`/batch/project/${projectId}`);


//Se agrega endpoint para activar proyecto
export const activarProyecto = (payload) => apiWithToken.post(`/proyecto/activate`, payload)

//Se agrega endpoint para cerrar proyecto
export const cerrarProyecto = (payload) => apiWithToken.post(`/proyecto/cerrar`, payload)

//Se agrega endpoint para cambiar estado planificado o ejecutado
export const cambiarEstadoProyecto = (payload) => apiWithToken.post(`/proyecto/estado`, payload)

//se agrega endpoint para obtener proyecto por ID
export const getProyectoByID = (proyectoId) => apiWithToken.get(`/proyecto/${proyectoId}`)

export const getProyectos = (params) => apiWithToken.get(`/proyecto/${params || null ? `?${(new URLSearchParams(params))?.toString() ?? ''}` : ''}`)
export const createProyecto = (payload) => apiWithToken.post("/proyecto/", payload)
export const updateProyecto = (projectId, payload) => apiWithToken.put(`/proyecto/${projectId}`, payload)

export const createTaskInBatch = (payload) => apiWithToken.post(`/tarea/batch`, payload)
export const insertTask = (payload) => apiWithToken.post('/tarea', payload)
export const doneTask = (idTask, closeDate, observacion) => apiWithToken.put(`/tarea/${idTask}/done`, { closeDate, observacion })

//api interesados
export const createInteresadosBatch = (payload) => apiWithToken.post('/interesados', payload);
export const getInteresadosByProjectId = (proyectoId) => apiWithToken.get(`/interesados/${proyectoId}`)
export const getInteresadoByProjectId = (proyectoId) => apiWithToken.get(`/interesado/${proyectoId}`)

/**
 * Correo desde el proyecto (interesados y/o colaboradores). Remitente = usuario autenticado.
 * payload: { asunto, mensaje, destinatariosModo?, interesadoIds?, colaboradorUsuarioIds? }
 * destinatariosModo: todos | colaboradores_todos | colaborador | interesados_todos | interesado
 */
export const postCorreoInteresadosProyecto = (proyectoId, payload) =>
  apiWithToken.post(`/interesados/proyecto/${proyectoId}/correo`, payload);

export const getCorreoDestinatariosProyecto = (proyectoId) =>
  apiWithToken.get(`/proyecto/${proyectoId}/correo/destinatarios`);

// actualizar interesado
export const updateInteresado = (payload) => apiWithToken.put(`/interesados/${payload.id_interesado}`, payload);


// datos generales del proyecto
export const createDatosGeneralesProyecto = (payload) => apiWithToken.post("/proyecto/generalData", payload)
export const updateDatosGenerales = (projectId, payload) => apiWithToken.put(`/proyecto/${projectId}/generalData`, payload)

export const createAnalisisAmbientalBatch = (payload) => apiWithToken.post('/analisisAmbiental', payload);
export const getAnalisisAmbientalByProjectId = (proyectoId) => apiWithToken.get(`/analisisAmbiental/${proyectoId}`)
export const getAllCriteriosAnalisis = () => apiWithToken.get('/criterioAnalisis/');

export const createResultadoAnalisisAmbientalBatch = (payload) => apiWithToken.post('/resultadoAnalisis', payload);
export const getResultadoAnalisisAmbientalByProjectId = (proyectoId) => apiWithToken.get(`/resultadoAnalisis/${proyectoId}`)
export const updateResultadoAnalisisAmbiental = (projectId, payload) => apiWithToken.put(`/resultadoAnalisis/${projectId}`, payload)
// resultadoAnalisis

export const getTasks = (idProject, page = 1, limit = 10, done) => {
  const url = `/tarea/todo?projectId=${idProject}&page=${page}&limit=${limit}&done=${done}`
  return apiWithToken.get(url)
}
export const syncKanban = ({ status, tasks, projectId }) => apiWithToken.post(`/proyecto/${projectId}/kanban`, { status, tasks })
export const fetchKanban = ({ projectId }) => apiWithToken.get(`/proyecto/${projectId}/kanban`)

export const fetchGantt = ({ projectId }) =>
  apiWithToken.get(`/proyecto/${projectId}/gantt`);

export const syncGantt = ({ tasks, projectId }) => {
  if (!projectId) throw new Error("projectId is required for syncGantt");

  const formattedTasks = Array.isArray(tasks)
    ? tasks.map(t => ({
      ...t,
      start_date: t.start_date || t.start,
      end_date: t.end_date || t.end,
      parent: t.parent || null,           // jerarquía
      group: t.group || null,             // agrupación
      level: t.level || 0,                // nivel jerárquico
      is_critical: t.is_critical || false, // tarea crítica
    }))
    : {
      ...tasks,
      start_date: tasks.start_date || tasks.start,
      end_date: tasks.end_date || tasks.end,
      parent: tasks.parent || null,
      group: tasks.group || null,
      level: tasks.level || 0,
      is_critical: tasks.is_critical || false,
    };

  return apiWithToken.post(`/proyecto/${projectId}/gantt`, {
    tasks: formattedTasks,
  });
};

export const createTask = ({
  id,
  name,
  start_date,
  end_date,
  progress = 0,
  projectId,
  description = "",
  interesados_id = [],
  dependencies = [],
  parent = null,
  group = null,
  level = 0,
  is_critical = false,
  duration,
}) => {
  console.log(start_date + dependencies);
  if (!projectId) return Promise.reject("Missing projectId");

  return apiWithToken.post(`/proyecto/${projectId}/gantt`, {
    task: {
      id,
      project_id: projectId,
      name,
      start_date,
      end_date,
      progress,
      description,
      status: "pending",
      dependencies,
      interesados_id,
      parent,
      group,
      level,
      is_critical,
      duration
    },
  });
};

export const editTask = ({
  id,
  name,
  start_date,
  end_date,
  progress = 0,
  projectId,
  description = "",
  interesados_id = [],
  dependencies = [],
  status = "in-progress",
  parent = null,
  group = null,
  level = 0,
  is_critical = false,
  duration,
}) => {
  if (!projectId || !id)
    return Promise.reject("Missing projectId or task id");

  return apiWithToken.put(`/proyecto/${projectId}/gantt/${id}`, {
    task: {
      id,
      project_id: projectId,
      name,
      start_date,
      end_date,
      progress,
      description,
      status,
      dependencies,
      interesados_id,
      parent,
      group,
      level,
      is_critical,
      duration,
    },
  });
};

export const moveTask = ({ id, newStart, newEnd, projectId }) =>
  editTask({ id, start_date: newStart, end_date: newEnd, projectId });

export const deleteTask = ({ id, projectId }) => {
  if (!projectId || !id) return Promise.reject("Missing projectId or task id");
  return apiWithToken.delete(`/proyecto/${projectId}/gantt/${id}`);
};

export const getTipoProyecto = () => apiWithToken.get(`/tipo-proyecto`);

// Pizarra

export const fetchWhiteboard = ({ projectId }) => {
  if (!projectId) throw new Error("projectId is required");
  return apiWithToken.get(`/proyecto/${projectId}/whiteboard`);
};

export const syncWhiteboard = ({ projectId, content, title }) => {
  if (!projectId) throw new Error("projectId is required");
  return apiWithToken.post(`/proyecto/${projectId}/whiteboard`, {
    title: title || "Pizarra del proyecto",
    content,
  });
};

export const deleteWhiteboard = ({ projectId }) => {
  if (!projectId) throw new Error("projectId is required");
  return apiWithToken.delete(`/proyecto/${projectId}/whiteboard`);
};

// Usuarios por Empresa
export const getUsuariosByEmpresa = empresaId => apiWithToken.get(`/empresa/${empresaId}/usuarios`);

// Administración plataforma (requiere usuario.es_super_admin en BD)
export const getAdminUsuarios = (params) => apiWithToken.get('/admin/usuarios', { params });
export const patchAdminUsuarioTipoLicencia = (usuarioId, tipoLicenciaId) =>
  apiWithToken.patch(`/admin/usuarios/${usuarioId}/tipo-licencia`, { tipoLicenciaId });
export const patchAdminUsuarioEmpresa = (usuarioId, empresaId) =>
  apiWithToken.patch(`/admin/usuarios/${usuarioId}/empresa`, { empresaId });
export const deleteAdminUsuario = (usuarioId) =>
  apiWithToken.delete(`/admin/usuarios/${usuarioId}`);
export const postAdminEmpresa = (payload) => apiWithToken.post('/admin/empresas', payload);
export const putAdminEmpresa = (empresaId, payload) => apiWithToken.put(`/admin/empresas/${empresaId}`, payload);
export const getAdminColaboradoresProyectoConfig = () => apiWithToken.get('/admin/colaboradores-proyecto-config');
export const putAdminColaboradoresProyectoConfig = (payload) =>
  apiWithToken.put('/admin/colaboradores-proyecto-config', payload);

// --- CONFIGURACIÓN TIMEOUT DE SESIÓN ---
export const getAdminSesionTimeoutConfig = () =>
  apiWithToken.get('/admin/sesion-timeout-config');
export const putAdminSesionTimeoutConfig = (payload) =>
  apiWithToken.put('/admin/sesion-timeout-config', payload);
export const getColaboradoresMaxConfig = () => apiWithToken.get('/proyecto/config/colaboradores-max');
export const postInvitacionCorreoExterno = (proyectoId, payload) =>
  apiWithToken.post(`/proyecto/${proyectoId}/invitacion-correo-externo`, payload);
export const getAllTipoLicenciaCatalogo = () => api.get('/tipo-licencia');
export const getAllEmpresasCatalogo = () => api.get('/empresa');


// --- CRUD Roles de Proyecto ---

export const createRolProyecto = payload => apiWithToken.post('/proyecto/roles', payload);
export const getAllRolesProyecto = () => apiWithToken.get('/proyecto/roles');
export const updateRolProyecto = (rolId, payload) => apiWithToken.put(`/proyecto/roles/${rolId}`, payload);
export const deleteRolProyecto = rolId => apiWithToken.delete(`/proyecto/roles/${rolId}`);

// --- CRUD Permisos de Proyecto ---

export const getAllPermisosProyecto = () => apiWithToken.get('/proyecto/permisos');
export const createPermisoProyecto = payload => apiWithToken.post('/proyecto/permisos', payload);
export const updatePermisoProyecto = (permisoId, payload) => apiWithToken.put(`/proyecto/permisos/${permisoId}`, payload);
export const deletePermisoProyecto = permisoId => apiWithToken.delete(`/proyecto/permisos/${permisoId}`);

// --- Asignación ---

export const assignRolProyecto = payload => apiWithToken.post('/proyecto/asignarRol', payload);


// --- GESTIÓN DE USUARIOS DE PROYECTO
export const getUsuariosProyecto = proyectoId => apiWithToken.get(`/proyecto/${proyectoId}/usuarios`);
export const deleteUsuarioProyecto = (usuarioId, proyectoId) => apiWithToken.delete(`/proyecto/${proyectoId}/usuario/${usuarioId}`);
export const getUserProjectRol = (usuarioId, proyectoId) => apiWithToken.get(`/proyecto/${proyectoId}/usuario/${usuarioId}/rol`);

// --- ENCUESTA DE SATISFACCIÓN ---
export const verificarEstadoEncuesta = (proyectoId) => apiWithToken.get(`/proyecto/encuesta-satisfaccion/verificar/${proyectoId}`);
export const getEncuestasProyecto = (proyectoId) => apiWithToken.get(`/proyecto/encuesta-satisfaccion/proyecto/${proyectoId}`);
export const guardarEncuesta = (payload) => apiWithToken.post('/proyecto/encuesta-satisfaccion', payload);
export const rechazarEncuesta = (proyectoId) => apiWithToken.post('/proyecto/encuesta-satisfaccion/rechazar', { proyectoId });
export const getAllEncuestasProyecto = (proyectoId) => apiWithToken.get(`/proyecto/encuesta-satisfaccion/todas/${proyectoId}`);
export const getProjectStatusLogs = (proyectoId) => apiWithToken.get(`/proyecto/${proyectoId}/estados`);

// Informes de Avance
export const getAllInformesAvance = (proyectoId) => apiWithToken.get(`/proyecto/${proyectoId}/informes-avance`);
export const getInformeAvanceById = (id) => apiWithToken.get(`/proyecto/informe-avance/${id}`);
export const createInformeAvance = (data) => apiWithToken.post(`/proyecto/informe-avance`, data);
export const updateInformeAvance = (id, data) => apiWithToken.put(`/proyecto/informe-avance/${id}`, data);
export const deleteInformeAvance = (id) => apiWithToken.delete(`proyecto/informe-avance/${id}`);

// --- ENDPOINTS DASHBOARD ---
export const getTareasDashboard = (usuarioId, modo, done = null) =>
  apiWithToken.get(`/tarea/usuario/${usuarioId}${modo ? `?modo=${modo}` : ''}${done !== null ? `&done=${done}` : ''}`);

export const getEncuestasDashboard = (usuarioId, modo) =>
  apiWithToken.get(`/proyecto/dashboard/encuestas/usuario/${usuarioId}${modo ? `?modo=${modo}` : ''}`);

export const getInformesDashboard = (usuarioId, modo) =>
  apiWithToken.get(`/proyecto/dashboard/informes/usuario/${usuarioId}${modo ? `?modo=${modo}` : ''}`);

export const getGanttDashboard = (usuarioId, modo) =>
  apiWithToken.get(`/proyecto/dashboard/gantt/usuario/${usuarioId}${modo ? `?modo=${modo}` : ''}`);

export const getKanbanDashboard = (usuarioId, modo) =>
  apiWithToken.get(`/proyecto/dashboard/kanban/usuario/${usuarioId}${modo ? `?modo=${modo}` : ''}`);

// --- SCRUM ---
export const getScrumOverview = (projectId, params = {}) =>
  apiWithToken.get(`/proyecto/${projectId}/scrum`, { params });

export const createScrumEpic = (projectId, payload) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/epics`, payload);

export const updateScrumEpic = (projectId, epicId, payload) =>
  apiWithToken.put(`/proyecto/${projectId}/scrum/epics/${epicId}`, payload);

export const deleteScrumEpic = (projectId, epicId) =>
  apiWithToken.delete(`/proyecto/${projectId}/scrum/epics/${epicId}`);

export const createScrumStory = (projectId, payload) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/stories`, payload);

export const updateScrumStory = (projectId, storyId, payload) =>
  apiWithToken.put(`/proyecto/${projectId}/scrum/stories/${storyId}`, payload);

export const deleteScrumStory = (projectId, storyId) =>
  apiWithToken.delete(`/proyecto/${projectId}/scrum/stories/${storyId}`);

export const duplicateScrumStory = (projectId, storyId) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/stories/${storyId}/duplicate`);

export const archiveScrumStory = (projectId, storyId) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/stories/${storyId}/archive`);

export const unarchiveScrumStory = (projectId, storyId) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/stories/${storyId}/unarchive`);

export const reorderScrumStories = (projectId, orderedIds) =>
  apiWithToken.put(`/proyecto/${projectId}/scrum/stories/reorder`, { orderedIds });

export const recalculateScrumPriorities = (projectId, metodo) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/priorities/recalculate`, { metodo });

export const updateScrumConfig = (projectId, payload) =>
  apiWithToken.put(`/proyecto/${projectId}/scrum/config`, payload);

export const createScrumSprint = (projectId, payload) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/sprints`, payload);

export const updateScrumSprint = (projectId, sprintId, payload) =>
  apiWithToken.put(`/proyecto/${projectId}/scrum/sprints/${sprintId}`, payload);

export const deleteScrumSprint = (projectId, sprintId) =>
  apiWithToken.delete(`/proyecto/${projectId}/scrum/sprints/${sprintId}`);

export const getSprintPlanning = (projectId, sprintId) =>
  apiWithToken.get(`/proyecto/${projectId}/scrum/sprints/${sprintId}/planning`);

export const saveSprintPlanning = (projectId, sprintId, storyIds) =>
  apiWithToken.put(`/proyecto/${projectId}/scrum/sprints/${sprintId}/planning`, { storyIds });

export const assignStoryToSprint = (projectId, sprintId, storyId) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/sprints/${sprintId}/stories/${storyId}`);

export const removeStoryFromSprint = (projectId, sprintId, storyId) =>
  apiWithToken.delete(`/proyecto/${projectId}/scrum/sprints/${sprintId}/stories/${storyId}`);

export const clearSprintStories = (projectId, sprintId) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/sprints/${sprintId}/clear`);

export const activateScrumSprint = (projectId, sprintId) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/sprints/${sprintId}/activate`);

export const closeScrumSprint = (projectId, sprintId, payload = {}) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/sprints/${sprintId}/close`, payload);

export const getScrumMetrics = (projectId) =>
  apiWithToken.get(`/proyecto/${projectId}/scrum/metrics`);

export const getScrumDocuments = (projectId, params = {}) =>
  apiWithToken.get(`/proyecto/${projectId}/scrum/documents`, { params });

export const getScrumDocument = (projectId, docId) =>
  apiWithToken.get(`/proyecto/${projectId}/scrum/documents/${docId}`);

export const createScrumDocument = (projectId, payload) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/documents`, payload);

export const updateScrumDocument = (projectId, docId, payload) =>
  apiWithToken.put(`/proyecto/${projectId}/scrum/documents/${docId}`, payload);

export const deleteScrumDocument = (projectId, docId) =>
  apiWithToken.delete(`/proyecto/${projectId}/scrum/documents/${docId}`);

export const addScrumDocumentAttachment = (projectId, docId, payload) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/documents/${docId}/attachments`, payload);

export const downloadScrumDocumentAttachment = (projectId, docId, fileId) =>
  apiWithToken.get(`/proyecto/${projectId}/scrum/documents/${docId}/attachments/${fileId}`, { responseType: 'blob' });

export const removeScrumDocumentAttachment = (projectId, docId, fileId) =>
  apiWithToken.delete(`/proyecto/${projectId}/scrum/documents/${docId}/attachments/${fileId}`);

export const addScrumDocumentComment = (projectId, docId, texto) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/documents/${docId}/comments`, { texto });

export const deleteScrumDocumentComment = (projectId, docId, commentId) =>
  apiWithToken.delete(`/proyecto/${projectId}/scrum/documents/${docId}/comments/${commentId}`);

export const restoreScrumDocumentVersion = (projectId, docId, version) =>
  apiWithToken.post(`/proyecto/${projectId}/scrum/documents/${docId}/restore-version`, { version });

// --- CONTROL DE CAMBIOS ---
export const getSolicitudesProyecto = (proyectoId) => apiWithToken.get(`/proyecto/${proyectoId}/control-cambio`);
export const createSolicitudCambio = (payload) => apiWithToken.post('/proyecto/control-cambio', payload);
export const updateEstadoSolicitudCambio = (id, payload) => apiWithToken.put(`/proyecto/control-cambio/${id}/estado`, payload);
export const getSolicitudesDashboard = (usuarioId, modo) => apiWithToken.get(`/proyecto/dashboard/control-cambio/usuario/${usuarioId}?modo=${modo}`);

// --- MADUREZ DIRECCIÓN DE PROYECTOS ---
export const getMadurezDireccionEstado = (usuarioId) =>
  apiWithToken.get(`/madurez-direccion-proyectos/usuario/${usuarioId}`);
export const guardarMadurezDireccion = (usuarioId, payload) =>
  apiWithToken.post(`/madurez-direccion-proyectos/usuario/${usuarioId}`, payload);
export const getAdminMadurezDireccionList = (params = {}) =>
  apiWithToken.get('/admin/madurez-direccion-proyectos', { params });

// --- CHAT ---
export const getChatUsuariosDisponibles = (q) =>
  apiWithToken.get('/chat/usuarios', { params: q ? { q } : undefined });
export const getChatConversaciones = () => apiWithToken.get('/chat/conversaciones');
export const postChatAbrirConversacion = (otroUsuarioId) =>
  apiWithToken.post('/chat/conversaciones', { otroUsuarioId });
export const getChatMensajes = (conversacionId, params) =>
  apiWithToken.get(`/chat/conversaciones/${conversacionId}/mensajes`, { params });
export const postChatEnviarMensaje = (conversacionId, texto) =>
  apiWithToken.post(`/chat/conversaciones/${conversacionId}/mensajes`, { texto });
export const postChatMarcarLeido = (conversacionId, hastaId) =>
  apiWithToken.post(`/chat/conversaciones/${conversacionId}/leido`, { hastaId });
export const getChatNoLeidos = () => apiWithToken.get('/chat/no-leidos');


//--- PROGRAMA ---
export const getProyectosDelPrograma = (programaId) => apiWithToken.get(`/proyecto/${programaId}/programa/proyectos`);
export const getProyectosDisponiblesParaPrograma = (programaId) => apiWithToken.get(`/proyecto/${programaId}/programa/disponibles`);
export const getResumenAgregadoPrograma = (programaId) => apiWithToken.get(`/proyecto/${programaId}/programa/resumen-agregado`);
export const asignarProyectoAPrograma = (programaId, proyectoId) => apiWithToken.post(`/proyecto/${programaId}/programa/asignar`, { proyectoId });
export const desasignarProyectoDePrograma = (proyectoId) => apiWithToken.delete(`/proyecto/${proyectoId}/programa`);
export const getProgramasLista = () => apiWithToken.get('/proyecto/programas/lista');