/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Alert from 'react-bootstrap/Alert';
import "./Recover.css";
import LoaderButton from "../components/loaderButton/LoaderButton";
import { onError } from "../libs/errorLib";

import { connect } from "react-redux";
import { actions as routesActions } from "../reducers/routes";
import { actions as sessionActions, selectors as sessionSelectors } from "../reducers/session";

function SignUp({ dispatch, isAuthenticating, codeSent, errorMessage }) {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(null);
  const [invalidConfirm, setInvalidConfirm] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    function resetCode() {
      dispatch(sessionActions.resetCode());
    }

    resetCode();
  }, []);

  useEffect(() => {
    function validateSignUp() {
      if (isAuthenticating) { setShowAlert(false); }
      else {
        if (errorMessage !== undefined && errorMessage !== null && !firstLoad) {
          setShowAlert(true);
        }
        setFirstLoad(false);
      }
    }

    validateSignUp();
  }, [isAuthenticating, errorMessage]);

  function validateNewPasswordForm() {
    return (
      codigo.length > 0 &&
      password.length > 0 &&
      password === confirmPassword &&
      !invalidPassword && !invalidConfirm
    );
  }

  function validateEmailForm() {
    return (
      email.length > 0
    );
  }

  async function handleEmailCodeSubmit(event) {
    event.preventDefault();

    try {
      dispatch(sessionActions.sendCode(email));
    } catch(e) {
      onError(e);
    }
  }

  async function handleNewPasswordSubmit(event) {
    event.preventDefault();

    try {
      dispatch(sessionActions.recoverAccount(email, codigo, password));
    } catch(e) {
      onError(e);
    }
  }

  function handlePasswordValidation(event){
    const letterNumber = /\d/;
    const password = event.target.value;
    setPassword(password);

    if (password.length === 0) {
      setInvalidPassword(false);
    } else if (password.length < 8) {
      setInvalidPassword(true)
    } else if (password.length >= 8) {
      if(!password.match(letterNumber)) {
        setInvalidPassword(true);
      } else {
        setInvalidPassword(false);
      }
    }
  }

  function handleConfirmValidation(event) {
    const confirm = event.target.value;
    setConfirmPassword(confirm);
    if (confirm.length === 0) {
      setInvalidConfirm(false);
    } else if (confirm.length > 0) {
      if (confirm.localeCompare(password)===0) {
        setInvalidConfirm(false);
      } else {
        setInvalidConfirm(true);
      }
    }
  }

  function goToLogin() {
    dispatch(routesActions.goTo("login"));
  }

  function goToSignUp() {
    dispatch(routesActions.goTo("signUp"));
  }

  function renderEmailForm() {
    return (
      <div>

      <div className="mt-5">
        <p>Se enviará un código a su correo electrónico para validar su autenticidad</p>
      </div>
          <Form noValidate onSubmit={handleEmailCodeSubmit}>

          <Form.Group controlId="password" size="lg">
            <Form.Label>Email</Form.Label>
            <Form.Control 
              autoFocus
              autoComplete="off"
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Form.Group>
  
          <LoaderButton
            block
            size="lg"
            type="submit"
            /* variant="success" */
            isLoading={isAuthenticating}
            disabled={!validateEmailForm()}
          >
            Enviar código
          </LoaderButton>
  
          </Form>
          
          <div className="mt-4 d-flex justify-content-between">
            <p className="link blue" onClick={goToLogin}>
              Ir a Iniciar Sesión
            </p>

            <p className="link blue" onClick={goToSignUp}>
              Crear una cuenta
            </p>
          </div>
          
      </div>
    );
  }

  function renderNewPasswordForm() {
    return (
      <div className="mt-5">

      <div className="mt-5">
        <p>Ingrese el código enviado a su correo electrónico</p>
      </div>

          <Form noValidate onSubmit={handleNewPasswordSubmit}>

          <Form.Group controlId="password" size="lg">
            <Form.Label>Código</Form.Label>
            <Form.Control 
              autoFocus
              type="text"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
            />
          </Form.Group>
  
          <Form.Group controlId="password" size="lg">
            <Form.Label>Nueva Contraseña</Form.Label>
            <Form.Control 
              autoFocus
              type="password"
              value={password}
              isInvalid={invalidPassword}
              isValid={password.length && !invalidPassword}
              onChange={e => handlePasswordValidation(e)}
            />
          <Form.Control.Feedback type="invalid">La contraseña debe tener 8 caracteres y al menos 1 digito</Form.Control.Feedback>
          </Form.Group>
  
          <Form.Group controlId="confirmPassword" size="lg">
            <Form.Label>Confirmar Contraseña</Form.Label>
            <Form.Control 
              autoFocus
              type="password"
              value={confirmPassword}
              isInvalid={invalidConfirm}
              isValid={confirmPassword.length && !invalidConfirm}
              onChange={e => handleConfirmValidation(e)}
            />
          <Form.Control.Feedback type="invalid">Las contraseñas deben ser iguales</Form.Control.Feedback>
          </Form.Group>
  
          <LoaderButton
            block
            size="lg"
            type="submit"
            /* variant="success" */
            isLoading={isAuthenticating}
            disabled={!validateNewPasswordForm()}
          >
            Reestablecer contraseña
          </LoaderButton>
  
          </Form>
      </div>
    );
  }

  return (
    <div className="Recover">
      {showAlert && 
      <Alert variant="warning" onClose={() => setShowAlert(false)} dismissible> 
        {errorMessage}
      </Alert>
      }
      {codeSent === true ? renderNewPasswordForm() : renderEmailForm() }
    </div>
  );
}

const mapStateToProps = state => ({
  isAuthenticating: sessionSelectors.getIsAuthenticating(state),
  codeSent: sessionSelectors.getCodeSent(state),
  errorMessage: sessionSelectors.getErrorMessage(state),
});

export default connect(mapStateToProps)(SignUp);