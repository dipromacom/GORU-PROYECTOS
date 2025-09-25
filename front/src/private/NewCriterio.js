import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";
import { onError } from "../libs/errorLib";
import { selectors as sessionSelectors } from "../reducers/session";
import { actions as criterioActions, selectors as criterioSelectors } from "../reducers/criterioCustom";
import LoaderButton from "../components/loaderButton/LoaderButton";

import "../css/Commons.css";
import "./NewCriterio.css";

function NewCriterio({ dispatch, isLoading, usuario }) {
  const [descripcion, setDescripcion] = useState("");
  const [orden, setOrden] = useState(0);
  const [pesoLimite, setPesoLimite] = useState(0);

  function validateForm() {
    return descripcion.length;
  }

  function handleSubmit(event) {
    try {
      event.preventDefault();
      dispatch(criterioActions.addCriterio(descripcion, orden, pesoLimite, usuario.id));
    } catch (e) {
      onError(e);
    }
  }

  return (
    <div className="page-container">
    <hr className="separator" />
    <div className="new-criterio-form">
      <h1 className="orange">Batch - Agregar Criterio</h1>

      <br />
      <Form className="blue" onSubmit={handleSubmit}>
        <Form.Group controlId="nombre">
          <Form.Label>Criterio</Form.Label>
          <Form.Control
            autoFocus
            autoComplete="off"
            type="text"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="puntaje">
            <Form.Label>Peso</Form.Label>
            <Form.Control 
              autoComplete="off"
              type="number"
              value={pesoLimite}
              onChange={e => setPesoLimite(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="orden">
            <Form.Label>Orden</Form.Label>
            <Form.Control 
              autoComplete="off"
              type="number"
              value={orden}
              onChange={e => setOrden(e.target.value)}
            />
          </Form.Group>
          
        <div className="button-group">
          <LoaderButton
            type="submit"
            disabled={!validateForm()}
            className="btn-success"
            isLoading={isLoading}
          >
            Guardar
            </LoaderButton>
        </div>
      </Form>
    </div>

    </div>
  );
}

const mapStateToProps = state => ({
  usuario: sessionSelectors.getUser(state),
  isLoading: criterioSelectors.getIsLoading(state),
})

export default connect(mapStateToProps)(NewCriterio);