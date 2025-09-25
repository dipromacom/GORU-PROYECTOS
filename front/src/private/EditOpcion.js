import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { onError } from "../libs/errorLib";
import { actions as opcionActions, selectors as opcionSelectors } from "../reducers/opcionCustom";
import { selectors as sessionSelectors } from "../reducers/session";

import "../css/Commons.css";
import "./EditOpcion.css";
import LoaderButton from "../components/loaderButton/LoaderButton";

function EditOpcion({ dispatch, isLoading, opcion }) {
  const { id } = useParams();
  const [descripcion, setDescripcion] = useState("");
  const [orden, setOrden] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function validateForm() {
    return descripcion.length;
  }

  useEffect(() => {
    async function onLoad() {
      try {
        dispatch(opcionActions.getOpcion(id));
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  },[id]);

  useEffect(() => {
    async function onLoad() {
      if (opcion !== undefined && opcion !== null) {
        setDescripcion(opcion.descripcion);
        setOrden(opcion.orden);
        setPuntos(Number(opcion.puntos));
      }
    }

    onLoad();
  }, [opcion]);

  function handleSubmit(event) {
    try {
      event.preventDefault();
      dispatch(opcionActions.updateOpcion(id, descripcion, orden, puntos));
    } catch (e) {
      onError(e);
    }
  }

  function handleDisable(event) {
    try {
      event.preventDefault();
      dispatch(opcionActions.disableOpcion(id));
    } catch (e) {
      onError(e);
    }
  }

  return (
    <div className="page-container">
    <hr className="separator" />
    <div className="edit-opcion-form">
      <h1 className="orange">Batch - Editar Opción</h1>

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
          >
            Guardar
            </LoaderButton>

            <></>
            <LoaderButton
            className="btn-danger"
            onClick={handleShow}
          >
            Eliminar
            </LoaderButton>
        </div>
      </Form>
    </div>

    <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title className="modal-font">Goru</Modal.Title>
        
        </Modal.Header>
        <Modal.Body>
          Una vez eliminado la opción, no se podrá recuperar.
          <br /><br />
          ¿Desea continuar?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleDisable}>
            Eliminar
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        </Modal.Footer>
    </Modal>
    </div>
  );
}

const mapStateToProps = state => ({
  opcion: opcionSelectors.getOpcion(state),
  usuario: sessionSelectors.getUser(state),
})

export default connect(mapStateToProps)(EditOpcion);