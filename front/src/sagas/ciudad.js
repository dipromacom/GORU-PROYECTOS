import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/ciudad";
import { onError } from "../libs/errorLib";
import { getCiudadByPais } from "../api";

const sagas = [
  takeLatest(types.GET_CIUDAD_BY_PAIS_REQUEST, handleGetCiudadByPais),
];

export default sagas;

function* handleGetCiudadByPais({ pais }) {
  try {
    const response = yield call(getCiudadByPais, pais );
    const ciudadList  = response.data.data;
    yield put({ type: types.GET_CIUDAD_BY_PAIS_SUCCESS, ciudadList });
  } catch(e) {
    onError(e);
    yield put({ type: types.GET_CIUDAD_BY_PAIS_ERROR });
  }
}