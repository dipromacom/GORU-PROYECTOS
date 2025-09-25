import { call, put, take, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/opcionCustom";
import { push } from "connected-react-router";
import { onError } from "../libs/errorLib";
import * as Api from "../api";

const sagas = [
  takeLatest(types.GET_OPCION_REQUEST, handleGetOpcion),
  takeLatest(types.UPDATE_OPCION_REQUEST, handleUpdateOpcion),
  takeLatest(types.DISABLE_OPCION_REQUEST, handleDisableOpcion),
  takeLatest(types.ADD_OPCION_REQUEST, handleAddOpcion),
];

function* handleGetOpcion({ id }) {
  try {
    const response = yield call(Api.getOpcionCustom, id);
    const { success, data: opcion } = response.data;
    if (success) {
      yield put ({ type: types.GET_OPCION_SUCCESS, opcion });
    } else {
      yield put({ type: types.GET_OPCION_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.GET_OPCION_ERROR });
  }
}

function* handleUpdateOpcion({ id, descripcion, orden, puntos }) {
  try {
    const payload = { descripcion, orden, puntos };
    const response = yield call(Api.updateOpcionCustom, id, payload);
    const { success } = response.data;
    if (success) {
      yield put ({ type: types.UPDATE_OPCION_SUCCESS });
      yield put (push ('/batch/setup'));
    } else {
      yield put ({ type: types.UPDATE_OPCION_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.UPDATE_OPCION_ERROR });
  }
}

function* handleDisableOpcion({ id }) {
  try {
    const response = yield call(Api.disableOpcionCustom, id);
    const { success } = response.data;
    if (success) {
      yield put ({ type: types.DISABLE_OPCION_SUCCESS });
      yield put (push ('/batch/setup'));
    } else {
      yield put ({ type: types.DISABLE_OPCION_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.DISABLE_OPCION_ERROR });
  }
}

function* handleAddOpcion({ descripcion, puntos, orden, criterioId }) {
  try {
    const payload = { descripcion, puntos, orden, criterioId };
    const response = yield call(Api.addOpcionCustom, payload);
    const { success } = response.data;
    if (success) {
      yield put({ type: types.ADD_OPCION_SUCCESS });
      yield put (push ('/batch/setup'));
    } else {
      yield put({ type: types.ADD_OPCION_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.ADD_OPCION_ERROR });
  }
}

export default sagas;