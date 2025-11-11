import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import InteresadoDropdown from '../kanban/InteresadoDropdown';

const PlanRespuestaModal = ({ show, handleClose, riesgo, handleSave, interesados }) => {
    const [planDesc, setPlanDesc] = useState(riesgo.plan_descripcion || '');
    const [fechaRealizacion, setFechaRealizacion] = useState(riesgo.fecha_realizacion || '');
    const [responsableId, setResponsableId] = useState(riesgo.responsable_id || '');
    const [completado, setCompletado] = useState(riesgo.completado || false);
    console.log(responsableId)
    // Sincronizar estado interno con el prop 'riesgo' cuando el modal se abre
    useEffect(() => {
        setPlanDesc(riesgo.plan_descripcion || '');
        setFechaRealizacion(riesgo.fecha_realizacion || '');
        setResponsableId(riesgo.responsable_id || '');
        setCompletado(riesgo.completado || false);
    }, [riesgo, show]);

    const onInteresadoSelect = ({ interesadoId: selectedId }) => {
        setResponsableId(Number(selectedId));
    };

    const onSave = () => {
        handleSave({
            ...riesgo,
            plan_descripcion: planDesc,
            fecha_realizacion: fechaRealizacion,
            responsable_id: responsableId,
            completado: completado,
        });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Plan de Respuesta para Riesgo: "{riesgo.descripcion}"</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {/* Descripción Plan de Respuesta */}
                    <Form.Group controlId="planDesc">
                        <Form.Label>Descripción del Plan de Respuesta</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={planDesc}
                            onChange={(e) => setPlanDesc(e.target.value)}
                        />
                    </Form.Group>

                    <Row>
                        {/* Fecha Realización */}
                        <Col md={6}>
                            <Form.Group controlId="fechaRealizacion">
                                <Form.Label>Fecha de Realización</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fechaRealizacion}
                                    onChange={(e) => setFechaRealizacion(e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Responsable */}
                        <Col md={6}>
                            <Form.Group controlId="responsable">
                                <Form.Label>Responsable del Plan</Form.Label><br></br>
                                <InteresadoDropdown 
                                    interesados={interesados}
                                    task={{ interesadoId: responsableId, id: riesgo.descripcion }}
                                    editTask={onInteresadoSelect}
                                    cerrado={false}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Checkbox para Cerrar Plan */}
                    <Form.Group controlId="completado" className="mt-3">
                        <Form.Check
                            type="checkbox"
                            label="Cerrar Plan de Respuesta"
                            checked={completado}
                            onChange={(e) => setCompletado(e.target.checked)}
                        />
                    </Form.Group>

                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={onSave}>
                    Guardar Plan
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PlanRespuestaModal;