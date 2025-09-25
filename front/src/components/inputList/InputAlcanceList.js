import React from "react";
import { Form } from "react-bootstrap";
import InputTextList from "./InputTextList";

const InputAlcanceList = ({ alcanceEntregables, setAlcanceEntregables, editMode }) => {
    if (!(alcanceEntregables?.length > 0 || editMode)) return null;

    return (
        <div>
            <h3>Alcance del Proyecto</h3>
            <Form.Group controlId="principales-entregables">
                <Form.Label>Principales Entregables</Form.Label>
                <InputTextList
                    disabled={!editMode}
                    list={alcanceEntregables}
                    setList={setAlcanceEntregables}
                />
            </Form.Group>
        </div>
    );
};

export default InputAlcanceList;