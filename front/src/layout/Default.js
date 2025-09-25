/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import "./Default.css";
import GoruLogo from '../img/Goru-logo.svg';
import ImgScreen from '../img/Img-promo-GORU@2x.png';
import { actions as routesActions } from "../reducers/routes";
import { Route } from "react-router-dom";
import { connect } from "react-redux";
import ContactPopup from "../components/contactPopup/ContactPopup";
import { selectors as sessionSelectors } from "../reducers/session";

function Default({ dispatch, component, isAuthenticated, ...props }) {

  useEffect(() => {
    function validateSession() {
      if (isAuthenticated) {
        dispatch(routesActions.goTo("membership"))
      }
    }

    validateSession();
  }, [isAuthenticated]);

  function goToLogin() {
    dispatch(routesActions.goTo("login"));
  }

  function goToCreateUser() {
    dispatch(routesActions.goTo("signUp"));
  }

  function goToHome() {
    dispatch(routesActions.goTo(""));
  }

    const getLayout = () => {
        const ParentContainer = component;

        return ( 
        <div className="Default">
          <div className="container">
          <div className="header">
    
          <div className="left">
          <img src={GoruLogo} className="logo" alt="logo" onClick={goToHome} />
          </div>
          <div className="main"></div>
          <div className="right">
          <ContactPopup>
          <p className="header-text link">Contacto</p>
          </ContactPopup> 

          </div>
          
          </div>
    
          <div className="body">
            <div className="float-left center-content body-container-left clearfix">
              <div>
                <div className="float-left w-100">
                <p className="body-text blue">
                Gestionar un proyecto es <br/>
                más sencillo con <span className="green">GORU</span>
                </p>
                </div>
    
                {(component === undefined || component === null) && 
                  <div className="float-left w-100 ">
                  <div className="float-left mr-3">
                  <button type="button" className="btn btn-success btn-login" onClick={goToLogin}>Iniciar sesión</button>
                  </div>
    
                  <div className="float-left">
                  <button type="button" className="btn btn-outline-success btn-signup green" onClick={goToCreateUser}>Crear una cuenta</button>
                  </div>
                  </div>
                }
    
                <div className="float-left w-100">
                {component !== undefined && component !== null && <ParentContainer />}
                </div>
    
              </div>
            </div>
            <div className="float-left body-container-right">
            <img src={ImgScreen} className="img-index" alt="logo"  />
            </div>
          </div>

          </div>
          <div className="footer float-left center">
    
          <div className="center w-70">
          <div className="footer-container-left blue">
          <div>
            <p className="footer-title">SOBRE GORU</p>
          </div>
    
          <div>
              <p className="footer-text">
                GORU es un software diseñado para la gestión de proyectos básicos, desarrollado por Grupo Gonzalez. Su objetivo es facilitar la planificación y el seguimiento de tareas de manera eficiente.
              </p>
          </div>
          </div>
    
          <div className="footer-container-right">
            <div className="center mr-3">
              <button type="button" className="btn btn-grey blue-br btn-lg">Solicita una demo</button>
            </div>
          </div>
          </div>
          </div>
    
          
        </div>
        );
    }

    return (
        <Route
                {...props}
                render={() => {
                    return <>{getLayout()}</>;
                }}
            />
    );
}

const mapStateToProps = state => ({
  isAuthenticated: sessionSelectors.getIsAuthenticated(state),
});

export default connect(mapStateToProps)(Default);