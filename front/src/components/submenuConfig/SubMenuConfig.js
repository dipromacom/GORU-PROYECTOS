import React from "react";
import { connect } from "react-redux";
import "../../css/Commons.css";
import "./SubMenuConfig.css";

function SubMenuContainer({ title }) {

  return (
    <div className="submenuConfig-container">
    <div className="title-container">
      <h1 className="orange">{title}</h1>
    </div>

    <div className="options-container blue">
      <div className="option-title center active"><span>General</span></div>
      <div className="option-title center"><span>Seguridad</span></div>
      <div className="option-title center"><span>Repositorios</span></div>
    </div>
    </div>
  );
}

export default connect()(SubMenuContainer);