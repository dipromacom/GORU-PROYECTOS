/* eslint-disable no-unused-vars */
import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/evaluacion";
import { push } from "connected-react-router";
import { onError } from "../libs/errorLib";
import * as Api from "../api";

const sagas = [
  takeLatest(types.SAVE_EVALUACION_REQUEST, handleSaveEvaluacion),
  takeLatest(types.GET_EVALUACION_RESULT_REQUEST, handleGetEvaluacionResult),
  takeLatest(types.GET_EVALUACION_RESULT_BY_BATCH_REQUEST, handleGetEvaluacionResultByBatch),
];

function* handleSaveEvaluacion({ usuarioId, opciones }) {
  try {
    const response = yield call(Api.saveEvaluacion, usuarioId, opciones);
    const { success, message } = response.data;
    if (success) {
      yield put ({ type: types.SAVE_EVALUACION_SUCCESS });
    } else {
      let defaultMessage = "Ocurrio un problema al guardar su evalución";
      const errorMessage = message != null ? message : defaultMessage;
      yield put({ type: types.SAVE_EVALUACION_ERROR, errorMessage });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.SAVE_EVALUACION_ERROR });
  }
}

function* handleGetEvaluacionResult({ usuarioId, tipoEvaluacionId }) {
  try {
    const response = yield call(Api.getEvaluacionResult, tipoEvaluacionId, usuarioId);
    const { success } = response.data;
    if (success) {
      const { evaluacionList } = response.data;
      yield put ({ type: types.GET_EVALUACION_RESULT_SUCCESS, evaluacionList });
    } else {
      yield put({ type: types.GET_EVALUACION_RESULT_ERROR });
    }
    
  } catch (e) {
    onError(e);
    yield put({ type: types.GET_EVALUACION_RESULT_ERROR });
  }
}

function* handleGetEvaluacionResultByBatch({ usuarioId, tipoEvaluacionId, batchId }) {
  try {
    const response = yield call(Api.getEvaluacionResultByBatch, tipoEvaluacionId, usuarioId, batchId);
    const { success, data } = response.data;
    if (success) {
      yield put ({ type: types.GET_EVALUACION_RESULT_BY_BATCH_SUCCESS, evaluacionList: data});
    } else {
      yield put({ type: types.GET_EVALUACION_RESULT_BY_BATCH_ERROR });
    }
    
  } catch (e) {
    onError(e);
    yield put({ type: types.GET_EVALUACION_RESULT_BY_BATCH_ERROR });
  }
}

export default sagas;