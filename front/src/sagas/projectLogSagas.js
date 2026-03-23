import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/projectLog";
import * as Api from "../api";

function* getProjectLogsSaga(action) {
    try {
        const response = yield call(Api.getProjectStatusLogs, action.proyectoId);
        const servidorResponse = response.data;

        if (servidorResponse && servidorResponse.success) {
            yield put({
                type: types.GET_PROJECT_LOGS_SUCCESS,
                logs: servidorResponse.data
            });
            console.log("Saga: Logs enviados al reducer correctamente");
        } else {
            yield put({
                type: types.GET_PROJECT_LOGS_ERROR,
                error: "El servidor respondió con error"
            });
        }
    } catch (error) {
        console.error("Saga Error:", error);
        yield put({ type: types.GET_PROJECT_LOGS_ERROR, error: error.message });
    }
}
const projectLogSagas = [
    takeLatest(types.GET_PROJECT_LOGS_REQUEST, getProjectLogsSaga),
];

export default projectLogSagas;