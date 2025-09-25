import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/opcion";
import { onError } from "../libs/errorLib";
import { getOpcionesByTipoEvaluacion } from "../api";

const sagas = [
  takeLatest(types.GET_OPCION_BY_TIPO_EVALUACION_REQUEST, handleGetOpcionByTipoEvaluacion),
];

export default sagas;

function* handleGetOpcionByTipoEvaluacion({ tipoEvaluacion, usuario }) {
  try {
    const response = yield call(getOpcionesByTipoEvaluacion, tipoEvaluacion, usuario);
    const { data: opcionList, isCustom } = response.data;
    yield put({ type: types.GET_OPCION_BY_TIPO_EVALUACION_SUCCESS, opcionList, isCustom });
  } catch (e) {
    onError(e);
    yield put({ type: types.GET_OPCION_BY_TIPO_EVALUACION_ERROR });
  }
}