/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Alert from 'react-bootstrap/Alert';
import "./Login.css";
import LoaderButton from "../components/loaderButton/LoaderButton";
import { onError } from "../libs/errorLib";

import { connect } from "react-redux";
import { actions as sessionActions, selectors as sessionSelectors } from "../reducers/session";
import { actions as routeActions } from "../reducers/routes";

function Login({ dispatch, isAuthenticating, errorMessage }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    function validateLogin() {
      if (isAuthenticating) { setShowAlert(false); }
      else {
        if (errorMessage !== undefined && errorMessage !== null && !firstLoad) {
          setShowAlert(true);
        }
        setFirstLoad(false);
      }
    }

    validateLogin();
  }, [isAuthenticating, errorMessage]);

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      dispatch(sessionActions.login(email, password));
    } catch(e) {
      onError(e);
    }
  }

  function handleOlvidePassword() {
    dispatch(routeActions.goTo("recoverAccount"));
  }

  function handleCrearCuenta() {
    dispatch(routeActions.goTo("signUp"));
  }

  return (
    <div className="Login">

      <div className="mt-5">
      {showAlert && 
        <Alert variant="warning" onClose={() => setShowAlert(false)} dismissible> 
          {errorMessage}
        </Alert>
      }

      <Form onSubmit={handleSubmit}>
      <Form.Group size="lg" controlId="email">
        <Form.Label>Email</Form.Label>
        <Form.Control 
          autoFocus
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </Form.Group>

      <Form.Group size="lg" controlId="password">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password"
          value={password}
          autoComplete="on"
          onChange={e => setPassword(e.target.value)}
        />
      </Form.Group>

      <LoaderButton 
        block
        size="lg" 
        type="submit" 
        isLoading={isAuthenticating}
        disabled={!validateForm()}>
        Iniciar Sesión
      </LoaderButton>
      </Form>

      <div className="mt-4 d-flex justify-content-between">
        <p className="link blue" onClick={handleOlvidePassword}>
          Olvidé mi contraseña
        </p>

        <p className="link blue" onClick={handleCrearCuenta}>
          Crear una cuenta
        </p>
      </div>

      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  isAuthenticating: sessionSelectors.getIsAuthenticating(state),
  errorMessage: sessionSelectors.getErrorMessage(state),
});

export default connect(mapStateToProps)(Login);