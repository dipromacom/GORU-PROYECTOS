import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import InteresadoDropdown from '../kanban/InteresadoDropdown';

const PlanRespuestaModal = ({ show, handleClose, riesgo, handleSave, interesados }) => {
    const [planDesc, setPlanDesc] = useState(riesgo.plan_descripcion || '');
    const [fechaRealizacion, setFechaRealizacion] = useState(riesgo.fecha_realizacion || '');
    const [responsableId, setResponsableId] = useState(riesgo.responsable_id || '');
    const [completado, setCompletado] = useState(riesgo.completado || false);

    const [estrategia, setEstrategia] = useState(riesgo.estrategia || '');
    const [probabilidadResidual, setProbabilidadResidual] = useState(
        riesgo.probabilidad_residual !== null ? riesgo.probabilidad_residual : riesgo.probabilidad
    );
    const [impactoResidual, setImpactoResidual] = useState(
        riesgo.impacto_residual !== null ? riesgo.impacto_residual : riesgo.impacto
    );

    const values = [
        { clave: 3, valor: "Alto (3)" },
        { clave: 2, valor: "Medio (2)" },
        { clave: 1, valor: "Bajo (1)" },
    ];

    useEffect(() => {
        setPlanDesc(riesgo.plan_descripcion || '');
        setFechaRealizacion(riesgo.fecha_realizacion || '');
        setResponsableId(riesgo.responsable_id || '');
        setCompletado(riesgo.completado || false);
        setEstrategia(riesgo.estrategia || '');
        setProbabilidadResidual(
            riesgo.probabilidad_residual !== null ? riesgo.probabilidad_residual : riesgo.probabilidad
        );
        setImpactoResidual(
            riesgo.impacto_residual !== null ? riesgo.impacto_residual : riesgo.impacto
        );
    }, [riesgo, show]);

    const valorResidual = probabilidadResidual * impactoResidual;

    const onSave = () => {
        handleSave({
            ...riesgo,
            plan_descripcion: planDesc,
            fecha_realizacion: fechaRealizacion,
            responsable_id: responsableId,
            completado: completado,
            estrategia: estrategia,
            // ✅ NUEVO: Solo guardar si está completado
            probabilidad_residual: completado ? probabilidadResidual : null,
            impacto_residual: completado ? impactoResidual : null,
            valor_residual: completado ? valorResidual : null,
        });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Plan de Respuesta - {riesgo.id}: "{riesgo.descripcion}"
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {/* Información del riesgo inicial */}
                    <div className="alert alert-info">
                        <strong>Riesgo Inicial:</strong> Probabilidad ({riesgo.probabilidad}) x Impacto ({riesgo.impacto}) = <strong>{riesgo.valor}</strong>
                    </div>

                    {/* Estrategia de respuesta */}
                    <Form.Group controlId="estrategia">
                        <Form.Label>Estrategia de Respuesta</Form.Label>
                        <Form.Control
                            as="select"
                            value={estrategia}
                            onChange={(e) => setEstrategia(e.target.value)}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="evitar">Evitar</option>
                            <option value="mitigar">Mitigar</option>
                            <option value="transferir">Transferir</option>
                            <option value="aceptar">Aceptar</option>
                        </Form.Control>
                    </Form.Group>

                    {/* Descripción Plan de Respuesta */}
                    <Form.Group controlId="planDesc" className="mt-3">
                        <Form.Label>Descripción del Plan de Respuesta</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={planDesc}
                            onChange={(e) => setPlanDesc(e.target.value)}
                        />
                    </Form.Group>

                    <Row className="mt-3">
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

                        <Col md={6}>
                            <Form.Group controlId="responsable">
                                <Form.Label>Responsable del Plan</Form.Label><br />
                                <InteresadoDropdown
                                    interesados={interesados}
                                    task={{ interesadoId: responsableId, id: riesgo.id }}
                                    editTask={({ interesadoId }) => setResponsableId(Number(interesadoId))}
                                    cerrado={false}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* ✅ NUEVO: Riesgo Residual */}
                    {completado && (
                        <div className="mt-4 p-3 border rounded bg-light">
                            <h6 className="text-primary">
                                <i className="bi bi-shield-check me-2"></i>
                                Riesgo Residual (Después del Plan)
                            </h6>
                            <Row>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Probabilidad Residual</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={probabilidadResidual}
                                            onChange={(e) => setProbabilidadResidual(Number(e.target.value))}
                                        >
                                            {values.map(v => (
                                                <option key={v.clave} value={v.clave}>{v.valor}</option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Impacto Residual</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={impactoResidual}
                                            onChange={(e) => setImpactoResidual(Number(e.target.value))}
                                        >
                                            {values.map(v => (
                                                <option key={v.clave} value={v.clave}>{v.valor}</option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={4} className="d-flex align-items-end">
                                    <div className="alert alert-success w-100 mb-0">
                                        <strong>Valor Residual:</strong> {valorResidual}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* Checkbox para Cerrar Plan */}
                    <Form.Group controlId="completado" className="mt-3">
                        <Form.Check
                            type="checkbox"
                            label="Cerrar Plan de Respuesta (Calcular Riesgo Residual)"
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