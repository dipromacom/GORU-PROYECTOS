import React, { useState, useEffect } from "react";
import "../css/Commons.css";
import "./Nosotros.css";
import { connect } from "react-redux";

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import StaffCard from "../components/staffCard/StaffCard";
import ContactPopup from "../components/contactPopup/ContactPopup";
import ConctactWidget from "../components/contactWidget/ConctactWidget";

function Nosotros({ dipatch }) {

  const responsive = {
    largeDesktop: {
      breakpoint: { max: 3000, min: 1400 },
      items: 6,
      slidesToSlide: 1
    },
    mediumDesktop: {
      breakpoint: { max: 1400, min: 1200 },
      items: 4,
      slidesToSlide: 1
    },
    desktop: {
      breakpoint: { max: 1200, min: 920 },
      items: 3,
      slidesToSlide: 1
    },
    tablet: {
      breakpoint: { max: 920, min: 700 },
      items: 2,
      slidesToSlide: 1
    },
    mobile: {
      breakpoint: { max: 700, min: 0 },
      items: 1,
      slidesToSlide: 1
    }
  };

  return (
    <div className="page-container" id="popup-root">
    <hr className="separator" />
    <div className="nosotros-form">

      <div>
          <p style={{ "font-size": "2.5rem", "font-weight": "bold", "color": "#EB5E00" }}>¡Bienvenido!</p>
      </div>
      <ContactPopup>
      <ConctactWidget text="Contáctenos"/>
      </ContactPopup> 

      {/* <div className="intro-container">
        <p className="blue">
        Lorem ipsum is placeholder text commonly used in the graphic, print, 
        and publishing industries for previewing layouts and visual mockups.
        </p>
      </div> */}

      <div className="text-placeholder">
        <div >
            <p style={{ "font-size": "1.5rem", "font-weight": "bold" }}>
              Contamos con Softwares de desarrollo nacional que pueden ser personalizados a cada empresa, tales como:
          </p>
        </div>
      </div>   
        <div className="home-tools">
          <img src={`/img/GoruBancos.png`} alt="goruBancos"></img>
          <img src={`/img/GoruContable.png`} alt="GoruContable" ></img>
          <img src={`/img/GoruEmpresarial.png`} alt="GoruEmpresarial" ></img>
          <img src={`/img/GoruPagoProveedores.png`} alt="GoruPagoProveedores" ></img>
          <img src={`/img/GoruProfesionales.png`} alt="GoruProfesionales" ></img>
          <img src={`/img/GoruPuntoVenta.png`} alt="GoruPuntoVenta" ></img>
          <img src={`/img/GoruRecursosHumanos.png`} alt="GoruRecursosHumanos" ></img>
      </div>  
    </div>
    </div>
  );
}
export default connect()(Nosotros);

