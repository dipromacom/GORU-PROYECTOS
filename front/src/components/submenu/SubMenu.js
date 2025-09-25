import React from "react";
import { connect } from "react-redux";
import "../../css/Commons.css";
import "./SubMenu.css";

function SubMenu({ title, newLabel,total=0, newButtonAction, DashboardButtonAction }) {

  return (
    <div className="submenu-container">
    <div className="title-container">
      <h1 className="orange">{title}</h1>
    </div>

    <div className="widget-container">
      <div className="new-container float-left">
        <p className="green widget-label" 
        style={{ cursor: 'pointer' }}
        onClick={ newButtonAction }
        >
          <img src="/icons/submenu/new-icon.svg" 
          
          alt={newLabel} />&nbsp;{newLabel}
        </p>
      </div>

      <div className="vertical-separator float-left"/>

      <div className="dashboard-container float-left">
        <p className="green widget-label"
            style={{ cursor: 'pointer' }}
            onClick={DashboardButtonAction}
          >
          <img src="/icons/submenu/dashboard-icon.svg" alt="Dashboard" />&nbsp;Dashboard
        </p>
      </div>
    </div>

    <div className="total-container">
      <span className="total-label blue">
      Total: {total} {title}
      </span>
    </div>
    </div>
  );
}

export default connect()(SubMenu);