import React, { useState, useRef } from 'react';
import { Button, InputGroup, ListGroup, Form, Row, Col, Modal } from 'react-bootstrap'; // 🔹 Añadido Modal
import "./InputTextList.css";

const InputAlcanceEjecutado = ({ alcanceEntregables, setAlcanceEntregables, editMode, ejecutado }) => {
    const [inputValue, setInputValue] = useState('');
    const [showCloseModal, setShowCloseModal] = useState(false); // 🔹 Nuevo
    const [selectedIndex, setSelectedIndex] = useState(null); // 🔹 Nuevo
    const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]); // 🔹 Nuevo

    const currentListNames = alcanceEntregables.map(item => item.nombre);

    const handleSubmit = () => {
        if (inputValue.trim() === '' || currentListNames.includes(inputValue.trim())) return;
        const newEntregable = {
            nombre: inputValue.trim(),
            completado: false,
            fecha_entregable: null,
            deadline: new Date().toISOString().split('T')[0]
        };
        setAlcanceEntregables([...alcanceEntregables, newEntregable]);
        setInputValue('');
    };

    // 🔹 Lógica del Modal (Simil Kanban)
    const handleCheckboxChange = (index) => {
        if (alcanceEntregables[index].completado) {
            // Si ya estaba completado, lo desmarcamos directamente
            const updated = alcanceEntregables.map((item, i) =>
                i === index ? { ...item, completado: false, fecha_entregable: null } : item
            );
            setAlcanceEntregables(updated);
        } else {
            // Si se va a cerrar, abrimos modal
            setSelectedIndex(index);
            setShowCloseModal(true);
        }
    };

    const confirmClose = () => {
        const updatedList = alcanceEntregables.map((item, i) => {
            if (i === selectedIndex) {
                return { ...item, completado: true, fecha_entregable: closingDate };
            }
            return item;
        });
        setAlcanceEntregables(updatedList);
        setShowCloseModal(false);
    };

    return (
        <div className="input-text-list">
            {editMode && (
                <InputGroup className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Nuevo Entregable"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Button onClick={handleSubmit} disabled={!inputValue.trim()}>Agregar</Button>
                </InputGroup>
            )}

            <div className="mt-2">
                <Row className="alcance-header fw-bold border-bottom pb-2 mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                    <Col xs={6}>ENTREGABLE</Col>
                    <Col xs={4} className="text-center">DEADLINE</Col>
                    <Col xs={2} className="text-center">FIN</Col>
                </Row>

                <ListGroup variant="flush">
                    {alcanceEntregables?.map((item, index) => (
                        <ListGroup.Item key={index} className="px-0 py-2 border-0">
                            <Row className="align-items-center">
                                <Col xs={6}>
                                    <span className="fw-bold" style={{ textDecoration: item.completado ? 'line-through' : 'none' }}>
                                        {item.nombre}
                                    </span>
                                </Col>
                                <Col xs={4}>
                                    <Form.Control
                                        type="date"
                                        size="sm"
                                        value={item.deadline ? item.deadline.split('T')[0] : ''}
                                        disabled={!editMode || ejecutado}
                                        onChange={(e) => {
                                            const updated = alcanceEntregables.map((a, i) => i === index ? { ...a, deadline: e.target.value } : a);
                                            setAlcanceEntregables(updated);
                                        }}
                                    />
                                </Col>
                                <Col xs={2} className="text-center">
                                    <Form.Check
                                        type="checkbox"
                                        checked={item.completado}
                                        disabled={!editMode || !ejecutado}
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>

            {/* 🔹 2. Modal de Cierre (Simil Kanban) */}
            <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Finalizar Entregable</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p>¿Fecha en que se completó: <strong>{alcanceEntregables[selectedIndex]?.nombre}</strong>?</p>
                    <Form.Control
                        type="date"
                        value={closingDate}
                        onChange={(e) => setClosingDate(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCloseModal(false)}>Cancelar</Button>
                    <Button variant="success" onClick={confirmClose}>Confirmar Cierre</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InputAlcanceEjecutado;