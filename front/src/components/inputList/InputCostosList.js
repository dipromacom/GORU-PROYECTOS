import React from "react";
import { Form } from "react-bootstrap";
import InputCostToList from "./InputCostToList";

const InputCostosList = ({
    costoEntregable,
    setCostoEntregable,
    costoReservaContingencia,
    setCostoReservaContingencia,
    costoReservaGestion,
    setCostoReservaGestion,
    presupuesto,
    regexValidator,
    editMode
}) => {
    return (
        <div>
            <h3>Costos</h3>

            {costoEntregable?.length > 0 && (
                <Form.Group controlId="costo-entregables">
                    <Form.Label>Costos por Entregables</Form.Label>
                    <InputCostToList
                        disabled={!editMode}
                        costoList={costoEntregable}
                        setResultCostoList={setCostoEntregable}
                    />
                </Form.Group>
            )}

            <Form.Group controlId="reserva-contingencia">
                <Form.Label>Reserva / Contingencia</Form.Label>
                <Form.Control
                    disabled={!editMode}
                    autoFocus
                    autoComplete="off"
                    type="text"
                    value={costoReservaContingencia}
                    onChange={e =>
                        regexValidator(e, /^\d+(\.\d{0,2})?$/g, setCostoReservaContingencia)
                    }
                />
            </Form.Group>

            <Form.Group controlId="reserva-gestion">
                <Form.Label>Reserva de Gestión</Form.Label>
                <Form.Control
                    disabled={!editMode}
                    autoFocus
                    autoComplete="off"
                    type="text"
                    value={costoReservaGestion}
                    onChange={e =>
                        regexValidator(e, /^\d+(\.\d{0,2})?$/g, setCostoReservaGestion)
                    }
                />
            </Form.Group>

            <Form.Group controlId="presupuesto-total">
                <Form.Label>Presupuesto Total</Form.Label>
                <Form.Control disabled type="text" value={presupuesto} readOnly />
            </Form.Group>
        </div>
    );
};

export default InputCostosList;