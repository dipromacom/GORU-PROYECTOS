import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/controlCambio";
import * as Api from "../api";

function* getSolicitudesSaga(action) {
    try {
        const response = yield call(Api.getSolicitudesProyecto, action.proyectoId);
        const payload = response.data.data || response.data;
        yield put({ type: types.GET_SOLICITUDES_SUCCESS, payload });
    } catch (error) {
        yield put({ type: types.GET_SOLICITUDES_ERROR, error: error.message });
    }
}

function* saveSolicitudSaga(action) {
    try {
        yield call(Api.createSolicitudCambio, action.payload);
        yield put({ type: types.SAVE_SOLICITUD_SUCCESS });

        // Refrescar lista del proyecto
        yield put({
            type: types.GET_SOLICITUDES_REQUEST,
            proyectoId: action.payload.proyecto_id
        });
    } catch (error) {
        yield put({ type: types.SAVE_SOLICITUD_ERROR, error: error.message });
    }
}

function* updateStatusSaga(action) {
    try {
        yield call(Api.updateEstadoSolicitudCambio, action.id, action.payload);
        yield put({ type: types.UPDATE_STATUS_SUCCESS });

        // Refrescar lista
        yield put({ type: types.GET_SOLICITUDES_REQUEST, proyectoId: action.proyectoId });
    } catch (error) {
        yield put({ type: types.UPDATE_STATUS_ERROR, error: error.message });
    }
}

function* getDashboardSaga(action) {
    try {
        const response = yield call(Api.getSolicitudesDashboard, action.usuarioId, action.modo);
        const payload = response.data.data || response.data;
        yield put({ type: types.GET_DASHBOARD_SUCCESS, payload });
    } catch (error) {
        yield put({ type: types.GET_DASHBOARD_ERROR, error: error.message });
    }
}

export default [
    takeLatest(types.GET_SOLICITUDES_REQUEST, getSolicitudesSaga),
    takeLatest(types.SAVE_SOLICITUD_REQUEST, saveSolicitudSaga),
    takeLatest(types.UPDATE_STATUS_REQUEST, updateStatusSaga),
    takeLatest(types.GET_DASHBOARD_REQUEST, getDashboardSaga),
];