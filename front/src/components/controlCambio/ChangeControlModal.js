import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { actions } from '../../reducers/controlCambio';

const ChangeControlModal = ({ show, onHide, proyectoId, data, isAdmin, usuario, directorProyecto, projectDetail, onSuccess }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({});
    // Estado local para el check de aprobación (no se guarda en base a tu instrucción)
    const [estaAprobado, setEstaAprobado] = useState(false);

    useEffect(() => {
        if (data) {
            // Intentar parsear el análisis de impacto si viene como string, o inicializarlo si no existe
            const analisisPrevio = typeof data.analisis_impacto === 'string'
                ? { descripcion: data.analisis_impacto, tiempo: '', dolares: '' }
                : (data.analisis_impacto || { descripcion: '', tiempo: '', dolares: '' });

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
                // Estructura de objeto para análisis de impacto
                analisis_impacto: {
                    descripcion: '',
                    tiempo: '',
                    dolares: ''
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
            // Si no está el check, limpiamos el campo de revisión antes de enviar
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

    // Helper para actualizar campos dentro del objeto analisis_impacto
    const handleImpactChange = (field, value) => {
        setFormData({
            ...formData,
            analisis_impacto: {
                ...formData.analisis_impacto,
                [field]: value
            }
        });
    };

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
                    <div className="mb-3 p-3 bg-white border-start border-4 border-info shadow-sm">
                        <small className="text-muted d-block fw-bold">PROYECTO: {projectDetail?.nombre}</small>
                        <small className="text-muted d-block">Director: {directorProyecto || 'No asignado'}</small>
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

                        {/* 1. Asignado a (Debería ser select de personas del proyecto) */}
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-uppercase">Asignado a</Form.Label>
                                    <Form.Control
                                        disabled={!isAdmin}
                                        value={formData.asignado_a || ''}
                                        onChange={e => setFormData({ ...formData, asignado_a: e.target.value })}
                                    >
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* 2. Análisis de Impacto (Ahora con campos de Tiempo y Dólares) */}
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
                                    <Form.Label className="fw-bold small text-uppercase">Impacto en Tiempo</Form.Label>
                                    <Form.Control
                                        placeholder="Ej: 5 días"
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
                                        placeholder="0.00"
                                        disabled={!isAdmin}
                                        value={formData.analisis_impacto?.dolares || ''}
                                        onChange={e => handleImpactChange('dolares', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* 3. Nivel de Impacto */}
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

                        {/* 4. Recomendación */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-uppercase">Recomendación</Form.Label>
                            <Form.Control as="textarea" rows={2} disabled={!isAdmin} value={formData.recomendacion || ''} onChange={e => setFormData({ ...formData, recomendacion: e.target.value })} />
                        </Form.Group>

                        {/* 5. Resolución */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-uppercase">Resolución</Form.Label>
                            <Form.Control as="textarea" rows={2} disabled={!isAdmin} value={formData.resolucion || ''} onChange={e => setFormData({ ...formData, resolucion: e.target.value })} />
                        </Form.Group>

                        {/* 6. Aprobación con Checkbox y campo bloqueable */}
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
                                    {estaAprobado && (
                                        <Form.Text className="text-muted">
                                            Se guardará con fecha: {new Date().toLocaleDateString()}
                                        </Form.Text>
                                    )}
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