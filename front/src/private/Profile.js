/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "../css/Commons.css";
import "./Profile.css";
import Form from "react-bootstrap/Form";
import Alert from 'react-bootstrap/Alert';
import Col from "react-bootstrap/Col";
import LoaderButton from "../components/loaderButton/LoaderButton";
import { selectors as ciudadSelectors, actions as ciudadActions } from "../reducers/ciudad";
import { selectors as sessionSelectors } from "../reducers/session";
import { selectors as personaSelectors, actions as personaActions } from "../reducers/persona";
import { onError } from "../libs/errorLib";
import { connect } from "react-redux";
import TodoListForm from "../components/todoList/TodoListForm";

import CountrySelect from 'react-bootstrap-country-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-country-select/dist/react-bootstrap-country-select.css';

import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

function Profile({ dispatch, isLoading, ciudadList, usuario, persona, direccion, telefono, errorMessage }) {
  const [ pais, setPais ] = useState(null);
  const [ phone, setPhone ] = useState("");
  const [ nickname, setNickname] = useState("");
  const [ nombre, setNombre ] = useState("");
  const [ apellido, setApellido ] = useState("");
  const [ email, setEmail ] = useState(usuario === null ? "": usuario.username);
  const [ ciudad, setCiudad] = useState("");
  const [ empresa, setEmpresa] = useState("");
  const [ showAlert, setShowAlert ] = useState(false);
  const [ firstLoad, setFirstLoad ] = useState(true);
  const [showTodoListForm, setShowTodoListForm] = useState(false);

  useEffect(() => {
    function validateSuccess() {
      if (isLoading) { setShowAlert(false); }
      else {
        if (errorMessage !== null && !firstLoad) {
          setShowAlert(true);
        } 
        setFirstLoad(false);
      }
    }

    validateSuccess();
  }, [isLoading, errorMessage]);

  useEffect(() => {
    function clearMessage() {
      dispatch(personaActions.clearMessage());
    }

    clearMessage();
  }, []); 

  function handleSubmit(event) {
    event.preventDefault();
    const { alpha2: paisCode } = pais;
    const payload = { nombre, apellido, telefono: phone, empresa, nickname, direccion: { pais: paisCode, ciudad } };
    dispatch(personaActions.updateProfile(usuario.id, payload));
  }

  function handlePaisSelect(item) {
    try {
      setPais(item);
      if (item !== null)  {
        const { alpha2 }= item;
        dispatch(ciudadActions.getCiudadByPais(alpha2.toUpperCase()));
      }
    } catch(e) {
      onError(e);
    }
  }
  console.log({usuario});

  useEffect(() => {
    async function onLoad() {
        try {
          const usuarioId = (usuario === undefined || usuario === null ? "" : usuario.id);
          if (usuarioId !== "") {
            dispatch(personaActions.getProfile(usuario.id));
          }
        } catch(e) {
            onError(e);
        }
    }

    onLoad();
  }, [usuario]);

  useEffect(() => {
    async function onLoad() {
        try {
          // console.log(persona);
            setNombre(persona === undefined || persona === null ? "" : persona.nombre);
            setApellido(persona === undefined || persona === null ? "" : persona.apellido);
            setNickname(persona === undefined || persona === null ? "" : persona.nickname);
            setPhone(telefono.length === 0 ? "" : telefono[0].telefono);
            setEmpresa(persona?.empresa);

            const pais = direccion.length === 0 ? "" : direccion[0].Ciudad.pais;
            if (pais !== "") {
              setPais(pais.toLowerCase());
              dispatch(ciudadActions.getCiudadByPais(pais.toUpperCase()));
              setCiudad(direccion.length === 0 ? "" : direccion[0].Ciudad.id);
            }
        } catch(e) {
            onError(e);
        }
    }

    onLoad();
  }, [persona, direccion, telefono]);

  useEffect(() => {
    // Solo mostrar el TodoListForm si persona tiene datos
    console.log({persona});
    if (persona) {
      setShowTodoListForm(false);  // Mostrar el componente si hay datos
    }
  }, [persona]);

  function disabled() {
    return !(nombre && apellido && nickname && empresa && pais && ciudad);
  }

  return (
    <div className="page-container">
    <hr className="separator"/>
    <div className="profile-form">
      <h1 className="orange">Mi perfil</h1>
        
      <br/>
      {showAlert && 
        <Alert variant="warning" onClose={() => setShowAlert(false)} dismissible> 
          {errorMessage}
        </Alert>
      }
      <br/>
      <Form onSubmit={handleSubmit} className="blue">
        <Form.Row>
          <Form.Group as={Col} controlId="nickname">
            <Form.Label className="label">Nickname</Form.Label>
            <Form.Control 
              autoComplete="off"
              value={nickname}
              onChange={ e => setNickname(e.target.value) }

            />
          </Form.Group>

          <Form.Group as={Col}>
          
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col} controlId="nombre">
            <Form.Label className="label">Nombre</Form.Label>
            <Form.Control 
              autoComplete="off"
              value={nombre}
              onChange={ e => setNombre(e.target.value) }
            />
          </Form.Group>

          <Form.Group as={Col} controlId="apellido">
            <Form.Label className="label">Apellido</Form.Label>
            <Form.Control 
              autoComplete="off"
              value={apellido}
              onChange={ e => setApellido(e.target.value) }
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col} controlId="correo">
            <Form.Label className="label">Correo electrónico</Form.Label>
            <Form.Control 
              autoComplete="off"
              readOnly
              value={email}
              onChange={ e => setEmail(e.target.value) }
            />
          </Form.Group>

          <Form.Group as={Col} controlId="empresa">
            <Form.Label className="label">Empresa</Form.Label>
            <Form.Control 
              autoComplete="off"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col} controlId="pais">
            <Form.Label className="label">País</Form.Label>
            <CountrySelect
              value={pais}
              onChange={handlePaisSelect}
              placeholder="Pais de domicilio"
              matchNameFromStart={false}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="ciudad">
            <Form.Label className="label">Ciudad</Form.Label>
            <Form.Control 
              as="select" 
              value={ciudad}
              onChange={ e => setCiudad(e.target.value) }
            >
              {
                ciudadList && ciudadList.map((ciudad) => {
                  return (
                    <option
                      key={ciudad.id}
                      value={ciudad.id}
                    >
                      {ciudad.nombre}
                    </option>
                  )
                })
              }
            </Form.Control>
          </Form.Group>

          <Form.Group as={Col} controlId="telefono">
            <Form.Label className="label">Teléfono</Form.Label>
            <PhoneInput
              country={'ec'}
              value={phone}
              onChange={setPhone}
              enableSearch={false}
              masks={{ec: '...-...-...'}}
            />
          </Form.Group>
        </Form.Row>

        <LoaderButton
          type="submit"
          className="btn-success btn-save"
          isLoading={isLoading}
          disabled={disabled()}
        >
          Guardar cambios
        </LoaderButton>
      </Form>
    </div>
      
      {showTodoListForm && <TodoListForm persona={persona} />}
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: ciudadSelectors.getIsLoading(state),
  ciudadList: ciudadSelectors.getCiudadList(state),
  usuario: sessionSelectors.getUser(state),
  persona: personaSelectors.getPersona(state),
  direccion: personaSelectors.getDireccion(state),
  telefono: personaSelectors.getTelefono(state),
  errorMessage: personaSelectors.getErrorMessage(state),
});

export default connect(mapStateToProps)(Profile);