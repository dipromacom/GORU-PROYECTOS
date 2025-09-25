import React, { useState, useEffect } from "react";
import "./Membership.css";
import GoruLogo from '../img/Goru-logo.svg';
import { actions as usuarioActions, selectors as usuarioSelectors } from "../reducers/usuario";
import { selectors as sessionSelectors } from "../reducers/session";
import LoaderButton from "../components/loaderButton/LoaderButton";
import { onError } from "../libs/errorLib";
import { connect } from "react-redux";
import MembershipOption from "../components/membershipOption/MembershipOption";
import ContactPopup from "../components/contactPopup/ContactPopup";
import { actions as personaActions, selectors as personaSelectors } from "../reducers/persona";
import { actions as routeActions } from "../reducers/routes";

function Membership({ dispatch, isLoading, user, persona }) {
  const [isMembershipSelected, setIsMembershipSelected] = useState(null);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    function onLoad() {
      if (user !== null) {
        dispatch(personaActions.getProfile(user.id));
      }
    }

    onLoad();
  }, []);

  useEffect(() => {
    function validatePersona() {
      if (persona != undefined && persona != null) {
        setNombre(persona.nombre);
      }
    }

    validatePersona();
  }, [persona]);

  function handleOptionClick(value) {
    setIsMembershipSelected(value);
  }
  
  function handleContinue() {
    try {
      // dispatch(routeActions.goTo("desktop"))
      dispatch(usuarioActions.setMembresia(user.id));
    } catch (e) {
      onError(e);
    }
  }

  return (
    <div className="Membership container">
    <div className="header">
    <div>
      <img src={GoruLogo} className="App-logo" alt="logo" />
      </div>
    </div>

    <div className="body">
    <div className="body-header blue">
      {!isLoading &&
        <h1>
        ¡Bienvenid@ {nombre}
        </h1>
      }
      <p>
        Falta poco para comenzar en GORU Portfalolio y Proyectos
      </p>
    </div>

    <div className="membership-options center">
      <MembershipOption
        text="Gestión de Actividades"
        value="Demo"
        onClick={handleOptionClick}
      />
      <MembershipOption
        text="Gestión de Proyectos"
        value="Profesional"
        disabled
        onClick={handleOptionClick}
      />
      <MembershipOption
        text="Gestión Corporativa"
        value="Corporativo"
        disabled
        onClick={handleOptionClick}
      />
    </div>

    <div className="continue-container center">
      <LoaderButton 
        block
        type="submit" 
        className="btn btn-success btn-continue"
        isLoading={isLoading}
        disabled={isMembershipSelected === null}
        onClick={handleContinue}
      >
        Continuar
      </LoaderButton>
    </div>
    </div>

    
    <div className="footer center blue">
    <div className="w-70">
    <div className="float-left">
      <p className="footer-text">
        <strong>GORU</strong> Gestión de Portafolio y Proyectos © 2021
    </p>
    </div>
    <div className="float-right">
      <ContactPopup>
      <p className="footer-text-link">Contacto</p>
      </ContactPopup> 
    </div>
    </div>

    </div>
  </div>
  );
}

const mapStateToProps = state => ({
  isLoading: usuarioSelectors.getIsLoading(state),
  user: sessionSelectors.getUser(state),
  persona: personaSelectors.getPersona(state),
});

export default connect(mapStateToProps)(Membership);