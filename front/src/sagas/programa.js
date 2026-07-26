// sagas/programa.js
import { call, put, takeLatest } from 'redux-saga/effects';
import { types } from '../reducers/programa';
import { onError } from '../libs/errorLib';
import * as Api from '../api';

const sagas = [
    takeLatest(types.GET_PROYECTOS_PROGRAMA_REQUEST, handleGetProyectosPrograma),
    takeLatest(types.GET_PROYECTOS_DISPONIBLES_REQUEST, handleGetProyectosDisponibles),
    takeLatest(types.ASIGNAR_PROYECTO_REQUEST, handleAsignarProyecto),
    takeLatest(types.DESASIGNAR_PROYECTO_REQUEST, handleDesasignarProyecto),
    takeLatest(types.GET_PROGRAMAS_LISTA_REQUEST, handleGetProgramasLista),
    takeLatest(types.GET_RESUMEN_AGREGADO_REQUEST, handleGetResumenAgregado),
];

function* handleGetProyectosPrograma({ programaId }) {
    try {
        const response = yield call(Api.getProyectosDelPrograma, programaId);
        const { success, data } = response.data;
        if (success) {
            yield put({ type: types.GET_PROYECTOS_PROGRAMA_SUCCESS, proyectosPrograma: data });
        } else {
            yield put({ type: types.GET_PROYECTOS_PROGRAMA_ERROR, error: 'Error al cargar proyectos del programa' });
        }
    } catch (e) {
        yield put({ type: types.GET_PROYECTOS_PROGRAMA_ERROR, error: e.message });
        onError(e);
    }
}

function* handleGetProyectosDisponibles({ programaId }) {
    try {
        const response = yield call(Api.getProyectosDisponiblesParaPrograma, programaId);
        const { success, data } = response.data;
        if (success) {
            yield put({ type: types.GET_PROYECTOS_DISPONIBLES_SUCCESS, proyectosDisponibles: data });
        } else {
            yield put({ type: types.GET_PROYECTOS_DISPONIBLES_ERROR, error: 'Error al cargar proyectos disponibles' });
        }
    } catch (e) {
        yield put({ type: types.GET_PROYECTOS_DISPONIBLES_ERROR, error: e.message });
        onError(e);
    }
}

function* handleAsignarProyecto({ programaId, proyectoId }) {
    try {
        const response = yield call(Api.asignarProyectoAPrograma, programaId, proyectoId);
        const { success, data } = response.data;
        if (success) {
            yield put({ type: types.ASIGNAR_PROYECTO_SUCCESS, proyecto: data });
        } else {
            yield put({ type: types.ASIGNAR_PROYECTO_ERROR, error: 'No se pudo asignar el proyecto' });
        }
    } catch (e) {
        yield put({ type: types.ASIGNAR_PROYECTO_ERROR, error: e.message });
        onError(e);
    }
}

function* handleDesasignarProyecto({ proyectoId, programaId }) {
    try {
        const response = yield call(Api.desasignarProyectoDePrograma, proyectoId);
        const { success, data } = response.data;
        if (success) {
            yield put({ type: types.DESASIGNAR_PROYECTO_SUCCESS, proyecto: data });
        } else {
            yield put({ type: types.DESASIGNAR_PROYECTO_ERROR, error: 'No se pudo desasignar el proyecto' });
        }
    } catch (e) {
        yield put({ type: types.DESASIGNAR_PROYECTO_ERROR, error: e.message });
        onError(e);
    }
}

function* handleGetProgramasLista() {
    try {
        const response = yield call(Api.getProgramasLista);
        const { success, data } = response.data;
        if (success) {
            yield put({ type: types.GET_PROGRAMAS_LISTA_SUCCESS, programasLista: data });
        } else {
            yield put({ type: types.GET_PROGRAMAS_LISTA_ERROR });
        }
    } catch (e) {
        yield put({ type: types.GET_PROGRAMAS_LISTA_ERROR });
        onError(e);
    }
}

function* handleGetResumenAgregado({ programaId }) {
    try {
        const response = yield call(Api.getResumenAgregadoPrograma, programaId);
        const { success, data } = response.data;
        if (success) {
            yield put({ type: types.GET_RESUMEN_AGREGADO_SUCCESS, resumenAgregado: data });
        } else {
            yield put({ type: types.GET_RESUMEN_AGREGADO_ERROR, error: 'Error al cargar resumen agregado' });
        }
    } catch (e) {
        yield put({ type: types.GET_RESUMEN_AGREGADO_ERROR, error: e.message });
        onError(e);
    }
}

export default sagas;