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
   📥 FETCH GANTT (Obtener todas las actividades del proyecto)
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
   🔄 SYNC GANTT (Sincroniza el estado actual del Gantt con la BD)
================================================================ */
function* handleSyncGantt({ projectId }) {
    try {
        const { tasks } = yield select(selectors.getState);
        if (!Array.isArray(tasks)) return;

        // Normalizamos datos antes de enviar
        const normalizedTasks = tasks.map((t) => ({
            ...t,
            project_id: t.project_id || projectId,  // ✅ Añadimos project_id
            start_date: t.start || t.start_date,
            end_date: t.end || t.end_date,
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
   ➕ CREATE TASK (Crea una nueva tarea)
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
}) {
    try {
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
        });

        const { success } = response.data;
        if (success) {
            // recarga el Gantt tras crear
            const fetchResponse = yield call(Api.fetchGantt, { projectId });
            const { tasks } = fetchResponse.data;
            yield put({ type: types.SET_TASKS, tasks });
        }
    } catch (e) {
        onError(e);
    }
}

/* ================================================================
   ✏️ EDIT TASK (Editar tarea existente)
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
}) {
    try {
        const { tasks } = yield select(selectors.getState);
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        yield call(Api.editTask, {
            id,
            name,
            description,
            start_date: start,
            end_date: end,
            progress,
            projectId: task.projectId,
            dependencies,
            interesados_id,
        });
    } catch (e) {
        onError(e);
    }
}

/* ================================================================
   🚮 DELETE TASK (Eliminar tarea)
================================================================ */
function* handleDeleteTask({ id, projectId }) {
    try {
        yield call(Api.deleteTask, { id, projectId });
    } catch (e) {
        onError(e);
    }
}

/* ================================================================
   📆 MOVE TASK (Mover o cambiar fechas de tarea)
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
