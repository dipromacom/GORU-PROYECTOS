import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/contacto";
import { push } from "connected-react-router";
import { onError } from "../libs/errorLib";
import * as Api from "../api";

const sagas = [
  takeLatest(types.SEND_MAIL_REQUEST, handleSendMail),
];

function* handleSendMail({ email, motivo, mensaje }) {
  try {
    const payload = {
      mail: email,
      motivo,
      mensaje
    };

    yield call(Api.sendMail, payload);
    yield put({ type: types.SEND_MAIL_SUCCESS });
  } catch (e) {
    onError(e);
    yield put({ type: types.SEND_MAIL_ERROR });
  }
}

export default sagas;