import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Nav, Tab, Card, Badge, Table } from 'react-bootstrap';
import InteresadoDropdown from '../kanban/InteresadoDropdown';

const PlanRespuestaModal = ({ show, handleClose, riesgo, handleSave, interesados }) => {
    // Normalizar planes de respuesta existentes o migrar legacy plan_descripcion
    const [planesRespuesta, setPlanesRespuesta] = useState([]);

    // Estado del plan de contingencia
    const [disparador, setDisparador] = useState('');
    const [planContingenciaDesc, setPlanContingenciaDesc] = useState('');
    const [valorContingencia, setValorContingencia] = useState('');
    const [responsableContingenciaId, setResponsableContingenciaId] = useState('');

    // Estado del nuevo plan de respuesta a agregar/editar en la tab 1
    const [nuevoPlan, setNuevoPlan] = useState({
        id: '',
        descripcion: '',
        estrategia: 'mitigar',
        costo: '',
        fecha_realizacion: '',
        responsable_id: '',
        completado: false
    });
    const [editingIndex, setEditingIndex] = useState(-1);

    // Estado para Riesgo Residual
    const [completadoGlobal, setCompletadoGlobal] = useState(false);
    const [probabilidadResidual, setProbabilidadResidual] = useState(3);
    const [impactoResidual, setImpactoResidual] = useState(3);

    const values = [
        { clave: 3, valor: "Alto (3)" },
        { clave: 2, valor: "Medio (2)" },
        { clave: 1, valor: "Bajo (1)" },
    ];

    useEffect(() => {
        if (!riesgo) return;

        // Migración/Carga de Planes de Respuesta
        let initialPlanes = [];
        if (Array.isArray(riesgo.planes_respuesta) && riesgo.planes_respuesta.length > 0) {
            initialPlanes = riesgo.planes_respuesta.map(p => ({
                id: p.id || `PR-${Math.random().toString(36).substr(2, 5)}`,
                descripcion: p.descripcion || '',
                estrategia: p.estrategia || 'mitigar',
                costo: p.costo !== undefined && p.costo !== null ? p.costo : 0,
                fecha_realizacion: p.fecha_realizacion || '',
                responsable_id: p.responsable_id || '',
                completado: Boolean(p.completado)
            }));
        } else if (riesgo.plan_descripcion) {
            // Compatibilidad legacy
            initialPlanes = [{
                id: `PR-1`,
                descripcion: riesgo.plan_descripcion,
                estrategia: riesgo.estrategia || 'mitigar',
                costo: riesgo.costo || 0,
                fecha_realizacion: riesgo.fecha_realizacion || '',
                responsable_id: riesgo.responsable_id || '',
                completado: Boolean(riesgo.completado)
            }];
        }
        setPlanesRespuesta(initialPlanes);

        // Carga de Plan de Contingencia
        const cont = riesgo.plan_contingencia || {};
        setDisparador(cont.disparador || riesgo.disparador || '');
        setPlanContingenciaDesc(cont.descripcion || riesgo.plan_contingencia_desc || '');
        setValorContingencia(cont.costo !== undefined && cont.costo !== null ? cont.costo : (riesgo.valor_contingencia || ''));
        setResponsableContingenciaId(cont.responsable_id || riesgo.responsable_contingencia_id || '');

        // Residual y completado global
        const isCompleted = riesgo.completado || initialPlanes.some(p => p.completado);
        setCompletadoGlobal(isCompleted);
        setProbabilidadResidual(
            riesgo.probabilidad_residual !== null && riesgo.probabilidad_residual !== undefined
                ? riesgo.probabilidad_residual
                : riesgo.probabilidad || 2
        );
        setImpactoResidual(
            riesgo.impacto_residual !== null && riesgo.impacto_residual !== undefined
                ? riesgo.impacto_residual
                : riesgo.impacto || 2
        );

        resetFormNuevoPlan();
    }, [riesgo, show]);

    const resetFormNuevoPlan = () => {
        setNuevoPlan({
            id: '',
            descripcion: '',
            estrategia: 'mitigar',
            costo: '',
            fecha_realizacion: '',
            responsable_id: '',
            completado: false
        });
        setEditingIndex(-1);
    };

    const handleAddOrUpdatePlan = () => {
        if (!nuevoPlan.descripcion.trim()) return;

        const planToSave = {
            ...nuevoPlan,
            costo: Number(nuevoPlan.costo) || 0,
            id: nuevoPlan.id || `PR-${Date.now()}`
        };

        if (editingIndex >= 0) {
            const updated = [...planesRespuesta];
            updated[editingIndex] = planToSave;
            setPlanesRespuesta(updated);
        } else {
            setPlanesRespuesta([...planesRespuesta, planToSave]);
        }
        resetFormNuevoPlan();
    };

    const handleEditPlanClick = (index) => {
        setEditingIndex(index);
        setNuevoPlan({ ...planesRespuesta[index] });
    };

    const handleDeletePlanClick = (index) => {
        setPlanesRespuesta(planesRespuesta.filter((_, i) => i !== index));
        if (editingIndex === index) {
            resetFormNuevoPlan();
        }
    };

    const costoTotalPlanes = planesRespuesta.reduce((sum, p) => sum + (Number(p.costo) || 0), 0);
    const valorResidual = probabilidadResidual * impactoResidual;

    const getResponsableName = (id) => {
        if (!id) return 'Sin asignar';
        const found = interesados.find(i => Number(i.id) === Number(id));
        return found ? (found.nombre_interesado || found.nombre || 'N/A') : 'Sin asignar';
    };

    const onSave = () => {
        // Mantener compatibilidad con los campos antiguos de primer plan para vistas legacy que consuman plan_descripcion
        const primerPlan = planesRespuesta[0] || {};

        const updatedRiesgo = {
            ...riesgo,
            // Múltiples planes
            planes_respuesta: planesRespuesta,
            costo_total_planes: costoTotalPlanes,

            // Legacy fallback
            plan_descripcion: primerPlan.descripcion || '',
            estrategia: primerPlan.estrategia || '',
            fecha_realizacion: primerPlan.fecha_realizacion || '',
            responsable_id: primerPlan.responsable_id || '',
            costo: primerPlan.costo || 0,

            // Plan de contingencia
            plan_contingencia: {
                disparador: disparador,
                descripcion: planContingenciaDesc,
                costo: Number(valorContingencia) || 0,
                responsable_id: responsableContingenciaId
            },

            // Completado & Residual
            completado: completadoGlobal,
            probabilidad_residual: completadoGlobal ? probabilidadResidual : null,
            impacto_residual: completadoGlobal ? impactoResidual : null,
            valor_residual: completadoGlobal ? valorResidual : null,
        };

        handleSave(updatedRiesgo);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="h5">
                    <i className="bi bi-shield-exclamation text-primary me-2"></i>
                    Gestión de Respuestas - Riesgo {riesgo.id}: "{riesgo.descripcion}"
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {/* Resumen del Riesgo Inicial */}
                <Card className="mb-4 bg-light border-0 shadow-sm">
                    <Card.Body className="py-2 px-3">
                        <Row className="align-items-center">
                            <Col md={7}>
                                <small className="text-muted d-block">Riesgo Inicial:</small>
                                <strong>{riesgo.descripcion}</strong>
                            </Col>
                            <Col md={5} className="text-md-end">
                                <Badge bg="info" className="me-2">
                                    Prob: {riesgo.probabilidad} | Imp: {riesgo.impacto}
                                </Badge>
                                <Badge bg={riesgo.valor >= 7 ? 'danger' : riesgo.valor >= 4 ? 'warning' : 'success'}>
                                    Valor: {riesgo.valor}
                                </Badge>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Tab.Container defaultActiveKey="planes">
                    <Nav variant="tabs" className="mb-3">
                        <Nav.Item>
                            <Nav.Link eventKey="planes" className="fw-bold">
                                <i className="bi bi-list-check me-2"></i>
                                Planes de Respuesta ({planesRespuesta.length})
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="contingencia" className="fw-bold">
                                <i className="bi bi-life-preserver me-2"></i>
                                Plan de Contingencia
                                {disparador && <Badge bg="warning" text="dark" className="ms-2">Configurado</Badge>}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="residual" className="fw-bold">
                                <i className="bi bi-shield-check me-2"></i>
                                Riesgo Residual
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Tab.Content>
                        {/* TAB 1: PLANES DE RESPUESTA */}
                        <Tab.Pane eventKey="planes">
                            {/* Formulario de Agregar / Editar Plan */}
                            <Card className="mb-4 border border-light shadow-sm">
                                <Card.Header className="bg-white py-2 fw-bold text-secondary">
                                    {editingIndex >= 0 ? 'Editar Plan de Respuesta' : 'Agregar Nuevo Plan de Respuesta'}
                                </Card.Header>
                                <Card.Body className="p-3">
                                    <Row className="g-3">
                                        <Col md={8}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold">Descripción del Plan</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    size="sm"
                                                    placeholder="Ej. Implementar servidor de respaldo..."
                                                    value={nuevoPlan.descripcion}
                                                    onChange={(e) => setNuevoPlan({ ...nuevoPlan, descripcion: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold">Estrategia</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    size="sm"
                                                    value={nuevoPlan.estrategia}
                                                    onChange={(e) => setNuevoPlan({ ...nuevoPlan, estrategia: e.target.value })}
                                                >
                                                    <option value="mitigar">Mitigar</option>
                                                    <option value="evitar">Evitar</option>
                                                    <option value="transferir">Transferir</option>
                                                    <option value="aceptar">Aceptar</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold">Costo Estimado ($)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    size="sm"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={nuevoPlan.costo}
                                                    onChange={(e) => setNuevoPlan({ ...nuevoPlan, costo: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold">Fecha Realización</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    size="sm"
                                                    value={nuevoPlan.fecha_realizacion}
                                                    onChange={(e) => setNuevoPlan({ ...nuevoPlan, fecha_realizacion: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={5}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold">Responsable</Form.Label>
                                                <InteresadoDropdown
                                                    interesados={interesados}
                                                    task={{ interesadoId: nuevoPlan.responsable_id, id: 'plan-resp' }}
                                                    editTask={({ interesadoId }) => setNuevoPlan({ ...nuevoPlan, responsable_id: Number(interesadoId) })}
                                                    cerrado={false}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                        <Form.Check
                                            type="checkbox"
                                            id="check-completado-plan"
                                            label={<span className="small font-weight-normal">Marcar como Completado/Ejecutado</span>}
                                            checked={nuevoPlan.completado}
                                            onChange={(e) => setNuevoPlan({ ...nuevoPlan, completado: e.target.checked })}
                                        />
                                        <div>
                                            {editingIndex >= 0 && (
                                                <Button variant="link" size="sm" className="text-secondary me-2" onClick={resetFormNuevoPlan}>
                                                    Cancelar
                                                </Button>
                                            )}
                                            <Button
                                                variant={editingIndex >= 0 ? "warning" : "primary"}
                                                size="sm"
                                                onClick={handleAddOrUpdatePlan}
                                                disabled={!nuevoPlan.descripcion.trim()}
                                            >
                                                <i className={`bi ${editingIndex >= 0 ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                                                {editingIndex >= 0 ? 'Guardar Cambios' : 'Agregar Plan'}
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Tabla de Planes Registrados */}
                            <h6 className="fw-bold mb-2 text-dark d-flex justify-content-between align-items-center">
                                <span>Planes Asociados</span>
                                <Badge bg="success" className="fs-6 font-monospace">
                                    Total Costo Planes: ${costoTotalPlanes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                </Badge>
                            </h6>

                            {planesRespuesta.length === 0 ? (
                                <div className="text-center py-4 text-muted bg-light rounded">
                                    <i className="bi bi-inbox fs-3 d-block mb-1"></i>
                                    No hay planes de respuesta registrados aún.
                                </div>
                            ) : (
                                <Table hover responsive size="sm" className="align-middle border">
                                    <thead className="bg-light text-muted small">
                                        <tr>
                                            <th>Descripción</th>
                                            <th>Estrategia</th>
                                            <th>Costo</th>
                                            <th>Responsable</th>
                                            <th>Fecha</th>
                                            <th>Estado</th>
                                            <th className="text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="small">
                                        {planesRespuesta.map((plan, idx) => (
                                            <tr key={plan.id || idx}>
                                                <td className="fw-bold text-break" style={{ maxWidth: '200px' }}>{plan.descripcion}</td>
                                                <td>
                                                    <Badge bg="secondary" className="text-capitalize">{plan.estrategia}</Badge>
                                                </td>
                                                <td className="fw-bold text-success">
                                                    ${(Number(plan.costo) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td>{getResponsableName(plan.responsable_id)}</td>
                                                <td>{plan.fecha_realizacion || '—'}</td>
                                                <td>
                                                    <Badge bg={plan.completado ? 'success' : 'warning'}>
                                                        {plan.completado ? 'Completado' : 'Pendiente'}
                                                    </Badge>
                                                </td>
                                                <td className="text-end">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="btn-sm py-0 px-1 me-1"
                                                        title="Editar"
                                                        onClick={() => handleEditPlanClick(idx)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="btn-sm py-0 px-1"
                                                        title="Eliminar"
                                                        onClick={() => handleDeletePlanClick(idx)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Tab.Pane>

                        {/* TAB 2: PLAN DE CONTINGENCIA */}
                        <Tab.Pane eventKey="contingencia">
                            <Card className="border-0 bg-light p-3">
                                <Card.Body className="p-2">
                                    <p className="text-muted small mb-3">
                                        <i className="bi bi-info-circle me-1"></i>
                                        El plan de contingencia se ejecuta únicamente si el riesgo se materializa o se activa su disparador (Trigger).
                                    </p>
                                    <Row className="g-3">
                                        <Col md={12}>
                                            <Form.Group controlId="disparador">
                                                <Form.Label className="fw-bold small">1. Disparador / Trigger (Condición de activación)</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Ej: Si el retraso supera 5 días hábiles o cae el servicio principal"
                                                    value={disparador}
                                                    onChange={(e) => setDisparador(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="planContingenciaDesc">
                                                <Form.Label className="fw-bold small">2. Plan de Contingencia (Acción a ejecutar)</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="Descripción detallada de la acción de contingencia..."
                                                    value={planContingenciaDesc}
                                                    onChange={(e) => setPlanContingenciaDesc(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="valorContingencia">
                                                <Form.Label className="fw-bold small">3. Valor / Costo del Plan ($)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={valorContingencia}
                                                    onChange={(e) => setValorContingencia(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group controlId="responsableContingencia">
                                                <Form.Label className="fw-bold small">4. Responsable de Contingencia</Form.Label>
                                                <InteresadoDropdown
                                                    interesados={interesados}
                                                    task={{ interesadoId: responsableContingenciaId, id: 'cont-resp' }}
                                                    editTask={({ interesadoId }) => setResponsableContingenciaId(Number(interesadoId))}
                                                    cerrado={false}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Tab.Pane>

                        {/* TAB 3: RIESGO RESIDUAL */}
                        <Tab.Pane eventKey="residual">
                            <Form.Group controlId="completadoGlobal" className="mb-3 p-3 border rounded bg-light">
                                <Form.Check
                                    type="checkbox"
                                    label={<strong className="text-primary">Activar / Calcular Riesgo Residual (Cierre de Respuestas)</strong>}
                                    checked={completadoGlobal}
                                    onChange={(e) => setCompletadoGlobal(e.target.checked)}
                                />
                                <Form.Text className="text-muted d-block ms-4">
                                    Marque esta opción para recalcular la probabilidad e impacto luego de aplicar las medidas de mitigación.
                                </Form.Text>
                            </Form.Group>

                            {completadoGlobal && (
                                <div className="p-3 border rounded bg-white shadow-sm">
                                    <h6 className="text-primary fw-bold mb-3">
                                        <i className="bi bi-shield-check me-2"></i>
                                        Riesgo Residual (Después de aplicar respuestas)
                                    </h6>
                                    <Row className="g-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold">Probabilidad Residual</Form.Label>
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
                                                <Form.Label className="small fw-bold">Impacto Residual</Form.Label>
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
                                            <div className="alert alert-success w-100 mb-0 py-2 text-center">
                                                <strong>Valor Residual:</strong> {valorResidual}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={onSave}>
                    <i className="bi bi-save me-1"></i> Guardar Todo
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PlanRespuestaModal;