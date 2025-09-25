import { call, put, take, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/batch";
import { types as opcionTypes } from "../reducers/opcion";
import { push } from "connected-react-router";
import { onError } from "../libs/errorLib";
import * as Api from "../api";

const sagas = [
  takeLatest(types.CREATE_BATCH_REQUEST, handleCreateBatch),
  takeLatest(types.USER_HAS_ACTIVE_BATCH_REQUEST, handleUserHasActiveBatch),
  takeLatest(types.START_BATCH_SETUP_REQUEST, handleStartBatchSetup),
  takeLatest(types.GET_BATCH_STATUS_REQUEST, handleGetBachStatus),
  takeLatest(types.UPDATE_BATCH_SETUP_REQUEST, handleUpdateBatchSetup),
  takeLatest(types.CLOSE_BATCH_REQUEST, handleCloseBatch),
  takeLatest(types.GET_CLOSED_BATCHES_REQUEST, handleGetClosedBatches),
  takeLatest(types.GET_BATCH_DETAILS_REQUEST, handleGetBatchDetails),
  takeLatest(types.GET_BATCH_BY_PROJECT_ID_REQUEST, handleGetBatchByProjectId)
];

function* handleCreateBatch({ nombre, descripcion, usuario }) {
  try {
    const payload = { nombre, descripcion, usuarioId: usuario };
    const response = yield call(Api.createBatch, payload);
    const { success } = response.data; 
    yield put({ type: types.CREATE_BATCH_SUCCESS, success });
    if (success) {
      yield put(push("/batch/setup"));
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.CREATE_BATCH_ERROR });
  }
}

function* handleUserHasActiveBatch({ usuario }) {
  try {
    const response = yield call(Api.userHasActiveBatch, usuario);
    const { data } = response.data;
    const { hasBatch, activeBatch, setupTerminado } = data;
    yield put({ type: types.USER_HAS_ACTIVE_BATCH_SUCCESS, hasBatch, activeBatch });
  } catch (e) {
    onError(e);
    yield put({ type: types.USER_HAS_ACTIVE_BATCH_ERROR });
  }
}

function* handleStartBatchSetup({ usuario, tipoEvaluacion }) {
  try {
    const response = yield call(Api.startBatchSetup, tipoEvaluacion, usuario);
    const { success, data: opcionList, isCustom } = response.data;
    if (success) {
      yield put({ type: opcionTypes.GET_OPCION_BY_TIPO_EVALUACION_SUCCESS, opcionList, isCustom });
      yield put({ type: types.START_BATCH_SETUP_SUCCESS });
    } else {
      yield put({ type: types.START_BATCH_SETUP_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.START_BATCH_SETUP_ERROR });
  }
}

function* handleGetBachStatus({ usuario }) {
  try {
    const response = yield call(Api.getBatchStatus, usuario);
    const { success, data } = response.data;
    if (success) {
      const { activeBatch: hasBatch, setupTerminado, evaluaciones, closedBatch } = data;
      yield put({ type: types.GET_BATCH_STATUS_SUCCESS, setupTerminado, hasBatch, evaluaciones, closedBatch });
      
      if (hasBatch) {
        if (setupTerminado) {
          yield put(push("/priorization"));
        } else {
          yield put(push("/batch/setup"));
        }  
      } else {
        yield put(push("/batch"));
        // yield put(push("/priorization/result"));
      }

    } else {
      yield put({ type: types.GET_BATCH_STATUS_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.GET_BATCH_STATUS_ERROR });
  }
}

function* handleUpdateBatchSetup({ usuario, tipoEvaluacionId }) {
  try {
    const response = yield call(Api.updateBatchSetup, usuario, tipoEvaluacionId);
    const { success, message } = response.data;
    if (success) {
      yield put({ type: types.UPDATE_BATCH_SETUP_SUCCESS });
      yield put(push("/priorization"));
    } else {
      yield put({ type: types.UPDATE_BATCH_SETUP_ERROR, message: message });
      // yield put(push("/desktop"));
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.UPDATE_BATCH_SETUP_ERROR });
  }
}

function* handleCloseBatch({ usuario }) {
  try {
    const response = yield call(Api.closeBatch, usuario);
    const { success } = response.data;
    if (success) {
      yield put({ type: types.CLOSE_BATCH_SUCCESS });
    } else {
      yield put({ type: types.CLOSE_BATCH_ERROR });
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.CLOSE_BATCH_ERROR });
  }
}

function* handleGetClosedBatches({ usuario }) {
  try {
    const response = yield call(Api.getClosedBatches, usuario);
    const { data: items } = response.data;
    yield put({ type: types.GET_CLOSED_BATCHES_SUCCESS, closedBatches: items });
  } catch(e) {
    onError(e);
    yield put({ type: types.GET_CLOSED_BATCHES_ERROR });
  }
}

function* handleGetBatchDetails({ batchId, usuarioId }) {
  try {
    const response = yield call(Api.getBatchDetails, batchId, usuarioId);
    const { success } = response.data;
    if (success) {
      let { data: details } = response.data;
      const { Evaluacion: evaluacionList } = details;
      delete details.Evaluacion;
      yield put({ type: types.GET_BATCH_DETAILS_SUCCESS, details, evaluacionList });
    } else {
      yield put({ type: types.GET_BATCH_DETAILS_ERROR });     
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.GET_BATCH_DETAILS_ERROR });
  }
}

function *handleGetBatchByProjectId({projectId}){
  try {
    const response = yield call(Api.getBatchByProjectId, projectId);
    const { success, data } = response.data;
    if (success) {
      yield put({ type: types.GET_BATCH_BY_PROJECT_ID_SUCCESS, batchParentProject: data });
    } else {
      yield put({ type: types.GET_BATCH_BY_PROJECT_ID_ERROR });     
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.GET_BATCH_BY_PROJECT_ID_ERROR });
  }
}

export default sagas;