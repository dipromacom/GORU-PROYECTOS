import { call, put, take, takeEvery, select } from "redux-saga/effects";
import { types, selectors } from "../reducers/kanban"
import * as Api from "../api";
import { onError } from "../libs/errorLib";


const sagas = [
    takeEvery(types.MOVE_TASK, handleMoveTask),
    takeEvery(types.DELETE_TASK, handleDeleteTask),
    takeEvery(types.SYNC_KANBAN_REQUEST, handleSyncKanban),
    takeEvery(types.FETCH_KANBAN_REQUEST, handleKanbanRequest)

]


function* handleMoveTask({ destination, source, draggableId }) {
    if (
        !destination ||
        (destination.droppableId === source.droppableId &&
            destination.index === source.index)
    ) {
        return;
    }
    const { status } = yield select(selectors.getState)
    const sourceColumn = status.byId[source.droppableId];
    const destinationColumn = status.byId[
        destination.droppableId
    ];
    const sourceTaskIds = [...sourceColumn.tasks];
    const destinationTaskIds = [...destinationColumn.tasks];

    if (destination.droppableId === source.droppableId) {
        sourceTaskIds.splice(source.index, 1);
        sourceTaskIds.splice(destination.index, 0, draggableId);
        yield put({ type: types.SET_TASK_SAME_SRC, statusSrcId: destination.droppableId, statusSrcTasks: sourceTaskIds })
    } else {
        sourceTaskIds.splice(source.index, 1);
        destinationTaskIds.splice(destination.index, 0, draggableId);
        yield put({
            type: types.SET_TASK_SRC_DEST,
            statusSrcId: source.droppableId,
            statusSrcTasks: sourceTaskIds,
            statusDstId: destination.droppableId,
            statusDstTasks: destinationTaskIds,
        })
    }
}

function* handleDeleteTask({ idTask }) {
    const { status, tasks } = yield select(selectors.getState)
    const { [idTask]: removed, ...taskskById } = tasks.byId
    const allTaskIds = tasks.allIds.filter(id => id !== idTask)

    const filteredStatus = {}
    for (const [key,value] of Object.entries(status.byId) ){
        filteredStatus[key] = { 
            ...value, tasks: value.tasks.filter(id => id !== idTask)
        }
    }

    yield put({
        type: types.SET_TASKS_STATUS,
        tasks: {
            ... tasks,
            byId: {
                ... taskskById
            },
            allIds: [...allTaskIds]
        },
        status: {
            ...status,
            byId: {
                ...filteredStatus
            }
        }
    })
}

function* handleSyncKanban({projectId}){
    try{
        const { status, tasks } = yield select(selectors.getState)
        const response = yield call(Api.syncKanban,{status, tasks, projectId});
        const { success, message } = response.data;
        if(success){
            yield put({type: types.SYNC_KANBAN_SUCCESS})
        }
    }catch(e){
        onError(e)
        yield put({type: types.SYNC_KANBAN_ERROR})
    }  
}

function* handleKanbanRequest({projectId}){
    try{
        const response = yield call(Api.fetchKanban,{projectId});
        const {success, status, tasks } = response.data;
        if(success){
            yield put({
                type: types.SET_TASKS_STATUS,
                tasks,
                status
            })
        } 
    }catch(e){
        onError(e)
        yield put({type: types.SYNC_KANBAN_ERROR})
    }  
}

export default sagas