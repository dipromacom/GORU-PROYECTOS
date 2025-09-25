import React from "react";
import { connect } from "react-redux";
import SubMenuConfig from "../components/submenuConfig/SubMenuConfig";
import "../css/Commons.css";
import "./Config.css";

function Config({}) {

  return (
    <div className="page-menu-container">
    <SubMenuConfig 
      title="Configuración"
    />
    <br /><br /><br /><br />
    <div className="center">
    <p>Disponible próximamente</p>
    </div>
    </div>

  );

}

export default connect()(Config);
