import React from "react";
import { connect } from "react-redux";
import "./StaffCard.css";
import "../../css/Commons.css";

function StaffCard({ name, title, photo }) {
  return (
    <div className="card-container">
      <div className="photo-container">
        <div className="photo-border">
          <img src={`/img/${photo}`} alt="Staff Photo" className="photo"></img>
        </div>
      </div>
      <div className="titulo-container">
        <h4 className="blue">{name}</h4>
        <p className="blue">{title}</p>
      </div>
    </div>
  );
}

export default  connect()(StaffCard);