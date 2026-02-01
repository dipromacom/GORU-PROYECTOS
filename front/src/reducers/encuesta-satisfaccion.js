export const types = {
    CHECK_SURVEY_STATUS_REQUEST: "survey/CHECK_SURVEY_STATUS_REQUEST",
    CHECK_SURVEY_STATUS_SUCCESS: "survey/CHECK_SURVEY_STATUS_SUCCESS",
    CHECK_SURVEY_STATUS_ERROR: "survey/CHECK_SURVEY_STATUS_ERROR",

    GET_SURVEYS_PROJECT_REQUEST: "survey/GET_SURVEYS_PROJECT_REQUEST",
    GET_SURVEYS_PROJECT_SUCCESS: "survey/GET_SURVEYS_PROJECT_SUCCESS",
    GET_SURVEYS_PROJECT_ERROR: "survey/GET_SURVEYS_PROJECT_ERROR",

    GET_ALL_SURVEYS_REQUEST: "survey/GET_ALL_SURVEYS_REQUEST", 
    GET_ALL_SURVEYS_SUCCESS: "survey/GET_ALL_SURVEYS_SUCCESS", 
    GET_ALL_SURVEYS_ERROR: "survey/GET_ALL_SURVEYS_ERROR",     

    SAVE_SURVEY_REQUEST: "survey/SAVE_SURVEY_REQUEST",
    SAVE_SURVEY_SUCCESS: "survey/SAVE_SURVEY_SUCCESS",
    SAVE_SURVEY_ERROR: "survey/SAVE_SURVEY_ERROR",

    REJECT_SURVEY_REQUEST: "survey/REJECT_SURVEY_REQUEST",
    REJECT_SURVEY_SUCCESS: "survey/REJECT_SURVEY_SUCCESS",
    REJECT_SURVEY_ERROR: "survey/REJECT_SURVEY_ERROR",

    CLEAR_SURVEY_STATE: "survey/CLEAR_SURVEY_STATE",
};

export const actions = {
    checkSurveyStatus: (proyectoId) => ({
        type: types.CHECK_SURVEY_STATUS_REQUEST,
        proyectoId,
    }),
    getSurveysProject: (proyectoId) => ({
        type: types.GET_SURVEYS_PROJECT_REQUEST,
        proyectoId,
    }),
    getAllSurveys: (proyectoId) => ({ 
        type: types.GET_ALL_SURVEYS_REQUEST,
        proyectoId,
    }),
    saveSurvey: (payload) => ({
        type: types.SAVE_SURVEY_REQUEST,
        payload,
    }),
    rejectSurvey: (proyectoId) => ({
        type: types.REJECT_SURVEY_REQUEST,
        proyectoId,
    }),
    clearSurveyState: () => ({
        type: types.CLEAR_SURVEY_STATE,
    }),
};

const defaultState = {
    isLoading: false,
    debeVerEncuesta: false,
    encuestaActual: null,
    listaEncuestas: [],
    estadisticas: null,
    error: null,
};

export const selectors = {
    getIsLoading: ({ encuesta }) => encuesta.isLoading,
    getDebeVerEncuesta: ({ encuesta }) => encuesta.debeVerEncuesta,
    getEncuestaActual: ({ encuesta }) => encuesta.encuestaActual,
    getListaEncuestas: ({ encuesta }) => encuesta.listaEncuestas,
    getEstadisticas: ({ encuesta }) => encuesta.estadisticas,
    getError: ({ encuesta }) => encuesta.error,
};

const encuestaReducer = (state = defaultState, action = {}) => {
    switch (action.type) {
        case types.CHECK_SURVEY_STATUS_REQUEST:
        case types.GET_SURVEYS_PROJECT_REQUEST:
        case types.GET_ALL_SURVEYS_REQUEST: 
        case types.SAVE_SURVEY_REQUEST:
        case types.REJECT_SURVEY_REQUEST:
            return { ...state, isLoading: true };

        case types.CHECK_SURVEY_STATUS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                debeVerEncuesta: action.payload?.debeVerEncuesta ?? false,
                encuestaActual: action.payload?.encuesta ?? null,
                error: null,
            };

        case types.GET_SURVEYS_PROJECT_SUCCESS:
        case types.GET_ALL_SURVEYS_SUCCESS: 
            return {
                ...state,
                isLoading: false,
                listaEncuestas: action.payload?.encuestas ?? [],
                estadisticas: action.payload?.estadisticas ?? null,
                error: null,
            };

        case types.SAVE_SURVEY_SUCCESS:
            return {
                ...state,
                isLoading: false,
                debeVerEncuesta: false,
                encuestaActual: null,
                error: null,
            };

        case types.REJECT_SURVEY_SUCCESS:
            return {
                ...state,
                isLoading: false,
                debeVerEncuesta: false,
                error: null,
            };

        case types.CLEAR_SURVEY_STATE:
            return {
                ...defaultState,
            };

        case types.CHECK_SURVEY_STATUS_ERROR:
        case types.GET_SURVEYS_PROJECT_ERROR:
        case types.GET_ALL_SURVEYS_ERROR: 
        case types.SAVE_SURVEY_ERROR:
        case types.REJECT_SURVEY_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error,
            };

        default:
            return state;
    }
};

export default encuestaReducer;