import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { actions } from '../../reducers/controlCambio';

const ChangeControlModal = ({ show, onHide, proyectoId, data, isAdmin, usuario, directorProyecto, projectDetail, onSuccess }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({});
    const [estaAprobado, setEstaAprobado] = useState(false);

    useEffect(() => {
        if (data) {
            const analisisPrevio = typeof data.analisis_impacto === 'string'
                ? { descripcion: data.analisis_impacto, tiempo: 0, dolares: 0 }
                : (data.analisis_impacto || { descripcion: '', tiempo: 0, dolares: 0 });

            setFormData({ ...data, analisis_impacto: analisisPrevio });
            setEstaAprobado(!!data.revision_director);
        } else {
            setFormData({
                nombre_cambio: '',
                descripcion_cambio: '',
                nombre_solicitante: usuario?.nombre || '',
                impacto_proyecto: 'Bajo',
                estado: 'Creado',
                recomendacion: '',
                analisis_impacto: {
                    descripcion: '',
                    tiempo: 0, // Inicializado como número
                    dolares: 0  // Inicializado como número
                },
                resolucion: '',
                revision_director: '',
                asignado_a: '',
                fecha_solicitud: new Date().toISOString().split('T')[0]
            });
            setEstaAprobado(false);
        }
    }, [data, show, usuario]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            proyecto_id: proyectoId,
            usuario_id: usuario?.id,
            // Aseguramos que los valores de impacto viajen como números
            analisis_impacto: {
                ...formData.analisis_impacto,
                tiempo: Number(formData.analisis_impacto?.tiempo || 0),
                dolares: Number(formData.analisis_impacto?.dolares || 0)
            },
            revision_director: estaAprobado ? formData.revision_director : ''
        };

        if (data?.id) {
            dispatch(actions.updateStatus(data.id, payload, proyectoId));
        } else {
            dispatch(actions.saveSolicitud(payload));
        }
        if (onSuccess) onSuccess();
        onHide();
    };

    const handleImpactChange = (field, value) => {
        setFormData({
            ...formData,
            analisis_impacto: {
                ...formData.analisis_impacto,
                [field]: value
            }
        });
    };

    // Helper para formatear moneda
    const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-file-earmark-text me-2"></i>
                    {data ? `Detalle de Solicitud #${data.id}` : 'Nueva Solicitud de Cambio'}
                </Modal.Title>
            </Modal.Header>
            <Form style={{ overflowY: 'scroll' }} onSubmit={handleSubmit}>
                <Modal.Body className="bg-light">
                    {/* RESUMEN CON TOTALIDAD DEL DESVÍO */}
                    <div className="mb-3 p-3 bg-white border-start border-4 border-info shadow-sm">
                        <Row>
                            <Col md={7}>
                                <small className="text-muted d-block fw-bold">PROYECTO: {projectDetail?.nombre}</small>
                                <small className="text-muted d-block">Director: {directorProyecto || 'No asignado'}</small>
                            </Col>
                            <Col md={5} className="border-start">
                                <small className="text-primary d-block fw-bold text-uppercase">Total Desvío Aprobado</small>
                                <div className="d-flex justify-content-between">
                                    <small className="fw-bold">Tiempo:</small>
                                    <small>{formData.analisis_impacto?.tiempo || 0} días</small>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <small className="fw-bold">Presupuesto:</small>
                                    <small className="text-success fw-bold">{formatCurrency(formData.analisis_impacto?.dolares)}</small>
                                </div>
                            </Col>
                        </Row>
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

                    <div className="p-3 border rounded bg-white shadow-sm">
                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">
                            <i className="bi bi-shield-lock me-2"></i>Gestión de Revisión
                        </h6>

                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-uppercase">Asignado a</Form.Label>
                                    <Form.Control
                                        disabled={!isAdmin}
                                        value={formData.asignado_a || ''}
                                        onChange={e => setFormData({ ...formData, asignado_a: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-uppercase">Análisis de Impacto (Descripción)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                disabled={!isAdmin}
                                value={formData.analisis_impacto?.descripcion || ''}
                                onChange={e => handleImpactChange('descripcion', e.target.value)}
                            />
                        </Form.Group>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-uppercase">Impacto en Tiempo (Días)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Ej: 5"
                                        disabled={!isAdmin}
                                        value={formData.analisis_impacto?.tiempo || ''}
                                        onChange={e => handleImpactChange('tiempo', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-uppercase">Impacto en Dólares ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        disabled={!isAdmin}
                                        value={formData.analisis_impacto?.dolares || ''}
                                        onChange={e => handleImpactChange('dolares', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-uppercase">Impacto del Proyecto</Form.Label>
                                    <Form.Control as="select" disabled={!isAdmin} value={formData.impacto_proyecto} onChange={e => setFormData({ ...formData, impacto_proyecto: e.target.value })}>
                                        <option value="Bajo">Bajo</option>
                                        <option value="Mediano">Mediano</option>
                                        <option value="Alto">Alto</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

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
                                <Form.Group className="mb-2">
                                    <Form.Check
                                        type="checkbox"
                                        id="check-aprobado"
                                        label="Aprobado / Visto Bueno"
                                        disabled={!isAdmin}
                                        checked={estaAprobado}
                                        onChange={(e) => setEstaAprobado(e.target.checked)}
                                        className="fw-bold text-success"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-uppercase">Aprobado por (Nombre/Sponsor)</Form.Label>
                                    <Form.Control
                                        disabled={!isAdmin || !estaAprobado}
                                        placeholder={estaAprobado ? "Ingrese nombre de quien aprueba" : "Debe marcar el visto bueno para habilitar"}
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