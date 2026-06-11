export const types = {
    FETCH_SCRUM_REQUEST: 'scrum/FETCH_SCRUM_REQUEST',
    FETCH_SCRUM_SUCCESS: 'scrum/FETCH_SCRUM_SUCCESS',
    FETCH_SCRUM_ERROR: 'scrum/FETCH_SCRUM_ERROR',
    CLEAN: 'scrum/CLEAN',
};

export const actions = {
    fetch: ({ projectId, includeArchived = false }) => ({
        type: types.FETCH_SCRUM_REQUEST,
        projectId,
        includeArchived,
    }),
    clean: () => ({
        type: types.CLEAN,
    }),
};

const defaultState = {
    epics: [],
    stories: [],
    archivedStories: [],
    sprints: [],
    stats: null,
    config: null,
    proyecto: null,
    loading: false,
    error: null,
};

export const selectors = {
    getEpics: ({ scrum }) => scrum.epics,
    getStories: ({ scrum }) => scrum.stories,
    getArchivedStories: ({ scrum }) => scrum.archivedStories,
    getSprints: ({ scrum }) => scrum.sprints,
    getStats: ({ scrum }) => scrum.stats,
    getConfig: ({ scrum }) => scrum.config,
    getProyecto: ({ scrum }) => scrum.proyecto,
    isLoading: ({ scrum }) => scrum.loading,
    getError: ({ scrum }) => scrum.error,
};

const scrumReducer = (state = defaultState, action = {}) => {
    switch (action.type) {
        case types.FETCH_SCRUM_REQUEST:
            return { ...state, loading: true, error: null };
        case types.FETCH_SCRUM_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null,
                epics: action.epics || [],
                stories: action.stories || [],
                archivedStories: action.archivedStories || [],
                sprints: action.sprints || [],
                stats: action.stats || null,
                config: action.config || null,
                proyecto: action.proyecto || null,
            };
        case types.FETCH_SCRUM_ERROR:
            return { ...state, loading: false, error: action.error };
        case types.CLEAN:
            return defaultState;
        default:
            return state;
    }
};

export default scrumReducer;
