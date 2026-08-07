/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import "../../css/Commons.css";
import "./TopMenu.css";
import Form from "react-bootstrap/Form";
import { connect } from "react-redux";
import { actions as sessionActions, selectors as sessionSelectors } from "../../reducers/session";
import { actions as routesActions } from "../../reducers/routes";
import { actions as personaActions, selectors as personaSelectors } from "../../reducers/persona";
import GoogleAppsMenu from "../GoogleAppsMenu/GoogleAppsMenu";

function TopMenu({ dispatch, persona, user }) {
  const [txtBuscar, setTxtBuscar] = useState("");
  const [isProfileMenuClicked, setProfileMenuClicked] = useState(false);
  const [nombre, setNombre] = useState("Usuario");
  const [email, setEmail] = useState("Loading...");
  const [profilePhoto, setProfilePhoto] = useState(null);
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
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0); // 0ms de retraso es suficiente para diferir la ejecución

      return () => {
        clearTimeout(timer); // Limpia el timer si el componente se desmonta antes de que se ejecute
        document.removeEventListener('click', handleClickOutside);
      };

    } else {
      // Limpia el event listener
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      // Cleanup del unmount
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

      // Cargar foto de perfil desde localStorage
      if (user && user.id) {
        const saved = localStorage.getItem(`profilePhoto_${user.id}`);
        setProfilePhoto(saved || null);
      }
    }

    init();
  }, [persona, user]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (user && user.id && event.key === `profilePhoto_${user.id}`) {
        setProfilePhoto(event.newValue || null);
      }
    };
    const handlePhotoChange = () => {
      if (user && user.id) {
        setProfilePhoto(localStorage.getItem(`profilePhoto_${user.id}`) || null);
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('profilePhotoChange', handlePhotoChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('profilePhotoChange', handlePhotoChange);
    };
  }, [user]);

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
            <GoogleAppsMenu />
          </div>

          {/*<div className="float-left top-menu-item top-menu-text disabled">
            <p>Herramientas</p>
          </div>*/}
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
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="User Profile"
                    className="menu-profile-image"
                    style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #f4742b' }}
                  />
                ) : (
                  <img src={`/icons/profile-icon.svg`} alt="User Profile" className="menu-profile-image"></img>
                )}
              </div>

              <div className="float-left menu-margin">
                <img src={`/icons/Arrow-icon.svg`} alt="User Profile"></img>
              </div>
            </button>

            {
              isProfileMenuClicked &&
              <div ref={divRef} className="profile-container box-shadow blue">
                <div className="sub-item-container">
                  <p className="user-name-text" style={{ margin: 0, padding: '8px 0', fontSize: '0.75rem' }}>{email}</p>
                </div>

                <div className="sub-item-container">
                  <button type="button" className="btn btn-profile-menu blue-br btn-lg" onClick={handleEditProfile}>Mi Perfil</button>
                </div>

                {user && user.es_super_admin && (
                  <div className="sub-item-container">
                    <button
                      type="button"
                      className="btn btn-profile-menu blue-br btn-lg"
                      onClick={() => {
                        setProfileMenuClicked(false);
                        handleMenuItemClick("admin");
                      }}
                    >
                      Admin
                    </button>
                  </div>
                )}

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