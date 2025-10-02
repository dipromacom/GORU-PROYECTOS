import moment from "moment"
import { getInteresadosByProjectId } from "../api"

export const types = {
    START_PROJECT_REQUEST: "project/START_PROJECT_REQUEST",
    START_PROJECT_SUCCESS: "project/START_PROJECT_SUCCESS",
    START_PROJECT_ERROR: "project/START_PROJECT_ERROR",
    CLOSE_PROJECT_REQUEST: "project/CLOSE_PROJECT_REQUEST",
    CLOSE_PROJECT_SUCCESS: "project/CLOSE_PROJECT_SUCCESS",
    CLOSE_PROJECT_ERROR: "project/CLOSE_PROJECT_ERROR",
    CREATE_PROJECT_REQUEST: "project/CREATE_PROJECT_REQUEST",
    CREATE_PROJECT_SUCCESS: "project/CREATE_PROJECT_SUCCESS",
    CREATE_PROJECT_ERROR: "project/CREATE_PROJECT_ERROR",
    GET_PROJECTS_FILTERED_REQUEST: "project/GET_PROJECTS_FILTERED_REQUEST",
    GET_PROJECTS_FILTERED_SUCCESS: "project/GET_PROJECTS_FILTERED_SUCCESS",
    GET_PROJECTS_FILTERED_ERROR: "project/GET_PROJECTS_FILTERED_ERROR",
    GET_PROJECT_DETAIL_REQUEST: "project/GET_PROJECT_DETAIL_REQUEST",
    GET_PROJECT_DETAIL_SUCCESS: "project/GET_PROJECT_DETAIL_SUCCESS",
    GET_PROJECT_DETAIL_ERROR: "project/GET_PROJECT_DETAIL_ERROR",
    UPDATE_PROJECT_REQUEST: "project/UPDATE_PROJECT_REQUEST",
    UPDATE_PROJECT_SUCCESS: "project/UPDATE_PROJECT_SUCCESS",
    UPDATE_PROJECT_ERROR: "project/UPDATE_PROJECT_ERROR",
    INSERT_TODO_TASK_REQUEST: "project/INSERT_TODO_TASK_REQUEST",
    INSERT_TODO_TASK_SUCCESS: "project/INSERT_TODO_TASK_SUCCESS",
    INSERT_TODO_TASK_ERROR: "project/INSERT_TODO_TASK_ERROR",
    DONE_TASK_REQUEST: "project/DONE_TASK_REQUEST",
    DONE_TASK_SUCCESS: "project/DONE_TASK_SUCCESS",
    DONE_TASK_ERROR: "project/DONE_TASK_ERROR",
    // interesados
    CREATE_INTERESADO_REQUEST: "project/CREATE_INTERESADO_REQUEST",
    CREATE_INTERESADO_SUCCESS: "project/CREATE_INTERESADO_SUCCESS",
    CREATE_INTERESADO_ERROR: "project/CREATE_INTERESADO_ERROR",
    UPDATE_INTERESADO_REQUEST: "project/UPDATE_INTERESADO_REQUEST",
    UPDATE_INTERESADO_SUCCESS: "project/UPDATE_INTERESADO_SUCCESS",
    UPDATE_INTERESADO_ERROR: "project/UPDATE_INTERESADO_ERROR",

    GET_PROJECT_INTERESADOS_REQUEST: "project/GET_INTERESADOS_REQUEST",
    GET_PROJECT_INTERESADOS_SUCCESS: "project/GET_INTERESADOS_SUCCESS",
    GET_PROJECT_INTERESADOS_ERROR: "project/GET_INTERESADOS_ERROR",
    GET_LIST_INTERESADOS_REQUEST: "project/GET_LIST_INTERESADOS_REQUEST",
    GET_LIST_INTERESADOS_SUCCESS: "project/GET_LIST_INTERESADOS_SUCCESS",
    GET_LIST_INTERESADOS_ERROR: "project/GET_LIST_INTERESADOS_ERROR",
    GET_TASKS_BY_ID_REQUEST: "project/GET_TASKS_BY_ID_REQUEST",
    GET_TASKS_BY_ID_SUCCESS: "project/GET_TASKS_BY_ID_SUCCESS",
    GET_TASKS_BY_ID_ERROR: "project/GET_TASKS_BY_ID_SUCCESS",

    // Create Datos Generales
    CREATE_PROJECT_GENERAL_DATA_REQUEST: "project/CREATE_PROJECT_GENERAL_DATA_REQUEST",
    CREATE_PROJECT_GENERAL_DATA_SUCCESS: "project/CREATE_PROJECT_GENERAL_DATA_SUCCESS",
    CREATE_PROJECT_GENERAL_DATA_ERROR: "project/CREATE_PROJECT_GENERAL_DATA_ERROR",

    // Update Datos Generales
    UPDATE_PROJECT_GENERAL_DATA_REQUEST: "project/UPDATE_PROJECT_GENERAL_DATA_REQUEST",
    UPDATE_PROJECT_GENERAL_DATA_SUCCESS: "project/UPDATE_PROJECT_GENERAL_DATA_SUCCESS",
    UPDATE_PROJECT_GENERAL_DATA_ERROR: "project/UPDATE_PROJECT_GENERAL_DATA_ERROR",

    //analisis ambiental
    CREATE_ANALISIS_AMBIENTAL_REQUEST: "project/CREATE_ANALISIS_AMBIENTAL_REQUEST",
    CREATE_ANALISIS_AMBIENTAL_SUCCESS: "project/CREATE_ANALISIS_AMBIENTAL_SUCCESS",
    CREATE_ANALISIS_AMBIENTAL_ERROR: "project/CREATE_ANALISIS_AMBIENTAL_ERROR",
    GET_ANALISIS_AMBIENTAL_REQUEST: "project/GET_ANALISIS_AMBIENTAL_REQUEST",
    GET_ANALISIS_AMBIENTAL_SUCCESS: "project/GET_ANALISIS_AMBIENTAL_SUCCESS",
    GET_ANALISIS_AMBIENTAL_ERROR: "project/GET_ANALISIS_AMBIENTAL_ERROR",

    // RESPUESTA ANALISIS AMBIENTAL
    CREATE_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST: "project/CREATE_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST",
    CREATE_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS: "project/CREATE_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS",
    CREATE_RESPUESTA_ANALISIS_AMBIENTAL_ERROR: "project/CREATE_RESPUESTA_ANALISIS_AMBIENTAL_ERROR",
    GET_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST: "project/GET_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST",
    GET_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS: "project/GET_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS",
    GET_RESPUESTA_ANALISIS_AMBIENTAL_ERROR: "project/GET_RESPUESTA_ANALISIS_AMBIENTAL_ERROR",
    UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST: "project/UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST",
    UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS: "project/UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS",
    UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_ERROR: "project/UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_ERROR",
    // Criterios analisis ambiental
    GET_CRITERIOS_ANALISIS_AMBIENTAL_REQUEST: "project/GET_CRITERIOS_ANALISIS_AMBIENTAL_REQUEST",
    GET_CRITERIOS_ANALISIS_AMBIENTAL_SUCCESS: "project/GET_CRITERIOS_ANALISIS_AMBIENTAL_SUCCESS",
    GET_CRITERIOS_ANALISIS_AMBIENTAL_ERROR: "project/GET_CRITERIOS_ANALISIS_AMBIENTAL_ERROR",

    //SE INCLUYEN LOS TIPOS PARA MANEJAR ESTADOS DE FILTRO PARA FECHAS
    DATE_FILTER_DATE_END_CHANGE: 'project/DATE_FILTER_DATE_END_CHANGE',
    DATE_FILTER_DATE_START_CHANGE: 'project/DATE_FILTER_DATE_START_CHANGE',
    DATE_FILTER_FOCUS_INPUT: 'project/DATE_FILTER_FOCUS_INPUT',
    DATE_FILTER_CLEAR: 'project/DATE_FILTER_CLEAR',
    TOGGLE_FILTERS: 'project/TOGGLE_FILTERS'
}

export const actions = {
    startProject: (projectId, modo, filter, startFromBatch) => ({
        type: types.START_PROJECT_REQUEST,
        projectId,
        modo,
        filter,
        startFromBatch
    }),
    closeProject: (projectId, modo, fecha_cierre, filter = false) => ({
        type: types.CLOSE_PROJECT_REQUEST,
        projectId,
        modo,
        fecha_cierre,
        filter
    }),
    getProjectsByFilter: (filter = {}) => ({
        type: types.GET_PROJECTS_FILTERED_REQUEST,
        filter
    }),
    createProjectRequest: (payload) => ({
        type: types.CREATE_PROJECT_REQUEST,
        payload
    }),
    createProjectGeneralDataRequest: (payload) => ({
        type: types.CREATE_PROJECT_GENERAL_DATA_REQUEST,
        payload
    }),
    handleProjectDateFilterStartDate: (startDate) => ({
        type: types.DATE_FILTER_DATE_START_CHANGE,
        startDate: moment(startDate)
    }),
    handleProjectDateFilterEndDate: (endDate) => ({
        type: types.DATE_FILTER_DATE_END_CHANGE,
        endDate: moment(endDate)
    }),
    handleProjectDateFilterFocusInput: (dateFilterInput) => ({
        type: types.DATE_FILTER_FOCUS_INPUT,
        dateFilterInput
    }),
    handleClearDateFilter: () => ({
        type: types.DATE_FILTER_CLEAR
    }),
    handleExpandFilters: () => ({
        type: types.TOGGLE_FILTERS
    }),
    getProjectDetailRequest: (projectId) => ({
        type: types.GET_PROJECT_DETAIL_REQUEST,
        projectId
    }),
    updateProject: (projectId, payload) => ({
        type: types.UPDATE_PROJECT_REQUEST,
        projectId,
        payload
    }),
    updateProjectGeneralData: (projectId, payload) => ({
        type: types.UPDATE_PROJECT_GENERAL_DATA_REQUEST,
        projectId,
        payload
    }),
    insertToDoTask: (payload) => ({
        type: types.INSERT_TODO_TASK_REQUEST,
        payload
    }),
    doneTask: (idTask, closeDate) => ({
        type: types.DONE_TASK_REQUEST,
        idTask,
        closeDate
    }),
    createInteresadoRequest: (payload) => ({
        type: types.CREATE_INTERESADO_REQUEST,
        payload
    }),
    updateInterested: (payload) => ({
        type: types.UPDATE_INTERESADO_REQUEST,
        payload,
    }),
    getInteresadosRequest: (projectId) => ({
        type: types.GET_PROJECT_INTERESADOS_REQUEST,
        projectId
    }),
    getInteresadoList: (projectId) => ({
        type: types.GET_LIST_INTERESADOS_REQUEST,
        projectId
    }),
    createAnalisisAmbientalRequest: (payload) => ({
        type: types.CREATE_ANALISIS_AMBIENTAL_REQUEST,
        payload
    }),
    getAnalisisAmbientalRequest: (projectId) => ({
        type: types.GET_ANALISIS_AMBIENTAL_REQUEST,
        projectId
    }),
    getCriteriosAnalisisAmbientalRequest: () => ({
        type: types.GET_CRITERIOS_ANALISIS_AMBIENTAL_REQUEST,
    }),
    createRespuestaAnalisisAmbientalRequest: (payload) => ({
        type: types.CREATE_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST,
        payload
    }),
    getRespuestaAnalisisAmbientalRequest: (projectId) => ({
        type: types.GET_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST,
        projectId
    }),
    updateRespuestaAnalisisAmbiental: (projectId, payload) => ({
        type: types.UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST,
        projectId,
        payload
    }),
    getTasksById: ({ idProject, page = 1, limit = 10, done }) => ({
        type: types.GET_TASKS_BY_ID_REQUEST,
        idProject, page, limit, done
    })
}

const defaultState = {
    isLoading: false,
    projectList: [],
    endDate: null,
    startDate: null,
    dateFilterInput: 'startDate',
    filtersExpanded: false,
    selectedProjectDetail: null,
    todo: [],
    interesados: [],
    interesado: [],
    isLoadingInteresados: false,
    criteriosAnalisisAmbiental: [],
    analysisData: [],
    respuestaAnalisisAmbiental: [],
    showNotification: {},
}

export const selectors = {
    getIsLoading: ({ project }) => project.isLoading,
    getProjectList: ({ project }) => project.projectList,
    getEndDateFilter: ({ project }) => project.endDate,
    getStartDateFilter: ({ project }) => project.startDate,
    getDateFilterInput: ({ project }) => project.dateFilterInput,
    getFilterExpanded: ({ project }) => project.filtersExpanded,
    getProjectDetail: ({ project }) => project.selectedProjectDetail,
    getToDo: ({ project }) => project.todo,
    getInteresadosRequest: ({ project }) => project.interesados,
    getInteresadoList: ({project }) => project.interesado,
    getIsLoadingInteresados: ({ project }) => project.isLoadingInteresados,
    getCriteriosAmbiental: ({ project }) => project.criteriosAnalisisAmbiental,
    getAnalysisData: ({ project }) => project.analysisData,
    getRespuestaAnalysisData: ({ project }) => project.respuestaAnalisisAmbiental,
    getShowNotification: ({ project }) => project.showNotification,
    getLoading: ({ project }) => project.loading
}

const projectReducer = (state = defaultState, action = {}) => {
    const {
        projectList,
        endDate,
        startDate,
        dateFilterInput,
        selectedProjectDetail,
        todo,
        interesados,
        interesado,
        analisisAmbiental,
        analysisData,
        respuestaAnalisisAmbiental,
    } = action
    switch (action.type) {
        case types.START_PROJECT_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.CLOSE_PROJECT_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.CLOSE_PROJECT_SUCCESS:
            return {
                ...state,
                isLoading: false,
                // si necesitas actualizar el estado del proyecto en la lista:
                projectList: state.projectList.map(p =>
                    p.id === action.projectId
                        ? { ...p, estado: "E", fecha_cierre: action.fecha_cierre }
                        : p
                )
            }
        case types.CLOSE_PROJECT_ERROR:
            return {
                ...state,
                isLoading: false
            }
        case types.GET_PROJECTS_FILTERED_SUCCESS:
            return {
                ...state,
                isLoading: false,
                projectList
            }
        case types.GET_PROJECTS_FILTERED_ERROR:
            return {
                ...state,
                projectList: []
            }
        case types.DATE_FILTER_DATE_END_CHANGE:
            return {
                ...state,
                endDate
            }
        case types.DATE_FILTER_DATE_START_CHANGE:
            return {
                ...state,
                startDate
            }
        case types.DATE_FILTER_FOCUS_INPUT:
            return {
                ...state,
                dateFilterInput
            }
        case types.DATE_FILTER_CLEAR:
            return {
                ...state,
                dateFilterInput: null,
                endDate: null,
                startDate: null
            }
        case types.TOGGLE_FILTERS:
            const { filtersExpanded } = state
            return {
                ...state,
                filtersExpanded: !filtersExpanded
            }
        case types.GET_PROJECT_DETAIL_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.GET_PROJECT_DETAIL_SUCCESS:
            return {
                ...state,
                selectedProjectDetail,
                isLoading: false
            }
        case types.UPDATE_PROJECT_REQUEST:
            return {
                ...state,
                isLoading: true,
                showNotification: {
                    show: false,
                    isSuccess: false,
                }
            }
        case types.UPDATE_PROJECT_SUCCESS:
            return {
                ...state,
                selectedProjectDetail,
                isLoading: false,
                showNotification: {
                    show: true,
                    isSuccess: true,
                    message: "Datos de acta actualizados"
                }
            }
        case types.UPDATE_PROJECT_ERROR:
            return {
                ...state,
                isLoading: false,
                showNotification: {
                    show: true,
                    isSuccess: false,
                }
            }
        case types.CREATE_PROJECT_GENERAL_DATA_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.CREATE_PROJECT_GENERAL_DATA_SUCCESS:
            return {
                ...state,
                isLoading: false,
                showNotification: {
                    show: true,
                    isSuccess: true,
                }
            }
        case types.CREATE_PROJECT_GENERAL_DATA_ERROR:
            return {
                ...state,
                isLoading: false,
                showNotification: {
                    show: true,
                    isSuccess: false,
                }
            }
        case types.UPDATE_PROJECT_GENERAL_DATA_REQUEST:
            return {
                ...state,
                isLoading: true,
                showNotification: {
                    show: false,
                    isSuccess: false,
                }
            }
        case types.UPDATE_PROJECT_GENERAL_DATA_SUCCESS:
            return {
                ...state,
                selectedProjectDetail,
                isLoading: false,
                showNotification: {
                    show: true,
                    isSuccess: true,
                    message: "Datos generales actualizados"
                }
            }
        case types.UPDATE_PROJECT_GENERAL_DATA_ERROR:
            return {
                ...state,
                isLoading: false,
                showNotification: {
                    show: true,
                    isSuccess: false,
                }
            }
        case types.INSERT_TODO_TASK_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.INSERT_TODO_TASK_SUCCESS:
            return {
                ...state,
                todo: todo,
                isLoading: false
            }
        case types.INSERT_TODO_TASK_ERROR:
            return {
                ...state,
                isLoading: false
            }
        case types.DONE_TASK_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.DONE_TASK_SUCCESS:
            return {
                ...state,
                todo: todo,
                isLoading: false
            }
        case types.DONE_TASK_ERROR:
            return {
                ...state,
                isLoading: false
            }
        case types.CREATE_INTERESADO_REQUEST:
            return {
                ...state,
                isLoading: true
            }

        case types.CREATE_INTERESADO_SUCCESS:
            return {
                ...state,
                interesados: interesados,
                isLoading: false
            }
        case types.CREATE_INTERESADO_ERROR:
            return {
                ...state,
                isLoading: false
            }
        case types.UPDATE_INTERESADO_REQUEST:
            return {
                ...state,
                isLoading: true,
            };
        case types.UPDATE_INTERESADO_SUCCESS:
            return {
                ...state,
                interesados: interesados,
                isLoading: false
            };
        case types.UPDATE_INTERESADO_ERROR:
            return {
            ...state,
                isLoading: false,
            };
        case types.GET_PROJECT_INTERESADOS_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.GET_PROJECT_INTERESADOS_SUCCESS:
            return {
                ...state,
                interesados: interesados,
                isLoading: false,
            }
        case types.GET_PROJECT_INTERESADOS_ERROR:
            return {
                ...state,
                isLoading: false,
                interesados: [] // Limpia interesados si hay error
            }
        case types.GET_LIST_INTERESADOS_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.GET_LIST_INTERESADOS_SUCCESS:
            return {
                ...state,
                interesado: interesado,
                isLoading: false,
            }
        case types.GET_LIST_INTERESADOS_ERROR:
            return {
                ...state,
                isLoading: false,
                interesado: [] // Limpia interesados si hay error
            }
        // Para CREATE_ANALISIS_AMBIENTAL
        case types.CREATE_ANALISIS_AMBIENTAL_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.CREATE_ANALISIS_AMBIENTAL_SUCCESS:
            return {
                ...state,
                analisisAmbiental: analisisAmbiental,
                isLoading: false // Guarda los datos del análisis ambiental
            }
        case types.CREATE_ANALISIS_AMBIENTAL_ERROR:
            return {
                ...state,
                isLoading: false,
            }
        case types.GET_ANALISIS_AMBIENTAL_REQUEST:
            return {
                ...state,
                isLoading: true,
            };
        case types.GET_ANALISIS_AMBIENTAL_SUCCESS:
            return {
                ...state,
                analysisData: action.analysisData, 
                isLoading: false,
            };
        case types.GET_ANALISIS_AMBIENTAL_ERROR:
            return {
                ...state,
                analysisData: null, 
                isLoading: false,
            };

        // Manejo correcto de criterios
        case types.GET_CRITERIOS_ANALISIS_AMBIENTAL_REQUEST:
            return {
                ...state,
                isLoading: true,
            };
        case types.GET_CRITERIOS_ANALISIS_AMBIENTAL_SUCCESS:
            return {
                ...state,
                criteriosAnalisisAmbiental: action.criteriosAnalisisAmbiental,
                isLoading: false,
            };
        case types.GET_CRITERIOS_ANALISIS_AMBIENTAL_ERROR:
            return {
                ...state,
                criteriosAnalisisAmbiental: [], 
                isLoading: false,
            }
        case types.CREATE_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.CREATE_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS:
            return {
                ...state,
                respuestaAnalisisAmbiental: action.respuestaAnalisisAmbiental, // ✅ Usa la data de la acción
                isLoading: false
            }
        case types.CREATE_RESPUESTA_ANALISIS_AMBIENTAL_ERROR:
            return {
                ...state,
                isLoading: false,
            }
        case types.GET_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST:
            return {
                ...state,
                isLoading: true,
            };
        case types.GET_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS:
            return {
                ...state,
                respuestaAnalisisAmbiental: action.respuestaAnalisisAmbiental,
                isLoading: false,
            };
        case types.GET_RESPUESTA_ANALISIS_AMBIENTAL_ERROR:
            return {
                ...state,
                respuestaAnalisisAmbiental: null, 
                isLoading: false,
            }
        case types.UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_REQUEST:
            return {
                ...state,
                isLoading: true,
                showNotification: {
                    show: false,
                    isSuccess: false,
                }
            };
        case types.UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_SUCCESS:
            return {
                ...state,
                respuestaAnalisisAmbiental: action.respuestaAnalisisAmbiental, // Aquí usamos los datos que vienen en la acción
                isLoading: false,
                showNotification: {
                    show: true,
                    isSuccess: true,
                    message: "link actualizado",
                }
            };
        case types.UPDATE_RESPUESTA_ANALISIS_AMBIENTAL_ERROR:
            return {
                ...state,
                isLoading: false,
                showNotification: {
                    show: true,
                    isSuccess: false,
                }
            };

        case types.GET_TASKS_BY_ID_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case types.GET_TASKS_BY_ID_SUCCESS:
            return {
                ...state,
                todo: todo,
                isLoading: false
            }
        case types.GET_TASKS_BY_ID_ERROR:
            return {
                ...state,
                isLoading: false
            }
        default:
            return state
    }
}

export default projectReducer;