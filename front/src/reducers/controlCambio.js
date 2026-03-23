export const types = {
    GET_SOLICITUDES_REQUEST: "changeControl/GET_SOLICITUDES_REQUEST",
    GET_SOLICITUDES_SUCCESS: "changeControl/GET_SOLICITUDES_SUCCESS",
    GET_SOLICITUDES_ERROR: "changeControl/GET_SOLICITUDES_ERROR",

    SAVE_SOLICITUD_REQUEST: "changeControl/SAVE_SOLICITUD_REQUEST",
    SAVE_SOLICITUD_SUCCESS: "changeControl/SAVE_SOLICITUD_SUCCESS",
    SAVE_SOLICITUD_ERROR: "changeControl/SAVE_SOLICITUD_ERROR",

    UPDATE_STATUS_REQUEST: "changeControl/UPDATE_STATUS_REQUEST",
    UPDATE_STATUS_SUCCESS: "changeControl/UPDATE_STATUS_SUCCESS",
    UPDATE_STATUS_ERROR: "changeControl/UPDATE_STATUS_ERROR",

    GET_DASHBOARD_REQUEST: "changeControl/GET_DASHBOARD_REQUEST",
    GET_DASHBOARD_SUCCESS: "changeControl/GET_DASHBOARD_SUCCESS",
    GET_DASHBOARD_ERROR: "changeControl/GET_DASHBOARD_ERROR",

    CLEAR_STATE: "changeControl/CLEAR_STATE",
};

export const actions = {
    getSolicitudes: (proyectoId) => ({ type: types.GET_SOLICITUDES_REQUEST, proyectoId }),
    saveSolicitud: (payload) => ({ type: types.SAVE_SOLICITUD_REQUEST, payload }),
    updateStatus: (id, payload, proyectoId) => ({ type: types.UPDATE_STATUS_REQUEST, id, payload, proyectoId }),
    getDashboard: (usuarioId, modo) => ({ type: types.GET_DASHBOARD_REQUEST, usuarioId, modo }),
    clearState: () => ({ type: types.CLEAR_STATE }),
};

const defaultState = {
    isLoading: false,
    listaSolicitudes: [],
    error: null,
};

export const selectors = {
    getIsLoading: ({ controlCambio }) => controlCambio.isLoading,
    getSolicitudes: ({ controlCambio }) => controlCambio.listaSolicitudes,
    getError: ({ controlCambio }) => controlCambio.error,
};

const controlCambioReducer = (state = defaultState, action = {}) => {
    switch (action.type) {
        case types.GET_SOLICITUDES_REQUEST:
        case types.SAVE_SOLICITUD_REQUEST:
        case types.UPDATE_STATUS_REQUEST:
        case types.GET_DASHBOARD_REQUEST:
            return { ...state, isLoading: true };

        case types.GET_SOLICITUDES_SUCCESS:
        case types.GET_DASHBOARD_SUCCESS:
            return {
                ...state,
                isLoading: false,
                listaSolicitudes: action.payload,
                error: null,
            };

        case types.SAVE_SOLICITUD_SUCCESS:
        case types.UPDATE_STATUS_SUCCESS:
            return { ...state, isLoading: false, error: null };

        case types.GET_SOLICITUDES_ERROR:
        case types.SAVE_SOLICITUD_ERROR:
        case types.UPDATE_STATUS_ERROR:
        case types.GET_DASHBOARD_ERROR:
            return { ...state, isLoading: false, error: action.error };

        case types.CLEAR_STATE:
            return { ...defaultState };

        default:
            return state;
    }
};

export default controlCambioReducer;