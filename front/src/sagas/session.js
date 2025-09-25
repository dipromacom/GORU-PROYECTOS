import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/session";
import { Auth } from "aws-amplify";
import { push } from "connected-react-router";
import { onError } from "../libs/errorLib";
import { createUsuario, getToken, validateEmail } from "../api";

const sagas = [
  takeLatest(types.LOGIN_REQUEST, login),
  takeLatest(types.SIGN_UP_REQUEST, signUp),
  takeLatest(types.CONFIRM_SIGN_UP_REQUEST, confirmSignUp),
  takeLatest(types.LOGOUT_REQUEST, logOut),
  takeLatest(types.GET_CURRENT_SESSION_REQUEST, getCurrentSession),
  takeLatest(types.VALIDATE_EMAIL_REQUEST, handleValidateEmail),
  takeLatest(types.SEND_CODE_REQUEST, handleSendCode),
  takeLatest(types.RECOVER_ACCOUNT_REQUEST, handleRecoverAccount),
];

export default sagas;

function* login({ email, password }) {
  try {
    const awsResponse = yield call([Auth, 'signIn'], email, password);
    const { username } = awsResponse;
    
    const response = yield call(getToken, { email , clave: password, awsId: username });
    const { page, usuario, token } = response.data.data; 
    yield put({ type: types.LOGIN_SUCCESS, userAws: username, userSystem: usuario, jwtToken: token });
    yield put(push(page));
  } catch(e) {
    onError(e);
    let message = "Ocurrio un error al hacer login en su cuenta";
    if (e.message !== null) {
      if (e.message.localeCompare("Incorrect username or password.")===0) {
        message = "Email o contraseña incorrectos";
      } else if (e.message.localeCompare("Password attempts exceeded")===0) {
        message = "Intentos de acceso alcanzado, espero unos minutos"
      } 
    }
    yield put({ type: types.LOGIN_ERROR, errorMessage: message });
  }
}

function* handleValidateEmail({ email }) {
  try {
    const response = yield call(validateEmail, email);
    const { success, data } = response.data;
    if (success) {
      const { available } = data;
      yield put({ type: types.VALIDATE_EMAIL_SUCCESS, emailAvailable: available });
    } else {
      yield put({ type: types.VALIDATE_EMAIL_ERROR });
    }
  } catch(e) {
    yield put({ type: types.VALIDATE_EMAIL_ERROR });
  }
}

function* innerSignUp(email, password) {
  const userAws = yield call([Auth, 'signUp'], {
    username: email,
    password: password
  });

  return userAws;
}

function* innerCreateUsuario(email, password, awsId) {
  const response = yield call(createUsuario, { username: email, clave: password, awsId });
  return response;
}

function* signUp({ email, password }) {
  try {
    const userAws = yield* innerSignUp(email, password);
    const { userSub: awsId } = userAws;
    
    const response = yield* innerCreateUsuario(email, password, awsId);
    const { page, usuario } = response.data.data;

    yield put({ type: types.SIGN_UP_SUCCESS, userAws, userSystem: usuario });
    yield put(push(page));
  } catch(e) {
    onError(e);
    let message = "Ocurrio un error al crear su cuenta";
    if (e.message !== null) {
      if (e.message.localeCompare("An account with the given email already exists.")===0) {
        message = "Ya existe una cuenta con ese email. ";
      } else {
        message = e.message;
      }
    }
    yield put({ type: types.SIGN_UP_ERROR, errorMessage: message });
  }
}

function* confirmSignUp({ email, confirmationCode}) {
  try {
    yield call([Auth, 'confirmSignUp'], email, confirmationCode);
  } catch(e) { }
}

function* logOut() {
  try {
    yield call([Auth, 'signOut']);
    yield put({ type: types.LOGOUT_SUCCESS});
    yield put(push('/'));
  } catch(e) {
    yield put({ type: types.LOGOUT_ERROR});
  }

}

function* getCurrentSession() {
  try {
    yield call([Auth, 'currentSession']);
    yield put({ type: types.GET_CURRENT_SESSION_SUCCESS });
  } catch(e) {
    if (e !== 'No current user') {
      onError(e);
    }
  }
  yield put({ type: types.GET_CURRENT_SESSION_FINISH });

}

function* handleSendCode({ email }) {
  try {
    yield call([Auth, 'forgotPassword'], email);
    yield put({ type: types.SEND_CODE_SUCCESS});
  } catch (error) {
    onError(error);
    yield put({ type: types.SEND_CODE_ERROR });
  }
}

function* handleRecoverAccount({ email, code, password }) {
  try {
    yield call([Auth, 'forgotPasswordSubmit'], email, code, password);
    // const response = yield call(updatePassword, email, { clave: password });
    yield put({ type: types.RECOVER_ACCOUNT_SUCCESS});
    yield put(push("/login"));
  } catch (error) {
    onError(error);
    let message = "Ocurrio un error al crear su cuenta";
    if (error.message !== null) {
      if (error.message.localeCompare("Invalid verification code provided, please try again.")===0) {
        message = "El código no es correcto, ingreselo nuevamente";
      } else {
        message = error.message;
      }
    }
    
    yield put({ type: types.RECOVER_ACCOUNT_ERROR, errorMessage: message });
  }
}