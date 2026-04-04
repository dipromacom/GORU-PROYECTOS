import React from "react";
import "../../css/Commons.css";
import "./Menu.css";
import MenuItem from "./MenuItem";
import MenuLogo from "./MenuLogo";

/**
 * Programa / Proyecto / Actividades no usan disabled: la restricción se muestra
 * en la vista de listado (Proyectos.js) con el texto "Ops!, no tiene permiso...".
 */
export default function Menu() {
  return (
    <div className="menu blue-bg">
      <div className="menu-header">
        <MenuLogo
          menuName="Goru"
          menuAlt="Goru"
          redirectTo="home"
        />

        <MenuItem
          menuName="Inicio"
          menuAlt="Inicio"
          menuToolTip="HOME"
          redirectTo="membership"
        />
      </div>

      <div className="menu-body">
        <MenuItem
          menuName="Programa"
          menuAlt="Programa"
          menuToolTip="PROGRAMAS"
          redirectTo="programs"
        />

        <MenuItem
          menuName="Proyecto"
          menuAlt="Proyecto"
          menuToolTip="PROYECTOS EQUIPO"
          redirectTo="projects"
        />
        <MenuItem
          menuName="Portafolio"
          menuAlt="Actividades"
          menuToolTip="PROYECTOS PERSONALES"
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
