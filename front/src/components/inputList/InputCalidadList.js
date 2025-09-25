import React from "react";
import { Form } from "react-bootstrap";
import InputCriteriosInput from "./InputCriteriosInput";

const InputCalidadList = ({ calidadMetricas, setCalidadMetricas, costoEntregable, editMode }) => {
    if (!(costoEntregable?.length > 0)) return null;

    return (
        <div className="mt-4">
            <h3>Calidad / Requisitos Funcionales / Requisitos del Cliente</h3>
            <Form.Group controlId="metricas-criterios">
                <Form.Label>Métrica / Criterios de Aceptación</Form.Label>
                <InputCriteriosInput
                    disabled={!editMode}
                    criteriosList={calidadMetricas}
                    setCriterioList={setCalidadMetricas}
                />
            </Form.Group>
        </div>
    );
};

export default InputCalidadList;