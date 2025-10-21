/* eslint-disable no-unused-vars */
import { call, put, takeLatest, select } from "redux-saga/effects";
import { types } from "../reducers/project";
import { push } from "connected-react-router"
import { onError } from "../libs/errorLib";
import * as Api from "../api"
import moment from "moment";

const sagas = [
    takeLatest(types.START_PROJECT_REQUEST, handleStartProject),
    takeLatest(types.CLOSE_PROJECT_REQUEST, handleCloseProject),
    takeLatest(types.STATUS_PROJECT_REQUEST, handleStatusProject),
    takeLatest(types.GET_PROJECTS_FILTERED_REQUEST, handleFilteredProjects),
    takeLatest(types.CREATE_PROJECT_REQUEST, handleCreateProject),
    takeLatest(types.CREATE_PROJECT_GENERAL_DATA_REQUEST, handleCreateGeneralDataProject),
    takeLatest(types.GET_PROJECT_DETAIL_REQUEST, handleGetProjectDetail),
    takeLatest(types.UPDATE_PROJECT_REQUEST, handleUpdateProject),
    takeLatest(types.UPDATE_PROJECT_GENERAL_DATA_REQUEST, handleUpdateProjectGeneralData),
    takeLatest(types.INSERT_TODO_TASK_REQUEST, handleInsertTask),
    takeLatest(types.DONE_TASK_REQUEST, handleDoneTask),
    takeLatest(types.GET_PROJECT_INTERESADOS_REQUEST, handleGetProjectInteresados),
    takeLatest(types.CREATE_INTERESADO_REQUEST, handleInsertInteresado), // Nueva saga para crear interesado
    takeLatest(types.UPDATE_INTERESADO_REQUEST, handleUpdateInteresado),
    takeLatest(types.GET_LIST_INTERESADOS_REQUEST, handleGetListInteresados), 
    takeLatest(types.GET_ANALISIS_AMBIENTAL_REQUEST, handleGetAnalisisAmbiental),
    takeLatest(types.GET_CRITERIOS_ANALISIS_AMBIENTAL_REQUEST, handleGetCriteriosAnalisisAmbiental),
    takeLatest(types.CREATE_ANALISIS_AMBIENTAL_REQUEST, handleCreateAnalisisAmbiental),
    takeLatest(types.CREATE_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST, handleCreateRespuestaAnalisisAmbiental),
    takeLatest(types.GET_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST, handleGetRespuestaAnalisisAmbiental),
    takeLatest(types.UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST, handleUpdateRespuestaAnalisisAmbiental),
    takeLatest(types.GET_TASKS_BY_ID_REQUEST, handleGetTasks)
]


function* handleGetProjectDetail({ projectId }) {
    try {
        const response = yield call(Api.getProyectoByID, projectId)
        const { success, data } = response.data
        if (success) {
            yield put({ type: types.GET_PROJECT_DETAIL_SUCCESS, selectedProjectDetail: data });
        }
    } catch (e) {
        yield put({ type: types.GET_PROJECT_DETAIL_ERROR })
        onError(e)
    }
}

function* handleStartProject({ projectId, modo, filter = false, startFromBatch = false }) {
    try {
        const payload = { projectId }
        const response = yield call(Api.activarProyecto, payload)
        const { success } = response.data;
        if (success) {
            yield put({ type: types.START_PROJECT_SUCCESS, success });

            if (startFromBatch) {
                yield call(handleFilteredProjects, { filter: { id: null, modo: modo } })
                yield put(push(`/projects`));
                return;
            }

            if (filter) {
                yield put(push(`/projects?id=${projectId}`));
            }
            else {
                yield call(handleFilteredProjects, { filter: { id: null, modo: modo } })
                //yield put(push(`/projects/${projectId}`));
            }

        }
    } catch (e) {
        onError(e);
        yield put({ type: types.START_PROJECT_ERROR })
    }
}

function* handleCloseProject({ projectId, modo, fecha_cierre, filter = false }) {
    try {
        const payload = { projectId, fecha_cierre }
        const response = yield call(Api.cerrarProyecto, payload)
        const { success } = response.data;

        if (success) {
            yield put({ type: types.CLOSE_PROJECT_SUCCESS, success });

            if (filter) {
                yield put(push(`/projects?id=${projectId}`));
            } else {
                yield call(handleFilteredProjects, { filter: { id: null, modo: modo } })
            }
        }
    } catch (e) {
        onError(e);
        yield put({ type: types.CLOSE_PROJECT_ERROR })
    }
}

function* handleStatusProject({ projectId, modo, estado, filter = false }) {
    try {
        const payload = { projectId, estado }
        const response = yield call(Api.cambiarEstadoProyecto, payload)
        const { success } = response.data;

        if (success) {
            yield put({ type: types.STATUS_PROJECT_SUCCESS, success });

            if (filter) {
                yield put(push(`/projects?id=${projectId}`));
            } else {
                yield call(handleFilteredProjects, { filter: { id: null, modo: modo } })
            }
        }
    } catch (e) {
        onError(e);
        yield put({ type: types.STATUS_PROJECT_ERROR })
    }
}

function* handleFilteredProjects({ filter }) {
    try {
        const { id, modo } = filter
        const response = id != null ? yield call(Api.getProyectoByID, id, modo) : yield call(Api.getProyectos, filter)
        const { success, data } = response.data
        if (success) {
            const responseData = id != null ? [data] : data
            yield put({ type: types.GET_PROJECTS_FILTERED_SUCCESS, projectList: responseData });
        }
    } catch (e) {
        yield put({ type: types.GET_PROJECTS_FILTERED_ERROR })
        onError(e)
    }
}


function* handleCreateProject({ payload }) {
    try {
        const { todoList } = payload
        const payloadReq = createRequestProjectCreation(payload)
        const response = yield call(Api.createProyecto, payloadReq)
        const { success, data } = response.data
        if (success) {
            yield put({ type: types.CREATE_PROJECT_SUCCESS, success })
            const todos = todoList.map(item => ({ ...item, proyectoId: data.id, dueDate: moment(item.dueDate, 'DD/MM/YYYY').format() }))
            if (todos && todos.length > 0) {
                yield call(Api.createTaskInBatch, { tasks: todos })
            }
            yield put(push(`/projects/${data.id}`));
            // yield put(push(`/projects?id=${data.id}`));
        }
    } catch (e) {
        yield put({ type: types.CREATE_PROJECT_ERROR })
        onError(e)
    }
}

function* handleCreateGeneralDataProject({ payload }) {
    try {
        const response = yield call(Api.createDatosGeneralesProyecto, payload)
        const { success, data } = response.data
        if (success) {
            yield put({ type: types.CREATE_PROJECT_GENERAL_DATA_SUCCESS, success })
            if(payload.modo == "P") yield put(push(`/projects`));
            else yield put(push(`/activities`));
        }
    } catch (e) {
        yield put({ type: types.CREATE_PROJECT_GENERAL_DATA_ERROR })
        onError(e)
    }
}

function* handleUpdateProject({ payload, projectId }) {
    try {
        const payloadReq = createRequestProjectCreation(payload)
        const response = yield call(Api.updateProyecto, projectId, payloadReq)
        const { success, data } = response.data
        if (success) {
            yield put({ type: types.UPDATE_PROJECT_SUCCESS, selectedProjectDetail: data })
        }
    } catch (e) {
        yield put({ type: types.UPDATE_PROJECT_ERROR })
        onError(e)
    }
}

function* handleUpdateProjectGeneralData({ payload, projectId }) {
    try {
        const response = yield call(Api.updateDatosGenerales, projectId, payload)
        const { success, data } = response.data
        if (success) {
            yield put({ type: types.UPDATE_PROJECT_GENERAL_DATA_SUCCESS, selectedProjectDetail: data })
        }
    } catch (e) {
        yield put({ type: types.UPDATE_PROJECT_GENERAL_DATA_ERROR })
        onError(e)
    }
}

function* handleInsertTask({ payload }) {
    try {
        const response = yield call(Api.insertTask, { task: payload })
        const { success, data } = response.data
        const { tareas } = data
        if (success) {
            yield put({ type: types.INSERT_TODO_TASK_SUCCESS, todo: tareas })
        }
    } catch (e) {
        yield put({ type: types.INSERT_TODO_TASK_ERROR })
    }
}

function* handleDoneTask({ idTask, closeDate }) {
    try {
        const response = yield call(Api.doneTask, idTask, closeDate);
        const { success, data } = response.data;
        const { tareas } = data;
        if (success) {
            yield put({ type: types.DONE_TASK_SUCCESS, todo: tareas });
        }
    }
    catch (e) {
        yield put({ type: types.DONE_TASK_ERROR });
    }
}

function* handleInsertInteresado({ payload }) {
    try {
        const response = yield call(Api.createInteresadosBatch, payload);
        const { success, data } = response.data;
        if (success) {
            const currentInteresados = yield select(state => state.interesados);
            const updatedInteresados = [...(currentInteresados || []), ...data];
            yield put({ type: types.CREATE_INTERESADO_SUCCESS, interesados: updatedInteresados });
            yield put({ type: types.GET_LIST_INTERESADOS_SUCCESS, interesados: updatedInteresados });
        } else {
            yield put({ type: types.CREATE_INTERESADO_ERROR });
        }
    } catch (e) {
        yield put({ type: types.CREATE_INTERESADO_ERROR });
        onError(e);
    }
}

function* handleUpdateInteresado({ payload }) {
    try {
        // 🔹 Llamada al API para actualizar
        const response = yield call(Api.updateInteresado, payload);
        const { success, data } = response.data;

        if (success) {
            // 🔹 Obtener la lista actual desde el store
            const currentInteresados = yield select(state => state.interesados);

            // 🔹 Reemplazar el interesado actualizado dentro de la lista
            const updatedInteresados = (currentInteresados || []).map(item =>
                item.id === data.id ? data : item
            );

            // 🔹 Actualizar en el store
            yield put({ type: types.UPDATE_INTERESADO_SUCCESS, interesados: updatedInteresados });
            yield put({ type: types.GET_LIST_INTERESADOS_SUCCESS, interesados: updatedInteresados });
        } else {
            yield put({ type: types.UPDATE_INTERESADO_ERROR });
        }
    } catch (e) {
        yield put({ type: types.UPDATE_INTERESADO_ERROR });
        onError(e);
    }
}

function* handleGetProjectInteresados({ projectId }) {
    try {
        const response = yield call(Api.getInteresadosByProjectId, projectId);
        const { success, data } = response.data;
        if (success) {
            yield put({ type: types.GET_PROJECT_INTERESADOS_SUCCESS, interesados: data });
        }
    } catch (e) {
        yield put({ type: types.GET_PROJECT_INTERESADOS_ERROR });
        onError(e);
    }
}

function* handleGetListInteresados({ projectId }) {
    try {
        const response = yield call(Api.getInteresadoByProjectId, projectId);
        const { success, data } = response.data;
        if (success) {
            yield put({ type: types.GET_LIST_INTERESADOS_SUCCESS, interesado: data });
        }
    } catch (e) {
        yield put({ type: types.GET_LIST_INTERESADOS_ERROR });
        onError(e);
    }
}

function* handleGetAnalisisAmbiental({ projectId }) {
    try {
        if (!projectId) {
            yield put({ type: types.GET_ANALISIS_AMBIENTAL_ERROR });
            return; // Detener la ejecución si el projectId no es válido
        }
        const response = yield call(Api.getAnalisisAmbientalByProjectId, projectId);
        const { success, data } = response.data;
        console.log(data);
        if (success) {
            yield put({ type: types.GET_ANALISIS_AMBIENTAL_SUCCESS, analysisData: data });
        } else {
            yield put({ type: types.GET_ANALISIS_AMBIENTAL_ERROR });
        }
    } catch (e) {
        console.error(e);
        yield put({ type: types.GET_ANALISIS_AMBIENTAL_ERROR });
        onError(e);
    }
}


function* handleGetCriteriosAnalisisAmbiental() {
    try {
        const response = yield call(Api.getAllCriteriosAnalisis);
        const { success, data, message } = response.data;

        if (success) {
            yield put({ type: types.GET_CRITERIOS_ANALISIS_AMBIENTAL_SUCCESS, criteriosAnalisisAmbiental: data });
        } else {
            yield put({ type: types.GET_CRITERIOS_ANALISIS_AMBIENTAL_ERROR });
        }
    } catch (e) {
        yield put({ type: types.GET_CRITERIOS_ANALISIS_AMBIENTAL_ERROR });
        onError(e);
    }
}



// Crear un nuevo registro de Análisis Ambiental
function* handleCreateAnalisisAmbiental({ payload }) {
    try {
        const response = yield call(Api.createAnalisisAmbientalBatch, { payload });
        const { success, data } = response.data;
        if (success) {
            const { analisis } = data;
            yield put({ type: types.CREATE_ANALISIS_AMBIENTAL_SUCCESS, analisisAmbiental: analisis });
        }
    } catch (e) {
        // En caso de error, se despacha la acción de error
        yield put({ type: types.CREATE_ANALISIS_AMBIENTAL_ERROR });
    }
}

function* handleCreateRespuestaAnalisisAmbiental({ payload }) {
    try {
        const response = yield call(Api.createResultadoAnalisisAmbientalBatch, { payload });
        const { success, data } = response.data;
        if (success) {
            const { analisis } = data;
            yield put({ type: types.CREATE_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS, respuestaAnalisisAmbiental: analisis });
        }
    } catch (e) {
        // En caso de error, se despacha la acción de error
        yield put({ type: types.CREATE_RESPUESTA_ANALISIS_AMBIENTAL_ERROR });
    }
}

function* handleGetRespuestaAnalisisAmbiental({ projectId }) {
    try {
        // console.log(projectId)
        const response = yield call(Api.getResultadoAnalisisAmbientalByProjectId, projectId);
        const { success, data } = response.data;
        if (success) {
            yield put({ type: types.GET_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS, respuestaAnalisisAmbiental: data });
        } else {
            yield put({ type: types.GET_RESPUESTA_ANALISIS_AMBIENTAL_ERROR });
        }
    } catch (e) {
        yield put({ type: types.GET_RESPUESTA_ANALISIS_AMBIENTAL_ERROR });
        onError(e);
    }
}

function* handleUpdateRespuestaAnalisisAmbiental({ projectId, payload }) {
    try {
        const response = yield call(Api.updateResultadoAnalisisAmbiental, projectId, payload);
        const { success, data } = response.data;
        if (success) {
            // Actualiza los datos en Redux
            yield put({ type: types.UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS, selectedProjectDetail: data });

            // Opcional: Realiza una llamada para obtener los datos actualizados del backend
            yield put({ type: types.GET_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST, projectId });
        }
    } catch (e) {
        yield put({ type: types.UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_ERROR });
        onError(e);
    }
}


function* handleGetTasks({ idProject, page, limit, done }) {
    try {
        const response = yield call(Api.getTasks, idProject, page, limit, done)
        const { success, data } = response.data
        const { tareas } = data
        if (success) {
            yield put({ type: types.GET_TASKS_BY_ID_SUCCESS, todo: tareas })
        }
    }
    catch (e) {
        yield put({ type: types.GET_TASKS_BY_ID_ERROR })
    }
}

const createRequestProjectCreation = ({
    nombreProyecto,
    directorProyecto,
    patrocinadorProyecto,
    departamento,
    informacionBreve,
    pendienteAsignacion,
    documentacionAdjunta,
    contrato,
    casoNegocio,
    enunciadoTrabajo,
    portafolio,
    programa,
    justificacion,
    descripcion,
    analisisViabilidad,
    objetivoCosto,
    objetivoPlazo,
    objetivoDesempeno,
    objetivoDescripcion,
    alcanceEntregables,
    tiempoDuracion,
    tiempoFechasCriticas,
    costoEntregable,
    costoReservaContingencia,
    costoReservaGestion,
    calidadMetricas,
    riesgos,
    recursosRequeridos,
    supuestos,
    restricciones,
    maxDesvioPresupuesto,
    maxDesvioTiempo,
    autorizadoFirmasExternas,
    tareasFunciones,
    tiposInformes,
    incentivo,
    autoridadControlCambios,
    plazoPeriodo,
    maxDesviacionPeriodo
}) => {
    return {
        nombre: nombreProyecto,
        //directorProyecto,
        //: patrocinadorProyecto,
        //departamento: departamento,
        informacion: informacionBreve,
        pendiente_asignacion: pendienteAsignacion,
        documentacion_adjunta: documentacionAdjunta,
        contrato: contrato,
        caso_negocio: casoNegocio,
        enunciado: enunciadoTrabajo,
        portafolio: portafolio,
        programa: programa,
        justificacion: justificacion,
        descripcion: descripcion,
        analisis_viabilidad: analisisViabilidad,
        objetivo_costo: objetivoCosto,
        objetivo_plazo: objetivoPlazo,
        objetivo_desempeno: objetivoDesempeno,
        objetivo_desc: objetivoDescripcion,
        alcance_entregables: alcanceEntregables,
        tiempo_duracion: tiempoDuracion,
        tiempo_fechas_criticas: tiempoFechasCriticas,
        costo_entregable: costoEntregable,
        costo_reserva_contingencia: costoReservaContingencia,
        costo_reserva_gestion: costoReservaGestion,
        calidad_metricas: calidadMetricas,
        riesgos: riesgos,
        recursos_requeridos: recursosRequeridos,
        supuestos: supuestos,
        restricciones: restricciones,
        max_desvio_presupuesto: maxDesvioPresupuesto,
        max_desvio_tiempo: maxDesvioTiempo,
        dir_autorizado_firmas: autorizadoFirmasExternas,
        dir_tareas_funciones: tareasFunciones,
        tipos_informes: tiposInformes,
        incentivo: incentivo,
        autidad_control_cambios: autoridadControlCambios,
        plazo_periodo: plazoPeriodo,
        max_desviacion_periodo: maxDesviacionPeriodo
    }
}

export default sagas;