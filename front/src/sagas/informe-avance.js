import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/informe-avance";
import * as Api from "../api";

function* getInformesSaga(action) {
    try {
        const response = yield call(Api.getAllInformesAvance, action.proyectoId);
        const payload = response.data.data || response.data;
        yield put({
            type: types.GET_INFORMES_SUCCESS,
            payload: payload
        });
    } catch (error) {
        console.error('Saga: Error al obtener informes:', error);
        yield put({
            type: types.GET_INFORMES_ERROR,
            error: error.message
        });
    }
}

function* getInformeByIdSaga(action) {
    try {
        const response = yield call(Api.getInformeAvanceById, action.id);
        const payload = response.data.data || response.data;
        yield put({
            type: types.GET_INFORME_BY_ID_SUCCESS,
            payload: payload
        });
    } catch (error) {
        console.error('Saga: Error al obtener informe:', error);
        yield put({
            type: types.GET_INFORME_BY_ID_ERROR,
            error: error.message
        });
    }
}

function* createInformeSaga(action) {
    try {
        yield call(Api.createInformeAvance, action.payload);
        yield put({ type: types.CREATE_INFORME_SUCCESS });

        // Recargar la lista de informes
        const proyectoId = action.payload.proyectoId;
        yield put({
            type: types.GET_INFORMES_REQUEST,
            proyectoId
        });
    } catch (error) {
        yield put({
            type: types.CREATE_INFORME_ERROR,
            error: error.message
        });
    }
}

function* updateInformeSaga(action) {
    try {
        yield call(Api.updateInformeAvance, action.id, action.payload);
        yield put({ type: types.UPDATE_INFORME_SUCCESS });

        // Recargar la lista de informes
        const proyectoId = action.payload.proyectoId;
        yield put({
            type: types.GET_INFORMES_REQUEST,
            proyectoId
        });
    } catch (error) {
        yield put({
            type: types.UPDATE_INFORME_ERROR,
            error: error.message
        });
    }
}

function* deleteInformeSaga(action) {
    try {
        yield call(Api.deleteInformeAvance, action.id);
        yield put({ type: types.DELETE_INFORME_SUCCESS });

        // Recargar la lista (necesitas pasar el proyectoId también)
        if (action.proyectoId) {
            yield put({
                type: types.GET_INFORMES_REQUEST,
                proyectoId: action.proyectoId
            });
        }
    } catch (error) {
        yield put({
            type: types.DELETE_INFORME_ERROR,
            error: error.message
        });
    }
}

function* getInformesDashboardSaga(action) {
    try {
        const response = yield call(Api.getInformesDashboard, action.usuarioId, action.modo);
        const payload = response.data.data || response.data;
        yield put({ type: types.GET_INFORMES_DASHBOARD_SUCCESS, payload });
    } catch (error) {
        yield put({ type: types.GET_INFORMES_DASHBOARD_ERROR, error: error.message });
    }
}

export default [
    takeLatest(types.GET_INFORMES_REQUEST, getInformesSaga),
    takeLatest(types.GET_INFORME_BY_ID_REQUEST, getInformeByIdSaga),
    takeLatest(types.CREATE_INFORME_REQUEST, createInformeSaga),
    takeLatest(types.UPDATE_INFORME_REQUEST, updateInformeSaga),
    takeLatest(types.DELETE_INFORME_REQUEST, deleteInformeSaga),
    takeLatest(types.GET_INFORMES_DASHBOARD_REQUEST, getInformesDashboardSaga)
];