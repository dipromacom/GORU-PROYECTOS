import React from "react";
import "../../css/Commons.css";
import "./Menu.css";
import MenuItem  from "./MenuItem";
import MenuLogo  from "./MenuLogo";

export default function Menu() {
  return (
    <div className="menu blue-bg">
      <div className="menu-header">
        <MenuLogo 
          menuName="Goru" 
          menuAlt="Goru"
          redirectTo="desktop"
        />

        <MenuItem 
          menuName="Inicio" 
          menuAlt="Inicio"
          menuToolTip="HOME"
          redirectTo="projects"
        />
      </div>

      <div className="menu-body">
        {/*<MenuItem 
          menuName="Portafolio" 
          menuAlt="Portafolio"
          menuToolTip="PORTAFOLIOS"
          redirectTo="portfolios"
        />*/}
        <MenuItem 
          menuName="Programa" 
          menuAlt="Programa"
          menuToolTip="PROGRAMAS"
          redirectTo="programs"
        />

        <MenuItem 
          menuName="Proyecto" 
          menuAlt="Proyecto"
          menuToolTip="PROYECTOS"
          redirectTo="projects"
        />
        <MenuItem
          menuName="Portafolio"
          menuAlt="Actividades"
          menuToolTip="ACTIVIDADES"
          redirectTo="activities"
        />

        <MenuItem 
          menuName="Instrumentos" 
          menuAlt="Instrumentos"
          menuToolTip="INSTRUMENTOS"
          redirectTo="tools"
        />
      </div>

      <div className="menu-footer">
        <MenuItem 
          menuName="Configuracion" 
          menuAlt="Configuracion"
          menuToolTip="CONFIGURACION"
        />
      </div>
    </div>
  );
}