import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/tipoProyecto";
import { onError } from "../libs/errorLib";
import { getTipoProyecto } from "../api";

const sagas = [
  takeLatest(types.GET_TIPO_PROYECTO_REQUEST, listTipoProyecto),
];

export default sagas;

function* listTipoProyecto() {
  try {
    const response = yield call(getTipoProyecto);
    const { data } = response.data;
    yield put({ type: types.GET_TIPO_PROYECTO_SUCCESS, tipoProyectoList: data });
  } catch(e) {
    onError(e);
    yield put({ type: types.GET_TIPO_PROYECTO_ERROR });
  }
}