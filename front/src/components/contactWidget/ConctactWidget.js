import React from "react";
import { connect } from "react-redux";
import "./ContactWidget.css";
import "../../css/Commons.css";

function ContactWidget({ text, dispatch, ...props }) {
    return (
      <button className="custom-button" {...props}>
        <div className="contactanos-container">
        <p className="green contactanos-text">
        <img src="/icons/Contactanos.svg" alt={text} />&nbsp;{text}
        </p>
        </div>
      </button>
    );
}

export default connect()(ContactWidget);