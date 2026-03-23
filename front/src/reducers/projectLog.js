export const types = {
    GET_PROJECT_LOGS_REQUEST: "projectLog/GET_PROJECT_LOGS_REQUEST",
    GET_PROJECT_LOGS_SUCCESS: "projectLog/GET_PROJECT_LOGS_SUCCESS",
    GET_PROJECT_LOGS_ERROR: "projectLog/GET_PROJECT_LOGS_ERROR",
};

export const actions = {
    getProjectLogs: (proyectoId) => ({
        type: types.GET_PROJECT_LOGS_REQUEST,
        proyectoId,
    }),
};

const initialState = {
    logs: [],
    isLoading: false,
    error: null,
};

export default function projectLogReducer(state = initialState, action) {
    switch (action.type) {
        case types.GET_PROJECT_LOGS_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.GET_PROJECT_LOGS_SUCCESS:
            return { ...state, isLoading: false, logs: action.logs };
        case types.GET_PROJECT_LOGS_ERROR:
            return { ...state, isLoading: false, error: action.error };
        default:
            return state;
    }
}

export const selectors = {
    getLogs: (state) => state.projectLog.logs,
    getIsLoading: (state) => state.projectLog.isLoading,
};