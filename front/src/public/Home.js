import React, { useState } from "react";
import "../css/Commons.css";
import "./Home.css";
import GoruLogo from '../img/Goru-logo.svg';
import ImgScreen from '../img/Img-promo-GORU@2x.png';
import Login from "./Login";
import SignUp from "./SignUp";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  function goToLogin() {
    setShowLogin(true);
    setShowSignUp(false);
  }

  function goToCreateUser() {
    setShowSignUp(true);
    setShowLogin(false);
  }


  return (
    <div className="Home container">
      <div className="header">

      <div className="left">
      <a href="/"><img src={GoruLogo} className="App-logo" alt="logo" /></a>
      </div>
      <div className="main"></div>
      <div className="right">
        <p className="header-text">Contacto</p>
      </div>
      
      </div>

      <div className="body clearfix">
        <div className="float-left center body-container-left clearfix">
          <div>
            <div className="float-left w-100 ">
            <p className="body-text blue">
            Gestionar un proyecto es <br/>
            más sencillo con <span className="green">GORU</span>
            </p>
            </div>

            { !showSignUp && !showLogin &&
              <div className="float-left w-100 ">
              <div className="float-left mr-3">
              <button type="button" className="btn btn-success btn-login" onClick={goToLogin}>Iniciar sesión</button>
              </div>

              <div className="float-left">
              <button type="button" className="btn btn-outline-success btn-signup green" onClick={goToCreateUser}>Crear una cuenta</button>
              </div>
              </div>
            }

            { showLogin && <Login /> }
            { showSignUp && <SignUp /> }

            <br /><br /><br /><br /><br /><br /><br />
            
          </div>
        </div>
        <div className="float-left body-container-right">
        <img src={ImgScreen} className="img-index" alt="logo"  />
        </div>
      </div>

      <div className="footer center">

      <div className="center w-70">
      <div className="footer-container-left blue">
      <div>
        <p className="footer-title">SOBRE GORU</p>
      </div>

      <div>
        <p className="footer-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
      </div>
      </div>

      <div className="footer-container-right">
        <div className="center mr-3">
          <button type="button" className="btn btn-grey blue-br btn-lg">Solicita un demo</button>
        </div>
      </div>
      </div>
      </div>

      </div>
  );
}