import { useState, useEffect } from "react";
import { Dropdown, ButtonGroup, Form } from "react-bootstrap";

const InteresadosMultiSelect = ({ interesados = [], selectedIds = [], onChange }) => {
    const [selection, setSelection] = useState(selectedIds.map(String));

    useEffect(() => {
        setSelection(selectedIds.map(String));
    }, [selectedIds]);

    const toggle = (id) => {
        const idStr = String(id);
        let newSelection;
        if (selection.includes(idStr)) {
            newSelection = selection.filter((i) => i !== idStr);
        } else {
            newSelection = [...selection, idStr];
        }
        setSelection(newSelection);
        if (onChange) onChange(newSelection);
    };

    return (
        <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="outline-primary" size="sm">
                {selection.length > 0
                    ? `Interesados: ${selection
                        .map((id) => interesados.find((i) => String(i.id) === id)?.nombre_interesado)
                        .filter(Boolean)
                        .join(", ")}`
                    : "Agregar Interesados"}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ maxHeight: "200px", overflowY: "auto", padding: "10px" }}>
                {interesados.length === 0 && <div>No hay interesados</div>}
                {interesados.map((item) => (
                    <Form.Check
                        key={item.id}
                        type="checkbox"
                        id={`interesado-${item.id}`}
                        label={item.nombre_interesado}
                        checked={selection.includes(String(item.id))}
                        onChange={() => toggle(item.id)}
                        className="mb-1"
                        style={{ userSelect: "none" }}
                    />
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default InteresadosMultiSelect;