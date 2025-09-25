import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import "../css/Commons.css";
import "./Batch.css";
import Form from "react-bootstrap/Form";
import LoaderButton from "../components/loaderButton/LoaderButton";
import { selectors as batchSelectors, actions as batchActions } from "../reducers/batch";
import { selectors as sessionSelectors } from "../reducers/session";

function Batch({ dispatch, isLoading, usuario, created }) {
  const [ nombre, setNombre ] = useState("");
  const [ descripcion, setDescripcion ] = useState("");

  function validateForm() {
    return nombre.length > 0 && descripcion.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(batchActions.createBatch(nombre, descripcion, usuario.id));
  }

  function init() {
    dispatch(batchActions.init());
  }
  
  useEffect(() => {
    function creationResult() {
      if (created === false) {
        alert("No se pudo crear el batch");
      }
    }

    creationResult();
    return () => { init() };
  }, [created]);

  useEffect(() => {
    function validateActiveBatch() {
      if (usuario !== null) {
        dispatch(batchActions.getBatchStatus(usuario.id));
      }
    }
    
    validateActiveBatch();
  }, [usuario]);

  return (
    <div className="page-container">
      <hr className="separator" />
      <div className="batch-form">
        <h1 className="orange">Batch</h1>

        <br />
        <Form onSubmit={handleSubmit} className="blue">
          <Form.Group controlId="nombre">
            <Form.Label className="label">Nombre del Batch</Form.Label>
            <Form.Control
              autoFocus
              autoComplete="off"
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="nombre">
            <Form.Label className="label">Descripción del Batch</Form.Label>
            <Form.Control
              autoComplete="off"
              type="text"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />
          </Form.Group>

          <LoaderButton
            type="submit"
            className="btn-success btn-save"
            disabled={!validateForm()}
            isLoading={isLoading}
          >
            Guardar
          </LoaderButton>
        </Form>

      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: batchSelectors.getIsLoading(state),
  created: batchSelectors.getCreated(state),
  usuario: sessionSelectors.getUser(state),
});

export default connect(mapStateToProps)(Batch);