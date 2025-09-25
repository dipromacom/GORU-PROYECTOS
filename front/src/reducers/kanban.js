import { v4 as uuidv4 } from 'uuid';


export const types = {
    MOVE_TASK: "kanban/MOVE_TASK",
    CREATE_STATUS: "kanban/CREATE_STATUS",
    DELETE_STATUS: "kanban/DELETE_STATUS",
    EDIT_STATUS: "kanban/EDIT_STATUS",
    EDIT_TASK: "kanban/EDIT_TASK",
    CREATE_TASK: "kanban/CREATE_TASK",
    DELETE_TASK: "kanban/DELETE_TASK",
    SET_TASK_SAME_SRC: "kaban/SET_TASK_SAME_SRC",
    SET_TASK_SRC_DEST: "kanban/SET_TASK_SRC_DEST",
    SET_TASKS_STATUS: "kanban/SET_TASKS_STATUS",
    SYNC_KANBAN_REQUEST: "kanban/SYNC_KANBAN_REQUEST",
    SYNC_KANBAN_SUCCESS: "kanban/SYNC_KANBAN_SUCCESS",
    SYNC_KANBAN_ERROR: "kanban/SYNC_KANBAN_ERROR",
    FETCH_KANBAN_REQUEST: "kanban/FETCH_KANBAN_REQUEST",
    CLEAN: "kanban/CLEAN",
}


export const actions = {
    createStatus: (statusTitle) => ({
        type: types.CREATE_STATUS,
        statusTitle
    }),

    deleteStatus: (statusId) => ({
        type: types.DELETE_STATUS,
        statusId
    }),

    editStatus: ({ idField, title }) => ({
        type: types.EDIT_STATUS,
        statusId: idField, statusTitle: title
    }),

    createTask: ({ content, priority, statusId, interesadoId }) => ({
        type: types.CREATE_TASK,
        taskContent: content, priority, statusId, interesadoId
    }),

    moveTask: ({ destination, source, draggableId }) => ({
        type: types.MOVE_TASK,
        destination, source, draggableId
    }),

    editTask: ({ id, content, priority, interesadoId }) => ({
        type: types.EDIT_TASK,
        taskId: id, taskContent: content, priority, interesadoId
    }),

    deleteTask: ({ id }) => ({
        type: types.DELETE_TASK,
        idTask: id
    }),

    syncKanban: ({ projectId }) => ({
        type: types.SYNC_KANBAN_REQUEST,
        projectId
    }),

    fetch: ({ projectId }) => ({
        type: types.FETCH_KANBAN_REQUEST,
        projectId
    })
}

const defaultState = {
    status: {
        byId: {}, allIds: []
    },
    tasks: {
        byId: {}, allIds: []
    }
}

export const selectors = {
    getTaskByStatus: ({ kanban }) => {
        const { tasks, status } = kanban;
        const statusValues = status.allIds.map((id) => status.byId[id]);
        const resolveTask = (taskId) => tasks.byId[taskId];
        const mapTasks = (taskAllIds) => taskAllIds.map(resolveTask);
        return statusValues.map((status) => ({
            ...status,
            tasks: mapTasks(status.tasks),
        }));
    },

    getState: ({ kanban }) => {
        return { ...kanban }
    }


}

const kanbanReducer = (state = defaultState, action = {}) => {
    const {
        statusTitle,
        statusId,
        taskId,
        taskContent,
        statusSrcId,
        statusSrcTasks,
        statusDstId,
        statusDstTasks,
        status, tasks
    } = action
    switch (action.type) {
        case types.CREATE_STATUS:
            const uuid = uuidv4();
            state.status = {
                byId: {
                    ...state.status.byId,
                    [uuid]: {
                        id: uuid,
                        title: statusTitle || "New Column",
                        tasks: [],
                    },
                },
                allIds: [...state.status.allIds, uuid],
            };
            return {
                ...state,
            }
        case types.DELETE_STATUS:
            const { [statusId]: removed, ...newById } = state.status.byId;
            const newAllIds = state.status.allIds.filter(id => id !== statusId);
            return {
                ...state,
                status: {
                    ...state.status,
                    byId: newById,
                    allIds: newAllIds,
                },
            };
        case types.EDIT_STATUS:
            return {
                ...state,
                status: {
                    byId: {
                        ...state.status.byId,
                        [statusId]: {
                            ...state.status.byId[statusId],
                            title: statusTitle || state.status.byId[statusId].title,
                        }
                    },
                    allIds: [...state.status.allIds],
                }
            }
        case types.CREATE_TASK:
            const uuid_task = uuidv4();
            return {
                ...state,
                tasks: {
                    byId: {
                        ...state.tasks.byId,
                        [uuid_task]: {
                            id: uuid_task,
                            content: taskContent || "New Task",
                            priority: "none",
                            interesadoId: action.interesadoId || null,
                        },
                    },
                    allIds: [...state.tasks.allIds, uuid_task],
                }
                ,
                status: {
                    ...state.status,
                    byId: {
                        ...state.status.byId,
                        [statusId]: {
                            ...state.status.byId[statusId],
                            tasks: [...state.status.byId[statusId].tasks, uuid_task],
                        },
                    },
                }
            }
        case types.EDIT_TASK:
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    byId: {
                        ...state.tasks.byId,
                        [taskId]: {
                            ...state.tasks.byId[taskId],
                            content: taskContent,
                            priority: action.priority || state.tasks.byId[taskId].priority,
                            interesadoId: action.interesadoId !== undefined
                                ? action.interesadoId
                                : state.tasks.byId[taskId].interesadoId,
                        }
                    }
                }
            }
        case types.SET_TASK_SAME_SRC:
            return {
                ...state,
                status: {
                    ...state.status,
                    byId: {
                        ...state.status.byId,
                        [statusSrcId]: {
                            ...state.status.byId[statusSrcId],
                            tasks: statusSrcTasks
                        }
                    }
                }
            }
        case types.SET_TASK_SRC_DEST:
            return {
                ...state,
                status: {
                    ...state.status,
                    byId: {
                        ...state.status.byId,
                        [statusSrcId]: {
                            ...state.status.byId[statusSrcId],
                            tasks: statusSrcTasks
                        },
                        [statusDstId]: {
                            ...state.status.byId[statusDstId],
                            tasks: statusDstTasks
                        }

                    }
                }
            }
        case types.SET_TASKS_STATUS:
            return {
                status: {
                    ...status
                },
                tasks: {
                    ...tasks
                }
            }
        case types.CLEAN:
            return defaultState
        default:
            return state
    }

}

export default kanbanReducer;