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

export const getBatchDetails= (batchId, usuarioId) => apiWithToken.get(`/batch/${batchId}`, { headers: { usuario: usuarioId }});
export const getBatchByProjectId= (projectId) => apiWithToken.get(`/batch/project/${projectId}`);


//Se agrega endpoint para activar proyecto
export const activarProyecto = (payload) => apiWithToken.post(`/proyecto/activate`, payload)

//Se agrega endpoint para cerrar proyecto
export const cerrarProyecto = (payload) => apiWithToken.post(`/proyecto/cerrar`, payload)

//se agrega endpoint para obtener proyecto por ID
export const getProyectoByID = (proyectoId) => apiWithToken.get(`/proyecto/${proyectoId}`)

export const getProyectos = (params) => apiWithToken.get(`/proyecto/${ params || null ? `?${ (new URLSearchParams(params))?.toString()?? '' }`: '' }`)
export const createProyecto = (payload) => apiWithToken.post("/proyecto/",payload)
export const updateProyecto = (projectId, payload) => apiWithToken.put(`/proyecto/${projectId}`, payload)

export const createTaskInBatch = (payload) => apiWithToken.post(`/tarea/batch`, payload)
export const insertTask = (payload) => apiWithToken.post('/tarea', payload)
export const doneTask = (idTask, closeDate) => apiWithToken.put(`/tarea/${idTask}/done`, { closeDate })

//api interesados
export const createInteresadosBatch = (payload) => apiWithToken.post('/interesados', payload);
export const getInteresadosByProjectId = (proyectoId) => apiWithToken.get(`/interesados/${proyectoId}`)
export const getInteresadoByProjectId = (proyectoId) => apiWithToken.get(`/interesado/${proyectoId}`)

// actualizar interesado
export const updateInteresado = (payload) => apiWithToken.put(`/interesados/${payload.id_interesado}`, payload);

// datos generales del proyecto
export const createDatosGeneralesProyecto = (payload) => apiWithToken.post("/proyecto/generalData",payload)
export const updateDatosGenerales = (projectId,payload) => apiWithToken.put(`/proyecto/${projectId}/generalData`,payload)

export const createAnalisisAmbientalBatch = (payload) => apiWithToken.post('/analisisAmbiental', payload);
export const getAnalisisAmbientalByProjectId = (proyectoId) => apiWithToken.get(`/analisisAmbiental/${proyectoId}`)
export const getAllCriteriosAnalisis = () =>  apiWithToken.get('/criterioAnalisis/');

export const createResultadoAnalisisAmbientalBatch = (payload) => apiWithToken.post('/resultadoAnalisis', payload);
export const getResultadoAnalisisAmbientalByProjectId = (proyectoId) => apiWithToken.get(`/resultadoAnalisis/${proyectoId}`)
export const updateResultadoAnalisisAmbiental = (projectId, payload) => apiWithToken.put(`/resultadoAnalisis/${projectId}`, payload)
// resultadoAnalisis

export const getTasks = (idProject, page = 1, limit = 10, done) => {
  const url = `/tarea/todo?projectId=${idProject}&page=${page}&limit=${limit}&done=${done}`
  return apiWithToken.get(url)
}
export const syncKanban = ({status, tasks, projectId}) => apiWithToken.post(`/proyecto/${projectId}/kanban`,{status, tasks})
export const fetchKanban = ({projectId}) => apiWithToken.get(`/proyecto/${projectId}/kanban`)

//gantt
// 🟢 Obtener tareas del proyecto
export const fetchGantt = ({ projectId }) =>
  apiWithToken.get(`/proyecto/${projectId}/gantt`);

// 🟢 Sincronizar tareas con backend
export const syncGantt = ({ tasks, projectId }) => {
  if (!projectId) throw new Error("projectId is required for syncGantt");

  // Compatibilidad: convierte start → start_date y end → end_date si existen
  const formattedTasks = Array.isArray(tasks)
    ? tasks.map(t => ({
      ...t,
      start_date: t.start_date || t.start,
      end_date: t.end_date || t.end,
    }))
    : {
      ...tasks,
      start_date: tasks.start_date || tasks.start,
      end_date: tasks.end_date || tasks.end,
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
  dependencies = []
}) => {
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
    },
  });
};


// Editar tarea
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
    },
  });
};


// Mover tarea (fechas)
export const moveTask = ({ id, newStart, newEnd, projectId }) => {
  return editTask({ id, start_date: newStart, end_date: newEnd, projectId });
};

// Eliminar tarea
export const deleteTask = ({ id, projectId }) => {
  if (!projectId || !id) return Promise.reject("Missing projectId or task id");
  return apiWithToken.delete(`/proyecto/${projectId}/gantt/${id}`);
};

export const getTipoProyecto = () => apiWithToken.get(`/tipo-proyecto`)
