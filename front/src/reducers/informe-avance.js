export const types = {
    GET_INFORMES_REQUEST: "informeAvance/GET_INFORMES_REQUEST",
    GET_INFORMES_SUCCESS: "informeAvance/GET_INFORMES_SUCCESS",
    GET_INFORMES_ERROR: "informeAvance/GET_INFORMES_ERROR",

    GET_INFORME_BY_ID_REQUEST: "informeAvance/GET_INFORME_BY_ID_REQUEST",
    GET_INFORME_BY_ID_SUCCESS: "informeAvance/GET_INFORME_BY_ID_SUCCESS",
    GET_INFORME_BY_ID_ERROR: "informeAvance/GET_INFORME_BY_ID_ERROR",

    CREATE_INFORME_REQUEST: "informeAvance/CREATE_INFORME_REQUEST",
    CREATE_INFORME_SUCCESS: "informeAvance/CREATE_INFORME_SUCCESS",
    CREATE_INFORME_ERROR: "informeAvance/CREATE_INFORME_ERROR",

    UPDATE_INFORME_REQUEST: "informeAvance/UPDATE_INFORME_REQUEST",
    UPDATE_INFORME_SUCCESS: "informeAvance/UPDATE_INFORME_SUCCESS",
    UPDATE_INFORME_ERROR: "informeAvance/UPDATE_INFORME_ERROR",

    DELETE_INFORME_REQUEST: "informeAvance/DELETE_INFORME_REQUEST",
    DELETE_INFORME_SUCCESS: "informeAvance/DELETE_INFORME_SUCCESS",
    DELETE_INFORME_ERROR: "informeAvance/DELETE_INFORME_ERROR",

    CLEAR_INFORME_STATE: "informeAvance/CLEAR_INFORME_STATE",
};

export const actions = {
    getInformes: (proyectoId) => ({
        type: types.GET_INFORMES_REQUEST,
        proyectoId,
    }),
    getInformeById: (id) => ({
        type: types.GET_INFORME_BY_ID_REQUEST,
        id,
    }),
    createInforme: (payload) => ({
        type: types.CREATE_INFORME_REQUEST,
        payload,
    }),
    updateInforme: (id, payload) => ({
        type: types.UPDATE_INFORME_REQUEST,
        id,
        payload,
    }),
    deleteInforme: (id) => ({
        type: types.DELETE_INFORME_REQUEST,
        id,
    }),
    clearInformeState: () => ({
        type: types.CLEAR_INFORME_STATE,
    }),
};

const defaultState = {
    isLoading: false,
    listaInformes: [],
    informeActual: null,
    error: null,
    showNotification: {
        show: false,
        isSuccess: false,
        message: '',
    },
};

export const selectors = {
    getIsLoading: ({ informeAvance }) => informeAvance.isLoading,
    getListaInformes: ({ informeAvance }) => informeAvance.listaInformes,
    getInformeActual: ({ informeAvance }) => informeAvance.informeActual,
    getError: ({ informeAvance }) => informeAvance.error,
    getShowNotification: ({ informeAvance }) => informeAvance.showNotification,
};

const informeAvanceReducer = (state = defaultState, action = {}) => {
    switch (action.type) {
        case types.GET_INFORMES_REQUEST:
        case types.GET_INFORME_BY_ID_REQUEST:
        case types.CREATE_INFORME_REQUEST:
        case types.UPDATE_INFORME_REQUEST:
        case types.DELETE_INFORME_REQUEST:
            return {
                ...state,
                isLoading: true,
                showNotification: { show: false, isSuccess: false, message: '' },
            };

        case types.GET_INFORMES_SUCCESS:
            return {
                ...state,
                isLoading: false,
                listaInformes: action.payload || [],
                error: null,
            };

        case types.GET_INFORME_BY_ID_SUCCESS:
            return {
                ...state,
                isLoading: false,
                informeActual: action.payload,
                error: null,
            };

        case types.CREATE_INFORME_SUCCESS:
            return {
                ...state,
                isLoading: false,
                error: null,
                showNotification: {
                    show: true,
                    isSuccess: true,
                    message: 'Informe creado exitosamente',
                },
            };

        case types.UPDATE_INFORME_SUCCESS:
            return {
                ...state,
                isLoading: false,
                error: null,
                showNotification: {
                    show: true,
                    isSuccess: true,
                    message: 'Informe actualizado exitosamente',
                },
            };

        case types.DELETE_INFORME_SUCCESS:
            return {
                ...state,
                isLoading: false,
                error: null,
                showNotification: {
                    show: true,
                    isSuccess: true,
                    message: 'Informe eliminado exitosamente',
                },
            };

        case types.CLEAR_INFORME_STATE:
            return {
                ...defaultState,
            };

        case types.GET_INFORMES_ERROR:
        case types.GET_INFORME_BY_ID_ERROR:
        case types.CREATE_INFORME_ERROR:
        case types.UPDATE_INFORME_ERROR:
        case types.DELETE_INFORME_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error,
                showNotification: {
                    show: true,
                    isSuccess: false,
                    message: action.error || 'Ocurrió un error',
                },
            };

        default:
            return state;
    }
};

export default informeAvanceReducer;