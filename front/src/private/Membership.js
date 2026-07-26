import React, { useState, useEffect, useMemo } from "react";
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
import Alert from "react-bootstrap/Alert";
import {
  getAllowedMembershipValuesForUser,
  userHasTipoLicencia,
  MEMBERSHIP_CORPORATIVO,
  MEMBERSHIP_DEMO,
  MEMBERSHIP_PROFESIONAL,
} from "../libs/planLicencia";

const PLAN_BLOCKED_LABEL = "NO INCLUIDO";

function Membership({ dispatch, isLoading, user, persona }) {
  const [isMembershipSelected, setIsMembershipSelected] = useState(null);
  const [nombre, setNombre] = useState("");
  const [value, setValue] = useState("");

  const allowed = useMemo(() => getAllowedMembershipValuesForUser(user), [user]);
  const hasLicencia = userHasTipoLicencia(user);

  useEffect(() => {
    if (!user) return;
    if (value && !allowed.has(value)) {
      setValue("");
      setIsMembershipSelected(null);
    }
  }, [user, value, allowed]);

  useEffect(() => {
    function onLoad() {
      if (!(user === null || user === undefined)) {
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

  function handleOptionClick(v) {
    if (!allowed.has(v)) return;
    setIsMembershipSelected(v);
    setValue(v);
    if (hasLicencia) {
      try {
        dispatch(usuarioActions.setMembresia(user.id, v));
      } catch (e) {
        onError(e);
      }
    }
  }

  const selectionAllowed = value && allowed.has(value);

  function handleContinue() {
    try {
      if (!hasLicencia || !selectionAllowed) {
        return;
      }
      dispatch(usuarioActions.setMembresia(user.id, value));
    } catch (e) {
      onError(e);
    }
  }

  const continueDisabled = !hasLicencia || isMembershipSelected === null || !selectionAllowed || isLoading;

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
            Falta poco para comenzar en GORU Programas y Proyectos
          </p>
        </div>

        {!hasLicencia && (
          <Alert variant="warning" className="mx-3">
            Su cuenta no tiene un tipo de licencia asignado. No puede continuar hasta que un administrador
            asigne un plan en el sistema. Si cree que es un error, contacte a soporte.
          </Alert>
        )}

        <div className="membership-options center">
          <MembershipOption
            text="Proyectos Personales"
            value={MEMBERSHIP_DEMO}
            onClick={handleOptionClick}
            disabled={!allowed.has(MEMBERSHIP_DEMO)}
            disabledLabel={!allowed.has(MEMBERSHIP_DEMO) ? PLAN_BLOCKED_LABEL : undefined}
          />
          <MembershipOption
            text="Proyectos de Equipo"
            value={MEMBERSHIP_PROFESIONAL}
            onClick={handleOptionClick}
            disabled={!allowed.has(MEMBERSHIP_PROFESIONAL)}
            disabledLabel={!allowed.has(MEMBERSHIP_PROFESIONAL) ? PLAN_BLOCKED_LABEL : undefined}
          />
          <MembershipOption
            text="Programas Corporativos"
            value={MEMBERSHIP_CORPORATIVO}
            onClick={handleOptionClick}
            disabled={!allowed.has(MEMBERSHIP_CORPORATIVO)}
            disabledLabel={!allowed.has(MEMBERSHIP_CORPORATIVO) ? PLAN_BLOCKED_LABEL : undefined}
          />
        </div>

        <div className="continue-container center" style={{ display: "none" }}>
          <LoaderButton
            block
            type="submit"
            className="btn btn-success btn-continue"
            isLoading={isLoading}
            disabled={continueDisabled}
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
