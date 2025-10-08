import { v4 as uuidv4 } from "uuid";

export const types = {
    CREATE_TASK: "gantt/CREATE_TASK",
    EDIT_TASK: "gantt/EDIT_TASK",
    DELETE_TASK: "gantt/DELETE_TASK",
    MOVE_TASK: "gantt/MOVE_TASK",
    SET_TASKS: "gantt/SET_TASKS",

    FETCH_GANTT_REQUEST: "gantt/FETCH_GANTT_REQUEST",
    FETCH_GANTT_SUCCESS: "gantt/FETCH_GANTT_SUCCESS",
    FETCH_GANTT_ERROR: "gantt/FETCH_GANTT_ERROR",

    SYNC_GANTT_REQUEST: "gantt/SYNC_GANTT_REQUEST",
    SYNC_GANTT_SUCCESS: "gantt/SYNC_GANTT_SUCCESS",
    SYNC_GANTT_ERROR: "gantt/SYNC_GANTT_ERROR",

    CLEAN: "gantt/CLEAN",
};

export const actions = {
    createTask: ({ id, name, description, start, end, progress, projectId, dependencies = [], interesados_id = [] }) => ({
        type: types.CREATE_TASK,
        id: id || uuidv4(),
        name,
        description,
        start,
        end,
        progress,
        projectId,
        dependencies,
        interesados_id,
    }),

    editTask: ({ id, name, description, start, end, progress, dependencies = [], interesados_id = [] }) => ({
        type: types.EDIT_TASK,
        id,
        name,
        description,
        start,
        end,
        progress,
        dependencies,
        interesados_id,
    }),

    deleteTask: ({ id, projectId }) => ({
        type: types.DELETE_TASK,
        id,
        projectId,
    }),

    moveTask: ({ id, newStart, newEnd, projectId }) => ({
        type: types.MOVE_TASK,
        id,
        newStart,
        newEnd,
        projectId,
    }),

    setTasks: ({ tasks }) => ({
        type: types.SET_TASKS,
        tasks,
    }),

    fetch: ({ projectId }) => ({
        type: types.FETCH_GANTT_REQUEST,
        projectId,
    }),

    sync: ({ projectId }) => ({
        type: types.SYNC_GANTT_REQUEST,
        projectId,
    }),

    clean: () => ({
        type: types.CLEAN,
    }),
};

const defaultState = {
    tasks: [],
};

export const selectors = {
    getTasks: ({ gantt }) => gantt.tasks || [],
    getState: ({ gantt }) => gantt,
};

const ganttReducer = (state = defaultState, action = {}) => {
    const {
        id,
        name,
        description,
        start,
        end,
        progress,
        tasks,
        dependencies,
        interesados_id,
    } = action;

    switch (action.type) {

        case types.CREATE_TASK: {
            const uuid = uuidv4();
            const newTask = {
                id: id,
                name: name || "Nueva tarea",
                description: description,
                start_date: start,
                end_date: end,
                progress: progress || 0,
                dependencies: dependencies || [],
                interesados_id: interesados_id || [],
                status: "pending",
            };

            const currentTasks = Array.isArray(state.tasks) ? state.tasks : [];

            return {
                ...state,
                tasks: [...currentTasks, newTask],
            };
        }

        case types.EDIT_TASK: {
            return {
                ...state,
                tasks: state.tasks.map((t) =>
                    t.id === id
                        ? {
                            ...t,
                            name: name ?? t.name,
                            description: description ?? t.description,
                            start_date: start ?? t.start_date,
                            end_date: end ?? t.end_date,
                            progress:
                                progress !== undefined ? progress : t.progress,
                            dependencies: dependencies ?? t.dependencies ?? [],
                            interesados_id:
                                interesados_id ?? t.interesados_id ?? [],
                        }
                        : t
                ),
            };
        }

        case types.DELETE_TASK: {
            return {
                ...state,
                tasks: state.tasks.filter((t) => t.id !== id),
            };
        }

        case types.MOVE_TASK: {
            return {
                ...state,
                tasks: state.tasks.map((t) =>
                    t.id === id
                        ? {
                            ...t,
                            start_date: action.newStart,
                            end_date: action.newEnd,
                        }
                        : t
                ),
            };
        }

        case types.SET_TASKS: {
            const normalized = Array.isArray(tasks)
                ? tasks
                : tasks?.rows || Object.values(tasks?.byId || {}) || [];

            return {
                ...state,
                tasks: normalized,
            };
        }

        /* 🧹 Limpiar estado */
        case types.CLEAN:
            return defaultState;

        default:
            return state;
    }
};

export default ganttReducer;
