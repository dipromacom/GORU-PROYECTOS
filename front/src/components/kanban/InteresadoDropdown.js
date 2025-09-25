import { useState } from "react";
import { Dropdown, ButtonGroup } from "react-bootstrap";

const InteresadoDropdown = ({ interesados = [], task = {}, editTask }) => {
    const [interesadoId, setInteresadoId] = useState(task?.interesadoId || "");
    const [interesadoName, setInteresadoName] = useState(
        interesados.find(i => i.id === task?.interesadoId)?.nombre_interesado || ""
    );

    const handleSelect = (value) => {
        const [id, name] = value.split("|");
        setInteresadoId(id);
        setInteresadoName(name);

        // 🔹 actualizar en Redux
        if (editTask && task?.id) {
            editTask({
                id: task.id,
                content: task.content,
                priority: task.priority,
                interesadoId: id
            });
        }
    };

    return (
        <Dropdown as={ButtonGroup} onSelect={handleSelect}>
            <Dropdown.Toggle variant="outline-primary" size="sm">
                {interesadoName ? `Interesado: ${interesadoName}` : "Agregar Interesado"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {interesados.length === 0 ? (
                    <Dropdown.Item disabled>No hay interesados</Dropdown.Item>
                ) : (
                    interesados.map((item) => (
                        <Dropdown.Item key={item.id} eventKey={`${item.id}|${item.nombre_interesado}`}>
                            {item.nombre_interesado}
                        </Dropdown.Item>
                    ))
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default InteresadoDropdown;