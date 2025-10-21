import { call, put, takeEvery, select } from "redux-saga/effects";
import { types, selectors } from "../reducers/gantt";
import * as Api from "../api";
import { onError } from "../libs/errorLib";

const sagas = [
    takeEvery(types.FETCH_GANTT_REQUEST, handleFetchGantt),
    takeEvery(types.SYNC_GANTT_REQUEST, handleSyncGantt),
    takeEvery(types.CREATE_TASK, handleCreateTask),
    takeEvery(types.EDIT_TASK, handleEditTask),
    takeEvery(types.DELETE_TASK, handleDeleteTask),
    takeEvery(types.MOVE_TASK, handleMoveTask),
];

export default sagas;

/* ================================================================
   📥 FETCH GANTT
================================================================ */
function* handleFetchGantt({ projectId }) {
    try {
        const response = yield call(Api.fetchGantt, { projectId });
        const { success, tasks } = response.data;
        if (success) {
            yield put({ type: types.SET_TASKS, tasks });
            yield put({ type: types.FETCH_GANTT_SUCCESS });
        } else {
            yield put({ type: types.FETCH_GANTT_ERROR });
        }
    } catch (e) {
        onError(e);
        yield put({ type: types.FETCH_GANTT_ERROR });
    }
}

/* ================================================================
   🔄 SYNC GANTT
================================================================ */
function* handleSyncGantt({ projectId }) {
    console.log("entra a sync: " + projectId)
    try {
        const { tasks } = yield select(selectors.getState);
        if (!Array.isArray(tasks)) return;

        const normalizedTasks = tasks.map((t) => ({
            ...t,
            project_id: t.project_id || projectId,
            start_date: t.start_date,
            end_date: t.end_date,
            type: t.type || "task",
            parent_id: t.parent_id || null,
            is_critical: !!t.is_critical,
            duration: t.duration || 0,
        }));

        const response = yield call(Api.syncGantt, {
            projectId,
            tasks: normalizedTasks,
        });

        const { success } = response.data;
        if (success) {
            yield put({ type: types.SYNC_GANTT_SUCCESS });
        } else {
            yield put({ type: types.SYNC_GANTT_ERROR });
        }
    } catch (e) {
        onError(e);
        yield put({ type: types.SYNC_GANTT_ERROR });
    }
}

/* ================================================================
   ➕ CREATE TASK
================================================================ */
function* handleCreateTask({
    id,
    name,
    description,
    start,
    end,
    progress,
    projectId,
    dependencies,
    interesados_id,
    type,
    parent_id,
    is_critical,
    duration,
}) {
    try {
        console.log("entra a handleCreateTask: "+ projectId);
        const response = yield call(Api.createTask, {
            id,
            name,
            description,
            start_date: start,
            end_date: end,
            progress,
            project_id: projectId,
            dependencies,
            interesados_id,
            type,
            parent: parent_id,
            is_critical,
            duration,
        });

        const { success } = response.data;
        if (success) {
            const fetchResponse = yield call(Api.fetchGantt, { projectId });
            const { tasks } = fetchResponse.data;
            yield put({ type: types.SET_TASKS, tasks });
        }
    } catch (e) {
        onError(e);
    }
}

/* ================================================================
   ✏️ EDIT TASK
================================================================ */
function* handleEditTask({
    id,
    name,
    description,
    start,
    end,
    progress,
    dependencies,
    interesados_id,
    type,
    parent_id,
    is_critical,
    duration,
}) {
    try {
        const { tasks } = yield select(selectors.getState);
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        yield call(Api.editTask, {
            id,
            name,
            description,
            start_date: start ?? task.start_date,
            end_date: end ?? task.end_date,
            progress: progress ?? task.progress,
            dependencies: dependencies ?? task.dependencies,
            interesados_id: interesados_id ?? task.interesados_id,
            type: type ?? task.type,
            parent: parent_id ?? task.parent_id,
            is_critical: is_critical ?? task.is_critical,
            duration: duration ?? task.duration,
            projectId: task.projectId,
        });
    } catch (e) {
        onError(e);
    }
}

/* ================================================================
   🚮 DELETE TASK
================================================================ */
function* handleDeleteTask({ id, projectId }) {
    try {
        yield call(Api.deleteTask, { id, projectId });
    } catch (e) {
        onError(e);
    }
}

/* ================================================================
   📆 MOVE TASK
================================================================ */
function* handleMoveTask({ id, newStart, newEnd, projectId }) {
    try {
        yield call(Api.moveTask, {
            id,
            newStart,
            newEnd,
            projectId,
        });
    } catch (e) {
        onError(e);
    }
}
