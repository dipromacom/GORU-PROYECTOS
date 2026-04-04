import React from "react";
import "./MembershipOption.css";

export default function MembershipOption({
  text,
  value,
  disabled,
  onClick,
  disabledLabel,
}) {
  function handleClick() {
    if (disabled) return;
    onClick(value);
  }

  return (
    <div className="float-left option">
      <button
        type="button"
        className="btn btn-membership"
        onClick={handleClick}
        disabled={disabled}
      >
        <div className="btn-membership-icon center">
          <img src={`/icons/membership/${value}${disabled ? `-disabled` : ``}.svg`} alt={text}></img>
        </div>
        <p className="blue">{text}</p>
      </button>
      {disabled && (
        <div className="soon-container orange-bg center">
          <p>{disabledLabel || "PRONTO"}</p>
        </div>
      )}
    </div>
  );
}