import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { actions } from '../../reducers/controlCambio';

const ChangeControlModal = ({ show, onHide, proyectoId, data, isAdmin, usuario, directorProyecto, projectDetail }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (data) {
            // Sincronizamos los datos que vienen de la DB
            setFormData(data);
        } else {
            // Estado inicial para nueva solicitud
            setFormData({
                nombre_cambio: '',
                descripcion_cambio: '',
                nombre_solicitante: usuario?.nombre || '',
                impacto_proyecto: 'Bajo',
                estado: 'Creado',
                recomendacion: '', // Corregido a singular según tu JSON
                analisis_impacto: '',
                resolucion: '',
                revision_director: '', // Corregido según tu JSON (es el aprobado_por)
                fecha_solicitud: new Date().toISOString().split('T')[0]
            });
        }
    }, [data, show, usuario]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aseguramos que el payload lleve los nombres correctos de las columnas
        const payload = {
            ...formData,
            proyecto_id: proyectoId,
            usuario_id: usuario?.id
        };

        if (data?.id) {
            dispatch(actions.updateStatus(data.id, payload, proyectoId));
        } else {
            dispatch(actions.saveSolicitud(payload));
        }
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-file-earmark-text me-2"></i>
                    {data ? `Detalle de Solicitud #${data.id}` : 'Nueva Solicitud de Cambio'}
                </Modal.Title>
            </Modal.Header>
            <Form style={{ overflowY: 'scroll' }}  onSubmit={handleSubmit}>
                <Modal.Body className="bg-light">
                    {/* INFO PROYECTO - SOLO LECTURA */}
                    <div className="mb-3 p-3 bg-white border-start border-4 border-info shadow-sm">
                        <small className="text-muted d-block fw-bold">PROYECTO: {projectDetail?.nombre}</small>
                        <small className="text-muted d-block">Director: {directorProyecto|| 'No asignado'}</small>
                    </div>

                    <h6 className="fw-bold mb-3"><i className="bi bi-info-circle me-2"></i>Información General</h6>
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Nombre del Cambio</Form.Label>
                                <Form.Control required disabled={!!data} value={formData.nombre_cambio || ''} onChange={e => setFormData({ ...formData, nombre_cambio: e.target.value })} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Elaborado por</Form.Label>
                                <Form.Control required disabled={!!data} value={formData.nombre_solicitante || ''} onChange={e => setFormData({ ...formData, nombre_solicitante: e.target.value })} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label>Descripción del Cambio</Form.Label>
                        <Form.Control as="textarea" rows={3} required disabled={!!data} value={formData.descripcion_cambio || ''} onChange={e => setFormData({ ...formData, descripcion_cambio: e.target.value })} />
                    </Form.Group>

                    {/* SECCIÓN ADMINISTRATIVA */}
                    <div className="p-3 border rounded bg-white shadow-sm">
                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">
                            <i className="bi bi-shield-lock me-2"></i>Gestión de Revisión
                        </h6>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-uppercase">Asignado a</Form.Label>
                                    <Form.Control disabled={!isAdmin} value={formData.asignado_a || ''} onChange={e => setFormData({ ...formData, asignado_a: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-uppercase">Impacto</Form.Label>
                                    <Form.Control as="select" disabled={!isAdmin} value={formData.impacto_proyecto} onChange={e => setFormData({ ...formData, impacto_proyecto: e.target.value })}>
                                        <option value="Bajo">Bajo</option><option value="Mediano">Mediano</option><option value="Alto">Alto</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-uppercase">Análisis de Impacto</Form.Label>
                            <Form.Control as="textarea" rows={2} disabled={!isAdmin} value={formData.analisis_impacto || ''} onChange={e => setFormData({ ...formData, analisis_impacto: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-uppercase">Recomendación</Form.Label>
                            <Form.Control as="textarea" rows={2} disabled={!isAdmin} value={formData.recomendacion || ''} onChange={e => setFormData({ ...formData, recomendacion: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-uppercase">Resolución</Form.Label>
                            <Form.Control as="textarea" rows={2} disabled={!isAdmin} value={formData.resolucion || ''} onChange={e => setFormData({ ...formData, resolucion: e.target.value })} />
                        </Form.Group>

                        <Row>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-uppercase">Aprobado por (Director)</Form.Label>
                                    <Form.Control
                                        disabled={!isAdmin}
                                        value={formData.revision_director || ''}
                                        onChange={e => setFormData({ ...formData, revision_director: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cerrar</Button>
                    {(isAdmin || !data) && (
                        <Button variant="primary" type="submit">
                            {data ? 'Guardar Cambios' : 'Enviar Solicitud'}
                        </Button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ChangeControlModal;