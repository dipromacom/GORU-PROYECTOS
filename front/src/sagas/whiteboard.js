import { call, put, takeEvery, select } from "redux-saga/effects";
import { types, selectors } from "../reducers/whiteboard";
import * as Api from "../api";
import { onError } from "../libs/errorLib";

const sagas = [
    takeEvery(types.FETCH_WHITEBOARD_REQUEST, handleFetchWhiteboard),
    takeEvery(types.SYNC_WHITEBOARD_REQUEST, handleSyncWhiteboard),
    takeEvery(types.DELETE_WHITEBOARD_REQUEST, handleDeleteWhiteboard),
];

export default sagas;

/* ================================================================
   FETCH WHITEBOARD
================================================================ */
function* handleFetchWhiteboard({ projectId }) {
    try {
        const response = yield call(Api.fetchWhiteboard, { projectId });
        const { success, whiteboard } = response.data;

        if (success && whiteboard) {
            yield put({ type: types.FETCH_WHITEBOARD_SUCCESS, whiteboard });
        } else {
            yield put({ type: types.FETCH_WHITEBOARD_ERROR, error: "No se encontró la pizarra" });
        }
    } catch (e) {
        onError(e);
        yield put({ type: types.FETCH_WHITEBOARD_ERROR, error: e.message });
    }
}

/* ================================================================
   SYNC WHITEBOARD
================================================================ */
function* handleSyncWhiteboard({ projectId }) {
    try {
        const whiteboard = yield select(selectors.getWhiteboard);
        if (!whiteboard) return;

        const response = yield call(Api.syncWhiteboard, {
            projectId,
            content: whiteboard.content,
            title: whiteboard.title,
        });

        const { success } = response.data;
        if (success) {
            yield put({ type: types.SYNC_WHITEBOARD_SUCCESS });
        } else {
            yield put({ type: types.SYNC_WHITEBOARD_ERROR, error: "No se pudo sincronizar la pizarra" });
        }
    } catch (e) {
        onError(e);
        yield put({ type: types.SYNC_WHITEBOARD_ERROR, error: e.message });
    }
}

/* ================================================================
   DELETE WHITEBOARD
================================================================ */
function* handleDeleteWhiteboard({ projectId }) {
    try {
        const response = yield call(Api.deleteWhiteboard, { projectId });
        const { success } = response.data;
        if (success) {
            yield put({ type: types.DELETE_WHITEBOARD_SUCCESS });
            yield put({ type: types.CLEAN });
        } else {
            yield put({ type: types.DELETE_WHITEBOARD_ERROR, error: "No se pudo eliminar la pizarra" });
        }
    } catch (e) {
        onError(e);
        yield put({ type: types.DELETE_WHITEBOARD_ERROR, error: e.message });
    }
}
