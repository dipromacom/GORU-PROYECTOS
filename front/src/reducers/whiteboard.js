export const types = {
    SET_WHITEBOARD: "whiteboard/SET_WHITEBOARD",
    UPDATE_WHITEBOARD_CONTENT: "whiteboard/UPDATE_WHITEBOARD_CONTENT",

    FETCH_WHITEBOARD_REQUEST: "whiteboard/FETCH_WHITEBOARD_REQUEST",
    FETCH_WHITEBOARD_SUCCESS: "whiteboard/FETCH_WHITEBOARD_SUCCESS",
    FETCH_WHITEBOARD_ERROR: "whiteboard/FETCH_WHITEBOARD_ERROR",

    SYNC_WHITEBOARD_REQUEST: "whiteboard/SYNC_WHITEBOARD_REQUEST",
    SYNC_WHITEBOARD_SUCCESS: "whiteboard/SYNC_WHITEBOARD_SUCCESS",
    SYNC_WHITEBOARD_ERROR: "whiteboard/SYNC_WHITEBOARD_ERROR",

    DELETE_WHITEBOARD_REQUEST: "whiteboard/DELETE_WHITEBOARD_REQUEST",
    DELETE_WHITEBOARD_SUCCESS: "whiteboard/DELETE_WHITEBOARD_SUCCESS",
    DELETE_WHITEBOARD_ERROR: "whiteboard/DELETE_WHITEBOARD_ERROR",

    CLEAN: "whiteboard/CLEAN",
};

export const actions = {
    fetch: ({ projectId }) => ({
        type: types.FETCH_WHITEBOARD_REQUEST,
        projectId,
    }),

    sync: ({ projectId }) => ({
        type: types.SYNC_WHITEBOARD_REQUEST,
        projectId,
    }),

    deleteWhiteboard: ({ projectId }) => ({
        type: types.DELETE_WHITEBOARD_REQUEST,
        projectId,
    }),

    setWhiteboard: ({ whiteboard }) => ({
        type: types.SET_WHITEBOARD,
        whiteboard,
    }),

    updateContent: ({ content }) => ({
        type: types.UPDATE_WHITEBOARD_CONTENT,
        content,
    }),

    clean: () => ({
        type: types.CLEAN,
    }),
};

const defaultState = {
    whiteboard: null,
    loading: false,
    error: null,
};

export const selectors = {
    getWhiteboard: ({ whiteboard }) => whiteboard.whiteboard || null,
    getContent: ({ whiteboard }) => whiteboard.whiteboard?.content || {},
    isLoading: ({ whiteboard }) => whiteboard.loading,
};

const whiteboardReducer = (state = defaultState, action = {}) => {
    switch (action.type) {
        case types.FETCH_WHITEBOARD_REQUEST:
            return { ...state, loading: true, error: null, whiteboard: null };
        case types.SYNC_WHITEBOARD_REQUEST:
        case types.DELETE_WHITEBOARD_REQUEST:
            return { ...state, loading: true, error: null };

        case types.FETCH_WHITEBOARD_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null,
                whiteboard: action.whiteboard, // debe venir con content y title
            };
        case types.SYNC_WHITEBOARD_SUCCESS:
        case types.DELETE_WHITEBOARD_SUCCESS:
            return { ...state, loading: false, error: null };

        case types.FETCH_WHITEBOARD_ERROR:
            return { ...state, loading: false, error: action.error, whiteboard: { title: "Nueva pizarra", content: {} } };
        case types.SYNC_WHITEBOARD_ERROR:
        case types.DELETE_WHITEBOARD_ERROR:
            return { ...state, loading: false, error: action.error };

        case types.SET_WHITEBOARD:
            return { ...state, whiteboard: action.whiteboard, loading: false };

        case types.UPDATE_WHITEBOARD_CONTENT:
            if (!state.whiteboard) return state;
            return {
                ...state,
                whiteboard: {
                    ...state.whiteboard,
                    content: {
                        ...state.whiteboard.content, // conserva contenido actual
                        ...action.content,            // mezcla lo nuevo
                    },
                },
            };

        case types.CLEAN:
            return defaultState;

        default:
            return state;
    }
};

export default whiteboardReducer;
