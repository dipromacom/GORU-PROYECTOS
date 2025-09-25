import React from "react";
import { connect } from "react-redux";
import SubMenu from "../components/submenu/SubMenu";
import "../css/Commons.css";
import "./Portafolios.css";

function Portafolios() {

  return (
    <div className="page-menu-container">
    <SubMenu 
      title="Portafolios"
      newLabel="Nuevo Portafolio"
    />
    <br /><br /><br /><br />
    <div className="center">
    <p className="green">Ops!, no tiene permiso para acceder a está opción</p>
    </div>
    </div>

  );

}

export default connect()(Portafolios);
