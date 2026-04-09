import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/usuario";
import { types as sessionTypes } from "../reducers/session";
import { push } from "connected-react-router";
import { onError } from "../libs/errorLib";
import * as Api from "../api";
import {
  MEMBERSHIP_CORPORATIVO,
  MEMBERSHIP_DEMO,
  MEMBERSHIP_PROFESIONAL,
} from "../libs/planLicencia";

const sagas = [
  takeLatest(types.SET_MEMBRESIA_REQUEST, setMembresia),
];

function* setMembresia({ usuarioId, value }) {
  try {
    yield call(Api.setMembresia, { usuarioId });

    try {
      const res = yield call(Api.getUsuarioById, usuarioId);
      if (res.data?.success && res.data?.data) {
        const u = { ...res.data.data };
        delete u.clave;
        yield put({ type: sessionTypes.REFRESH_USER_SYSTEM, userSystem: u });
      }
    } catch (refreshErr) {
      onError(refreshErr);
    }

    yield put({ type: sessionTypes.SET_MEMBERSHIP_NAV_MODE, membershipNavMode: value });
    yield put({ type: types.SET_MEMBRESIA_SUCCESS });

    if (value === MEMBERSHIP_PROFESIONAL) {
      yield put(push("/projects"));
    }
    if (value === MEMBERSHIP_DEMO) {
      yield put(push("/activities"));
    }
    if (value === MEMBERSHIP_CORPORATIVO) {
      yield put(push("/programs"));
    }
  } catch (e) {
    onError(e);
    yield put({ type: types.SET_MEMBRESIA_ERROR });
  }
}

export default sagas;
