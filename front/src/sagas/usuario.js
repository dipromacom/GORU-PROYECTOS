import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/usuario";
import { push } from "connected-react-router";
import { onError } from "../libs/errorLib";
import * as Api from "../api";

const sagas = [
  takeLatest(types.SET_MEMBRESIA_REQUEST, setMembresia),
];

function* setMembresia({ usuarioId }) {
  try {
    yield call(Api.setMembresia, { usuarioId })
    yield put({ type: types.SET_MEMBRESIA_SUCCESS});
    yield put(push("/projects"));
  } catch (e) {
    onError(e);
    yield put({ type: types.SET_MEMBRESIA_ERROR });
  }
}

export default sagas;