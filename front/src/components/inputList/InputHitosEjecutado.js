import React, { useState } from 'react';
import { ListGroup, Form, Row, Col, Modal, Button, Badge } from 'react-bootstrap';
import moment from 'moment';
import 'moment/locale/es';

const InputHitosEjecutado = ({ tiempoFechasCriticas, setTiempoFechasCriticas, editMode, ejecutado, cerrado }) => {
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);

    const handleCheckboxChange = (index) => {
        if (tiempoFechasCriticas[index].completado) {
            // Si ya estaba completado, lo desmarcamos
            const updated = tiempoFechasCriticas.map((item, i) =>
                i === index ? { ...item, completado: false, fecha_hito: null } : item
            );
            setTiempoFechasCriticas(updated);
        } else {
            // Si se va a cerrar, abrimos modal
            setSelectedIndex(index);
            setClosingDate(new Date().toISOString().split('T')[0]);
            setShowCloseModal(true);
        }
    };

    const confirmClose = () => {
        const updatedList = tiempoFechasCriticas.map((item, i) => {
            if (i === selectedIndex) {
                return { ...item, completado: true, fecha_hito: closingDate };
            }
            return item;
        });
        setTiempoFechasCriticas(updatedList);
        setShowCloseModal(false);
    };

    const deleteItemHandle = (index) => {
        setTiempoFechasCriticas(tiempoFechasCriticas.filter((item, i) => i !== index));
    };

    return (
        <div className="input-hitos-ejecutado mt-3">
            <div className={tiempoFechasCriticas?.length > 0 ? "mt-2" : ""}>
                <Row className="alcance-header fw-bold border-bottom pb-2 mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                    <Col xs={6}>HITO / FECHA PROGRAMADA</Col>
                    <Col xs={4} className="text-center">CIERRE REAL</Col>
                    <Col xs={2} className="text-center">FIN</Col>
                </Row>

                <ListGroup variant="flush">
                    {tiempoFechasCriticas?.map((item, index) => (
                        <ListGroup.Item key={index} className="px-0 py-2 border-0">
                            <Row className="align-items-center">
                                {/* Columna Hito */}
                                <Col xs={6}>
                                    <div className="d-flex align-items-center">
                                        {editMode && !ejecutado && (
                                            <i
                                                className="bi bi-x-circle text-danger me-2 cursor-pointer"
                                                onClick={() => deleteItemHandle(index)}
                                            ></i>
                                        )}
                                        <div>
                                            <span className="fw-bold d-block" style={{ textDecoration: item.completado ? 'line-through' : 'none' }}>
                                                {item.description}
                                            </span>
                                            <small className="text-muted">
                                                <i className="bi bi-calendar-event me-1"></i>
                                                {moment(item.date).locale('es').format('LL')}
                                            </small>
                                        </div>
                                    </div>
                                </Col>

                                {/* Columna Fecha de Cierre Real */}
                                <Col xs={4} className="text-center">
                                    {item.completado ? (
                                        <Badge variant="light" className="border text-dark">
                                            {moment(item.fecha_hito).format('DD/MM/YYYY')}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted small">Pendiente</span>
                                    )}
                                </Col>

                                {/* Columna Checkbox */}
                                <Col xs={2} className="text-center">
                                    <Form.Check
                                        type="checkbox"
                                        checked={item.completado || false}
                                        disabled={!editMode || !ejecutado} // Solo se puede cerrar en ejecución
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>

            {/* Modal de Finalización de Hito */}
            <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Finalizar Hito</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿En qué fecha se cumplió el hito: <strong>{tiempoFechasCriticas[selectedIndex]?.description}</strong>?</p>
                    <Form.Group>
                        <Form.Label className="small fw-bold">FECHA DE CUMPLIMIENTO:</Form.Label>
                        <Form.Control
                            type="date"
                            value={closingDate}
                            onChange={(e) => setClosingDate(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCloseModal(false)}>Cancelar</Button>
                    <Button variant="success" onClick={confirmClose}>Confirmar Cierre</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InputHitosEjecutado;