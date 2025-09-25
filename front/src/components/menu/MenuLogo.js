import React from "react";
import { actions as routesActions } from "../../reducers/routes";
import { connect } from "react-redux";
import "./MenuItem.css";

function MenuLogo({ dispatch, menuName, menuAlt, redirectTo }) {
  const defaultRedirect = "desktop";

  function handleMenuItemClick() {
    const page = redirectTo !== undefined && redirectTo !== null ? redirectTo : defaultRedirect;
    dispatch(routesActions.goTo(page));
  }

  return (
    <div className="menu-container">
    <div className="menu-item center" onClick={handleMenuItemClick}>
          <div>
          <img src={`/icons/${menuName}.svg`} alt={menuAlt}></img>
          </div>
        </div>
    </div>
  );
}

export default connect()(MenuLogo);