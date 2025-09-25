import { put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/routes";
import { push } from "connected-react-router";

const sagas = [
  takeLatest(types.GO_TO_PROFILE, goToProfile),
  takeLatest(types.GO_TO, goTo),
];

export default sagas;

function* goToProfile() {
  yield put(push("/profile"));
}

function* goTo({ page }) {
  yield put(push(`/${page}`));
}