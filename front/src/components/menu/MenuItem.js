import React, { useState } from "react";
import { actions as routesActions } from "../../reducers/routes";
import { connect } from "react-redux";
import "./MenuItem.css";

function MenuItem({ dispatch, menuName, menuAlt, menuToolTip, redirectTo, disabled }) {
  const [isHover, setIsHovered] = useState(false);
  const defaultRedirect = "desktop";

  function toogleHover() {
    if (disabled) return;
    setIsHovered(!isHover);
  }

  function handleMenuItemClick() {
    if (disabled) return;
    const page = redirectTo !== undefined && redirectTo !== null ? redirectTo : defaultRedirect;
    dispatch(routesActions.goTo(page));
  }

  const itemClass = `menu-item center${disabled ? " menu-item-disabled" : ""}`;

  return (
    <div className="menu-container" onMouseEnter={toogleHover} onMouseLeave={toogleHover}>
      {
        !isHover ?
          <div className={itemClass} onClick={handleMenuItemClick}>
            <div>
              <img src={`/icons/${menuName}.svg`} alt={menuAlt}></img>
            </div>
          </div> :

          <div className={`menu-item${disabled ? " menu-item-disabled" : ""}`} onClick={handleMenuItemClick}>

            <div className="menu-hover-container"></div>
            <div className="menu-item center">
              <div>
                <img src={`/icons/${menuName}-hover.svg`} alt={menuAlt}></img>
              </div>
            </div>

            {menuToolTip &&
              <div className="tooltip-container">
                <div className="menu-tooltip orange-bg">
                  <p className="tooltip-text">
                    {menuToolTip}
                  </p>
                </div>
              </div>}
          </div>
      }
    </div>
  );
}

export default connect()(MenuItem);