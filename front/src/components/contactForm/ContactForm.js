import React, { useState, } from "react";
import { connect } from "react-redux";
import LoaderButton from "../loaderButton/LoaderButton";
import { actions as contactoActions, selectors as contactoSelectors } from "../../reducers/contacto";

import Form from "react-bootstrap/Form";
import "./ContactForm.css";
import "../../css/Commons.css";


function ContactForm({ dispatch, isLoading, onClick }) {
  const [email, setEmail] = useState("");
  const [motivo, setMotivo] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function enviarMail() {
    dispatch(contactoActions.sendMail(email, motivo, mensaje));
  }

  return (
      <div className="pop-modal">
        <button className="close grey" onClick={onClick}>
          &times;
        </button>
        
        <div className="header"> 
        <h1 className="orange">Contáctanos</h1>
        </div>

        <div className="content">
          <Form>
          <Form.Group controlId="mail">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control 
              autoComplete="none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="reason">
            <Form.Label>Mótivo del mensaje</Form.Label>
            <Form.Control 
              autoComplete="off"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="message">
            <Form.Label>Mensaje</Form.Label>
            <Form.Control 
              as="textarea" 
              className="text-multine"
              rows={3}
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
            />
          </Form.Group>
          </Form>
        </div>

        <div className="actions">
          <LoaderButton
            className="btn-success btn-send"
            onClick={() => {
              enviarMail();
            }
          }
          isLoading={isLoading}
          >
            Enviar
          </LoaderButton>
        </div>
      </div>
  );
}

const mapStateToProps = state => ({
  isLoading: contactoSelectors.getIsLoading(state),
});

export default connect(mapStateToProps)(ContactForm);