import { call, put, take, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/criterioCustom";
import { push } from "connected-react-router";
import { onError } from "../libs/errorLib";
import * as Api from "../api";

const tipoEvaluacionId = 1;

const sagas = [
  takeLatest(types.GET_CRITERIO_REQUEST, handleGetCriterio),
  takeLatest(types.UPDATE_CRITERIO_REQUEST, handleUpdateCriterio),
  takeLatest(types.DISABLE_CRITERIO_REQUEST, handleDisableCriterio),
  takeLatest(types.ADD_CRITERIO_REQUEST, handleAddCriterio),
];

function* handleGetCriterio({ id }) {
  try {
    const response = yield call(Api.getCriterioCustom, id);
    const { success, data: criterio } = response.data;
    if (success) {
      yield put ({ type: types.GET_CRITERIO_SUCCESS, criterio });
    } else {
      yield put({ type: types.GET_CRITERIO_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.GET_CRITERIO_ERROR });
  }
}

function* handleUpdateCriterio({ id, descripcion, orden, pesoLimite }) {
  try {
    const payload = { descripcion, orden, peso_limite: pesoLimite };
    const response = yield call(Api.updateCriterioCustom, id, payload);
    const { success } = response.data;
    if (success) {
      yield put ({ type: types.UPDATE_CRITERIO_SUCCESS });
      yield put (push ('/batch/setup'));
    } else {
      yield put ({ type: types.UPDATE_CRITERIO_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.UPDATE_CRITERIO_ERROR });
  }
}

function* handleDisableCriterio({ id }) {
  try {
    const response = yield call(Api.disableCriterioCustom, id);
    const { success } = response.data;
    if (success) {
      yield put ({ type: types.DISABLE_CRITERIO_SUCCESS });
      yield put (push ('/batch/setup'));
    } else {
      yield put ({ type: types.DISABLE_CRITERIO_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.DISABLE_CRITERIO_ERROR });
  }
}

function* handleAddCriterio({ descripcion, pesoLimite, orden, usuario }) {
  try {
    const payload = { descripcion, pesoLimite, orden, usuarioId: usuario, tipoEvaluacionId };
    const response = yield call(Api.addCriterioCustom, payload);
    const { success } = response.data;
    if (success) {
      yield put ({ type: types.ADD_CRITERIO_SUCCESS });
      yield put (push ('/batch/setup'));
    } else {
      yield put({ type: types.ADD_CRITERIO_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.ADD_CRITERIO_ERROR });
  }
}



export default sagas;