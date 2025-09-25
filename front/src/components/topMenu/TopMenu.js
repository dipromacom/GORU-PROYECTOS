/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import "../../css/Commons.css";
import "./TopMenu.css";
import Form from "react-bootstrap/Form";
import { connect } from "react-redux";
import { actions as sessionActions, selectors as sessionSelectors } from "../../reducers/session";
import { actions as routesActions} from "../../reducers/routes";
import { actions as personaActions, selectors as personaSelectors } from "../../reducers/persona";

function TopMenu({ dispatch, persona, user }) {
  const [txtBuscar, setTxtBuscar] = useState("");
  const [isProfileMenuClicked, setProfileMenuClicked] = useState(false);
  const [nombre, setNombre] = useState("Usuario");
  const [email, setEmail] = useState("Loading...");
  const divRef = useRef(null);


  useEffect(() => {
    function onLoad() {
      if (user !== null) {
        dispatch(personaActions.getProfile(user.id));
      }
    }

    onLoad();
  }, []);

  // cerrar menu flotante de perfil
  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setProfileMenuClicked(false);
    }
  };

  useEffect(() => {
    if (isProfileMenuClicked) {
      // Add the event listener when the div is visible
      document.addEventListener('click', handleClickOutside);
    } else {
      // Clean up the event listener
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isProfileMenuClicked]);

  useEffect(() => {
    function init() {
      if (persona != undefined && persona != null) {
        const { nombre, apellido } = persona;
        const nombreCompleto = capitalizeFirstLetter(nombre) + ' ' + capitalizeFirstLetter(apellido);
        if (nombreCompleto != "") {
          setNombre(nombreCompleto);
        }
      }

      const userEmail = user !== null 
                    ? user.username.length > 21 ? user.username.substring(0, 20) : user.username 
                    : '';
      setEmail(userEmail);
    }

    init();
  }, [persona, user]);

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function clickProfileMenu() {
    setProfileMenuClicked(!isProfileMenuClicked);
  };

  async function handleLogout() {
    dispatch(sessionActions.logout());
  }

  function handleEditProfile() {
    setProfileMenuClicked(false);
    dispatch(routesActions.goToProfile());
  }

  function handleMenuItemClick(page) {
    dispatch(routesActions.goTo(page));
  }



  return (
    <div className="top-menu">  
      <div className="float-left search-container">
        <div className="search-placeholder center">
          <Form className="search-form">
          <Form.Group controlId="email">
          <Form.Control
            placeholder="Buscar"
            className="search-input"
            autoFocus
            type="text"
            value={txtBuscar}
            onChange={e => setTxtBuscar(e.target.value)}
          />
          <img src={`/icons/Search-icon.svg`} alt="Buscar" className="search-icon"></img>
        </Form.Group>

        </Form>
        </div>
      </div>

      <div className="float-left menu-options-container">
        <div className="menu-placeholder center blue">
          <div className="float-left top-menu-item top-menu-text disabled">
            <p>Herramientas</p>
          </div>
          <div className="float-left top-menu-item top-menu-text" onClick={() => handleMenuItemClick("aboutUs")}>
            <p>Nosotros</p>
          </div>
          <div className="float-left top-menu-item">
            <img src={`/icons/Notificaciones.svg`} alt="Notificaciones"></img>
          </div>

          <div className="float-left top-menu-item">
          <button className="center menu-profile-button" onClick={clickProfileMenu}>
              <div className="float-left top-menu-text">
                <p>{nombre}</p>
              </div>

              <div className="float-left menu-margin">
                {/* <img src={`/img/persona.jpg`} alt="User Profile" className="menu-profile-image"></img> */}
                <img src={`/icons/profile-icon.svg`} alt="User Profile" className="menu-profile-image"></img>
              </div>

              <div className="float-left menu-margin">
                <img src={`/icons/Arrow-icon.svg`} alt="User Profile"></img>
              </div>
            </button>
              
            {
              isProfileMenuClicked &&
              <div ref={divRef} className="profile-container box-shadow blue">
              <div className="sub-item-container">
                <p className="user-name-text">{email}</p>
              </div>

              <div className="sub-item-container">
                <button type="button" className="btn btn-profile-menu blue-br btn-lg" onClick={handleEditProfile}>Mi Perfil</button>
              </div>

              <div className="sub-separator-container">
                <hr className="separator-menu"></hr>
              </div>

              <div className="sub-item-container">
                <p className="sub-item-text disabled">Administrar Usuarios</p>
              </div>

              <div className="sub-item-container disabled">
                <p className="sub-item-text disabled">Actualizar Plan</p>
              </div>

              <div className="sub-item-container">
                <p onClick={handleLogout} className="sub-item-text">Cerrar Sesion</p>
              </div>
            </div>
            }
              
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  persona: personaSelectors.getPersona(state),
  user: sessionSelectors.getUser(state),
});

export default connect(mapStateToProps)(TopMenu);