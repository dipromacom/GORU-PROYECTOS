import { useState, useEffect } from "react";
import { Dropdown, ButtonGroup, Form, Badge } from "react-bootstrap";

/**
 * Componente para seleccionar integrantes (usuarios asignados) del proyecto.
 * @param {Array} integrantes - Lista de usuarios asignados al proyecto [{ usuario_id, Usuario: { id, username, Persona: { nombre, apellido } }, RolProyecto: { nombre } }]
 * @param {Array} selectedIds - IDs de usuarios seleccionados
 * @param {Function} onChange - Callback con array de IDs de usuarios seleccionados
 */
const IntegrantesMultiSelect = ({ integrantes = [], selectedIds = [], onChange }) => {
    const [selection, setSelection] = useState((selectedIds || []).map(String));

    useEffect(() => {
        setSelection((selectedIds || []).map(String));
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

    // Helper para obtener nombre del usuario asignado
    const getNombreUsuario = (item) => {
        const u = item.Usuario || item;
        const p = u.Persona;
        if (p && (p.nombre || p.apellido)) {
            return `${p.nombre || ''} ${p.apellido || ''}`.trim();
        }
        return u.username || `Usuario #${item.usuario_id || item.id}`;
    };

    const getRolNombre = (item) => {
        return item.RolProyecto?.nombre || '';
    };

    const selectedLabels = selection
        .map((uid) => {
            const found = integrantes.find((i) => String(i.usuario_id || i.id || i.Usuario?.id) === uid);
            return found ? getNombreUsuario(found) : null;
        })
        .filter(Boolean);

    return (
        <Dropdown as={ButtonGroup} className="w-100">
            <Dropdown.Toggle
                variant="outline-primary"
                size="sm"
                className="text-start d-flex justify-content-between align-items-center w-100"
                style={{ whiteSpace: 'normal', minHeight: '38px' }}
            >
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <i className="bi bi-people-fill me-2" />
                    {selectedLabels.length > 0
                        ? `Asignados (${selectedLabels.length}): ${selectedLabels.join(", ")}`
                        : "Seleccionar integrantes..."}
                </div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100 shadow-sm" style={{ maxHeight: "240px", overflowY: "auto", padding: "10px" }}>
                {(!integrantes || integrantes.length === 0) ? (
                    <div className="text-muted small p-2">
                        <i className="bi bi-info-circle me-1" />
                        No hay integrantes asignados a este proyecto.
                    </div>
                ) : (
                    integrantes.map((item) => {
                        const uid = String(item.usuario_id || item.id || item.Usuario?.id);
                        const nombre = getNombreUsuario(item);
                        const rol = getRolNombre(item);
                        const isChecked = selection.includes(uid);

                        return (
                            <div
                                key={uid}
                                className={`d-flex align-items-center justify-content-between p-2 rounded ${isChecked ? 'bg-light' : ''}`}
                                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                onClick={() => toggle(uid)}
                            >
                                <Form.Check
                                    type="checkbox"
                                    id={`integrante-${uid}`}
                                    checked={isChecked}
                                    onChange={() => { }} // Handled by container click
                                    label={
                                        <span style={{ fontWeight: isChecked ? 600 : 400, fontSize: '0.9rem' }}>
                                            {nombre}
                                        </span>
                                    }
                                    className="mb-0 user-select-none"
                                    style={{ pointerEvents: 'none' }}
                                />
                                {rol && (
                                    <Badge bg="secondary" className="ms-2" style={{ fontSize: '0.75rem' }}>
                                        {rol}
                                    </Badge>
                                )}
                            </div>
                        );
                    })
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default IntegrantesMultiSelect;
