import React from "react";
import { Button, Row, Col } from "react-bootstrap";

const AddNewTaskInput = ({ onClick }) => {
  return (
    <Button
      variant="light"
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "row",
        padding: "8px",
        marginBottom: "8px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
        borderRadius: "0.25rem",
        cursor: "pointer",
        alignItems: "center",
        opacity: 0.8,
      }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.5)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.8)}
    >
      <i className="bi bi-plus" style={{ fontSize: "10px" }}></i>
      <span style={{ fontSize: "small", paddingLeft: "8px" }}>
        Agregar Tarea
      </span>
    </Button>
  );
};

export default AddNewTaskInput; 