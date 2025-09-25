import React from "react";
import { connect } from "react-redux";
import SubMenu from "../components/submenu/SubMenu";
import "../css/Commons.css";
import "./Programas.css";

function Programas({}) {

  return (
    <div className="page-menu-container">
    <SubMenu 
      title="Programas"
      newLabel="Nuevo Programa"
    />
    <br /><br /><br /><br />
    <div className="center">
    <p className="green">Ops!, no tiene permiso para acceder a está opción</p>
    </div>
    </div>
  );

}

export default connect()(Programas);
