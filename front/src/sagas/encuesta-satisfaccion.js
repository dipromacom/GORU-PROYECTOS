import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/encuesta-satisfaccion";
import * as Api from "../api";

function* checkSurveyStatusSaga(action) {
    try {
        const response = yield call(Api.verificarEstadoEncuesta, action.proyectoId);
        const payload = response.data.data || response.data;

        yield put({
            type: types.CHECK_SURVEY_STATUS_SUCCESS,
            payload: payload
        });
    } catch (error) {
        console.error('Saga: Error al verificar encuesta:', error);
        yield put({
            type: types.CHECK_SURVEY_STATUS_ERROR,
            error: error.message
        });
    }
}

function* getSurveysProjectSaga(action) {
    try {
        const response = yield call(Api.getEncuestasProyecto, action.proyectoId);
        const payload = response.data.data || response.data;

        yield put({
            type: types.GET_SURVEYS_PROJECT_SUCCESS,
            payload: payload
        });
    } catch (error) {
        console.error('Saga: Error al obtener encuestas:', error);
        yield put({
            type: types.GET_SURVEYS_PROJECT_ERROR,
            error: error.message
        });
    }
}


function* getAllSurveysSaga(action) {
    try {
        const response = yield call(Api.getAllEncuestasProyecto, action.proyectoId);
        const payload = response.data.data || response.data;

        yield put({
            type: types.GET_ALL_SURVEYS_SUCCESS,
            payload: payload
        });
    } catch (error) {
        console.error('Saga: Error al obtener todas las encuestas:', error);
        yield put({
            type: types.GET_ALL_SURVEYS_ERROR,
            error: error.message
        });
    }
}

function* saveSurveySaga(action) {
    try {
        yield call(Api.guardarEncuesta, action.payload);

        yield put({ type: types.SAVE_SURVEY_SUCCESS });

        const proyectoId = action.payload.proyecto_id || action.payload.proyectoId;

        // Recargar el estado del usuario
        yield put({
            type: types.CHECK_SURVEY_STATUS_REQUEST,
            proyectoId
        });

        // Recargar TODAS las encuestas del proyecto
        yield put({
            type: types.GET_ALL_SURVEYS_REQUEST,
            proyectoId
        });
    } catch (error) {
        yield put({
            type: types.SAVE_SURVEY_ERROR,
            error: error.message
        });
    }
}

function* rejectSurveySaga(action) {
    try {
        yield call(Api.rechazarEncuesta, action.proyectoId);

        yield put({ type: types.REJECT_SURVEY_SUCCESS });

        yield put({
            type: types.CHECK_SURVEY_STATUS_REQUEST,
            proyectoId: action.proyectoId
        });
    } catch (error) {
        yield put({
            type: types.REJECT_SURVEY_ERROR,
            error: error.message
        });
    }
}

function* getSurveysDashboardSaga(action) {
    try {
        const response = yield call(Api.getEncuestasDashboard, action.usuarioId, action.modo);
        const payload = response.data.data || response.data;
        yield put({ type: types.GET_SURVEYS_DASHBOARD_SUCCESS, payload });
    } catch (error) {
        yield put({ type: types.GET_SURVEYS_DASHBOARD_ERROR, error: error.message });
    }
}

export default [
    takeLatest(types.CHECK_SURVEY_STATUS_REQUEST, checkSurveyStatusSaga),
    takeLatest(types.GET_SURVEYS_PROJECT_REQUEST, getSurveysProjectSaga),
    takeLatest(types.GET_ALL_SURVEYS_REQUEST, getAllSurveysSaga), // ✅ NUEVO
    takeLatest(types.SAVE_SURVEY_REQUEST, saveSurveySaga),
    takeLatest(types.REJECT_SURVEY_REQUEST, rejectSurveySaga),
    takeLatest(types.GET_SURVEYS_DASHBOARD_REQUEST, getSurveysDashboardSaga)
];