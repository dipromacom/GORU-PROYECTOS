import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";
import { onError } from "../libs/errorLib";
import { actions as opcionActions, selectors as opcionSelectors } from "../reducers/opcionCustom";
import { selectors as sessionSelectors } from "../reducers/session";

import "../css/Commons.css";
import "./NewOpcion.css";
import LoaderButton from "../components/loaderButton/LoaderButton";

function EditOpcion({ dispatch, isLoading }) {
  const { id: criterioId } = useParams();
  const [descripcion, setDescripcion] = useState("");
  const [orden, setOrden] = useState(0);
  const [puntos, setPuntos] = useState(0);

  function validateForm() {
    return descripcion.length;
  }

  function handleSubmit(event) {
    try {
      event.preventDefault();
      dispatch(opcionActions.addOpcion(descripcion, orden, puntos, criterioId));
    } catch (e) {
      onError(e);
    }
  }

  return (
    <div className="page-container">
    <hr className="separator" />
    <div className="new-opcion-form">
      <h1 className="orange">Batch - Agregar Opción</h1>

      <br />
      <Form className="blue" onSubmit={handleSubmit}>
        <Form.Group controlId="nombre">
          <Form.Label>Opción</Form.Label>
          <Form.Control
            autoFocus
            autoComplete="off"
            type="text"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="puntaje">
            <Form.Label>Valor</Form.Label>
            <Form.Control 
              autoComplete="off"
              type="number"
              value={puntos}
              onChange={e => setPuntos(e.target.value)}
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
  isLoading: opcionSelectors.getIsLoading(state),
  usuario: sessionSelectors.getUser(state),
})

export default connect(mapStateToProps)(EditOpcion);