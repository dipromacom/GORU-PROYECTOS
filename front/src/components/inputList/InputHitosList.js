import React from "react";
import { Form } from "react-bootstrap";
import InputTextListWithDate from "../inputList/InputTexListWithDate";

const InputHitosList = ({
    tiempoDuracion,
    setTiempoDuracion,
    tiempoFechasCriticas,
    setTiempoFechasCriticas,
    editMode,
    showDuration
}) => {
    return (
        <div>
            <h3>Tiempo / Plazo</h3>
            <Form.Group controlId="plazoProyecto">
                <Form.Label>Duración de Proyecto: {showDuration(tiempoDuracion)}</Form.Label>
                <Form.Control
                    disabled={!editMode}
                    autoFocus
                    autoComplete="off"
                    type="range"
                    value={tiempoDuracion}
                    onChange={e => setTiempoDuracion(e.target.value)}
                    min={1}
                    max={365 * 5}
                />
            </Form.Group>

            <Form.Group controlId="fechas-criticas">
                <Form.Label>Fechas Críticas</Form.Label>
                <InputTextListWithDate
                    disabled={!editMode}
                    list={tiempoFechasCriticas}
                    setList={setTiempoFechasCriticas}
                    duration={tiempoDuracion}
                />
            </Form.Group>
        </div>
    );
};

export default InputHitosList;