/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Alert from 'react-bootstrap/Alert';
import "./SignUp.css";
import LoaderButton from "../components/loaderButton/LoaderButton";
import { onError } from "../libs/errorLib";

import { connect } from "react-redux";
import { actions as routesActions } from "../reducers/routes";
import { actions as sessionActions, selectors as sessionSelectors } from "../reducers/session";

function SignUp({ dispatch, newUser, isAuthenticating, emailAvailable, errorMessage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode]= useState("");
  const [invalidEmail, setInvalidEmail] = useState(null);
  const [invalidPassword, setInvalidPassword] = useState(null);
  const [invalidConfirm, setInvalidConfirm] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [mensaje, setMensaje] = useState("");

  function validateForm() {
    return (
      email.length > 0 &&
      password.length > 0 &&
      password === confirmPassword &&
      !invalidEmail && !invalidPassword && !invalidConfirm
    );
  }

  function validateConfirmationForm() {
    return confirmationCode.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      dispatch(sessionActions.signUp(email, password));
    } catch(e) {
      onError(e);
    }
  }

  async function handleConfirmaionSubmit(event) {
    event.preventDefault();

    try {
      dispatch(sessionActions.confirmSignUp(email, confirmationCode));
      dispatch(sessionActions.login(email, password));
    } catch(e) {
      onError(e);
    }
  }

  function handleEmailValidation() {
    if (email.localeCompare("jsalame@technisys.com")===0) {
      setInvalidEmail(true); 
    } else {
      setInvalidEmail(false);
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (email.length) {
        dispatch(sessionActions.validateEmail(email));
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [email]);

  useEffect(() => {
    if (email.length) {
      setInvalidEmail(!emailAvailable);
    }
  }, [emailAvailable]);

  useEffect(() => {
    function validateLogin() {
      if (isAuthenticating) { setShowAlert(false); }
      else {
        if (errorMessage !== undefined && errorMessage !== null && !firstLoad) {
          let mensaje = errorMessage;
          setMensaje(mensaje);
          setShowAlert(true);
        }
        setFirstLoad(false);
      }
    }

    validateLogin();
  }, [isAuthenticating, errorMessage]);

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

  function renderConfirmationForm() {
    return (
      <Form onSubmit={handleConfirmaionSubmit}>
        <Form.Group controlId="confirmationCode" size="lg">
          <Form.Label>Código de confirmación</Form.Label>
          <Form.Control
            autoFocus
            type="tel"
            onChange={ e => setConfirmationCode(e.target.value) }
            value={confirmationCode}
          />
          <Form.Text muted>Revisa en tu correo el código de confirmación enviado.</Form.Text>
        </Form.Group>

        <LoaderButton
          block
          size="lg"
          type="submit"
          /* variant="success" */
          isLoading={isAuthenticating}
          disabled={!validateConfirmationForm()}
        >
          Verify
        </LoaderButton>
      </Form>
    );
  }

  function handleRecuperarLink() {
    dispatch(routesActions.goTo("recoverAccount"));
  }

  function goToLogin() {
    dispatch(routesActions.goTo("login"));
  }

  function renderForm() {
    return (
      <div>
        {showAlert && 
          <Alert variant="warning" onClose={() => setShowAlert(false)} dismissible> 
            {mensaje}
            { mensaje === 'Ya existe una cuenta con ese email. ' && 
              <Alert.Link href="#" onClick={() => handleRecuperarLink()}>Intente recuperar su contraseña.</Alert.Link>
            }
          </Alert>
        }

        <Form noValidate onSubmit={handleSubmit}>
        <Form.Group controlId="email" size="lg">
          <Form.Label>Email</Form.Label>
          <Form.Control 
            autoFocus
            type="email"
            autoComplete="off"
            value={email}
            isInvalid={invalidEmail}
            isValid={email.length && !invalidEmail}
            onChange={e => setEmail(e.target.value)}
          />
        <Form.Control.Feedback type="invalid">Este email no se encuentra disponible</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="password" size="lg">
          <Form.Label>Contraseña</Form.Label>
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
          disabled={!validateForm()}
        >
          Registrarme
        </LoaderButton>

        </Form>

        <div className="mt-4">
        <p className="link blue" onClick={goToLogin}>
          Ir a Iniciar Sesión
        </p>
        </div>

      </div>      
    );
  }

  return (
    <div className="Signup">
      {newUser === null ? renderForm() : renderConfirmationForm() }

    </div>
  );
}

const mapStateToProps = state => ({
  newUser: sessionSelectors.getAwsUser(state),
  isAuthenticating: sessionSelectors.getIsAuthenticating(state),
  emailAvailable: sessionSelectors.getEmailAvailable(state),
  errorMessage: sessionSelectors.getErrorMessage(state),
});

export default connect(mapStateToProps)(SignUp);