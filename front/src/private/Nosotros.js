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
      <h1 className="orange">Nosotros</h1>

      <div className="subtitle-container">
        <h2 className="blue">Sobre GORU</h2>
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
        <div className="text-container">
          <p className="blue">
          Nuestra misión: Brindar a nuestros clientes sevicios de alta calidad enfocados a los 
          lineamientos estándar de la gestión de proyectos como: capacitaciones, asesorías, 
          certificaciones e implementación de Software. Para lo cual contamos con personal 
          capacitado y tecnología de última generación, alineadas a normas internacionales; 
          estando en constante innovación para proporcionar valor a las empresas y ejecutivos.
          </p>
        </div>

        <div className="text-container">
          <p className="blue">
          Nustra visión: Consolidarnos como una empresa líder en brindar servicios de excelencia
          profesional con respecto a la gestión de proyectos desde capacitaciones hasta 
          implementaciones de software. Los cuales están enfocados a las necesidades de nuestros 
          clientes y con las nuevas tecnologías, para brindarles servicios eficientes, eficaces e 
          innovadores.
          </p>
        </div>
      </div>

      <div className="staff-container">
        <h1 className="orange">Staff</h1>
      </div>  
  
      <Carousel
        responsive={responsive}
      >
        <StaffCard
          title="Gerente General"
          photo="Gerente_General.jpeg"
        />

        <StaffCard
          title="Master en Administración de Empresas"
          photo="JoseLuis.jpeg"
        />

        <StaffCard
          title="Master en Administración de Empresas"
          photo="LuisGonzalez.jpeg"
        />

        <StaffCard
          title="Master en Administración de Empresas"
          photo="GenesisRuiz.jpeg"
        />

        {/* <StaffCard
          title="Master en Administración de Empresas"
          photo="persona.jpg"
        />

        <StaffCard
          title="Master en Administración de Empresas"
          photo="persona.jpg"
        />   

        <StaffCard
          title="Master en Ciencia de Datos"
          photo="persona.jpg"
        />      */}
      </Carousel>
      
    </div>
    </div>
  );
}
export default connect()(Nosotros);