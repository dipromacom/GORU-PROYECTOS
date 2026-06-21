import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Tabs, Tab, Badge } from 'react-bootstrap';
import LoaderButton from '../loaderButton/LoaderButton';
import {
    emptyStory,
    STORY_TYPES,
    STORY_STATES,
    PRIORITIES,
    MOSCOW_OPTIONS,
    FIBONACCI_POINTS,
    SCORE_FIELDS,
    PRIORIZATION_METHODS,
    labelFor,
    buildUserStoryText,
} from './scrumConstants';
import { getUsuarioLabel, normalizeUsuariosProyecto, calculatePuntuacionFinal, getValorEsfuerzoRatio } from './scrumHelpers';

export default function StoryFormModal({
    show,
    onHide,
    story,
    epics,
    sprints,
    usuarios,
    onSave,
    saving,
    readOnly,
    config,
}) {
    const [form, setForm] = useState(emptyStory());
    const [pointsWarning, setPointsWarning] = useState('');
    const usuariosLista = useMemo(() => normalizeUsuariosProyecto(usuarios), [usuarios]);

    useEffect(() => {
        if (story) {
            setForm({
                ...emptyStory(),
                ...story,
                epic_id: story.epic_id || '',
                sprint_id: story.sprint_id || '',
                asignado_a: story.asignado_a || '',
                story_points: story.story_points ?? '',
                criterios_aceptacion: story.criterios_aceptacion?.length
                    ? story.criterios_aceptacion
                    : [{ dado: '', cuando: '', entonces: '' }],
            });
        } else {
            setForm(emptyStory());
        }
        setPointsWarning('');
    }, [story, show]);

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const setScore = (key, val) => {
        const n = val === '' ? null : Math.min(5, Math.max(1, parseInt(val, 10)));
        set(key, n);
    };

    const setCriterion = (idx, field, val) => {
        const list = [...form.criterios_aceptacion];
        list[idx] = { ...list[idx], [field]: val };
        set('criterios_aceptacion', list);
    };

    const addCriterion = () => {
        set('criterios_aceptacion', [...form.criterios_aceptacion, { dado: '', cuando: '', entonces: '' }]);
    };

    const removeCriterion = (idx) => {
        set('criterios_aceptacion', form.criterios_aceptacion.filter((_, i) => i !== idx));
    };

    const handlePointsChange = (val) => {
        const pts = val === '' ? '' : parseInt(val, 10);
        set('story_points', pts);
        if (pts && pts > 13) {
            setPointsWarning('Historia demasiado grande. Se recomienda dividirla.');
        } else {
            setPointsWarning('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            epic_id: form.epic_id ? parseInt(form.epic_id, 10) : null,
            sprint_id: form.sprint_id ? parseInt(form.sprint_id, 10) : null,
            asignado_a: form.asignado_a ? parseInt(form.asignado_a, 10) : null,
            story_points: form.story_points === '' ? null : parseInt(form.story_points, 10),
            criterios_aceptacion: form.criterios_aceptacion.filter(
                (c) => c.dado || c.cuando || c.entonces,
            ),
        };
        onSave(payload);
    };

    const metodoProyecto = config?.metodo_priorizacion || 'moscow';

    const getQuadrant = () => {
        const val = Number(form.valor_negocio) || 0;
        const eff = Number(form.story_points) || 0;
        if (!val || !eff) return null;
        if (val >= 3 && eff < 5) return 'hacer';
        if (val >= 3 && eff >= 5) return 'planificar';
        if (val < 3 && eff >= 5) return 'evitar';
        return 'relleno';
    };

    const QUADRANTS = [
        { key: 'hacer', label: 'Hacer primero', className: 'bg-success bg-opacity-10' },
        { key: 'planificar', label: 'Planificar', className: 'bg-warning bg-opacity-10' },
        { key: 'relleno', label: 'Relleno', className: 'bg-secondary bg-opacity-10' },
        { key: 'evitar', label: 'Evitar o posponer', className: 'bg-danger bg-opacity-10' },
    ];

    const plantilla = buildUserStoryText(form.rol_usuario, form.necesidad, form.beneficio);

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>
                    {story ? `Editar ${story.codigo || 'historia'}` : 'Nuevo ítem de backlog'}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ maxHeight: '75vh' }}>
                    <Tabs defaultActiveKey="general" className="mb-3">
                        <Tab eventKey="general" title="General">
                            <Row className="mb-3">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Tipo</Form.Label>
                                        <Form.Control
                                            as="select"
                                            disabled={readOnly}
                                            value={form.tipo}
                                            onChange={(e) => set('tipo', e.target.value)}
                                        >
                                            {STORY_TYPES.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <Form.Group>
                                        <Form.Label>Título / nombre corto *</Form.Label>
                                        <Form.Control
                                            required
                                            disabled={readOnly}
                                            value={form.titulo}
                                            onChange={(e) => set('titulo', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Estado</Form.Label>
                                        <Form.Control
                                            as="select"
                                            disabled={readOnly}
                                            value={form.estado}
                                            onChange={(e) => set('estado', e.target.value)}
                                        >
                                            {STORY_STATES.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Prioridad</Form.Label>
                                        <Form.Control
                                            as="select"
                                            disabled={readOnly}
                                            value={form.prioridad}
                                            onChange={(e) => set('prioridad', e.target.value)}
                                        >
                                            <option value="">—</option>
                                            {PRIORITIES.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Épica relacionada</Form.Label>
                                        <Form.Control
                                            as="select"
                                            disabled={readOnly}
                                            value={form.epic_id}
                                            onChange={(e) => set('epic_id', e.target.value)}
                                        >
                                            <option value="">—</option>
                                            {epics.map((ep) => (
                                                <option key={ep.id} value={ep.id}>
                                                    {ep.codigo} — {ep.nombre}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Sprint</Form.Label>
                                        <Form.Control
                                            as="select"
                                            disabled={readOnly}
                                            value={form.sprint_id}
                                            onChange={(e) => set('sprint_id', e.target.value)}
                                        >
                                            <option value="">—</option>
                                            {sprints.map((sp) => (
                                                <option key={sp.id} value={sp.id}>
                                                    {sp.codigo || sp.nombre}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Responsable</Form.Label>
                                        <Form.Control
                                            as="select"
                                            disabled={readOnly}
                                            value={form.asignado_a}
                                            onChange={(e) => set('asignado_a', e.target.value)}
                                        >
                                            <option value="">—</option>
                                            {usuariosLista.map((u) => (
                                                <option key={u.usuario_id} value={u.usuario_id}>
                                                    {getUsuarioLabel(u)}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-2">
                                <Form.Label>Descripción ampliada</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    disabled={readOnly}
                                    value={form.descripcion}
                                    onChange={(e) => set('descripcion', e.target.value)}
                                />
                            </Form.Group>
                        </Tab>

                        <Tab eventKey="historia" title="Historia">
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Rol / persona</Form.Label>
                                        <Form.Control
                                            disabled={readOnly}
                                            value={form.rol_usuario}
                                            onChange={(e) => set('rol_usuario', e.target.value)}
                                            placeholder="director de proyecto"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Necesidad</Form.Label>
                                        <Form.Control
                                            disabled={readOnly}
                                            value={form.necesidad}
                                            onChange={(e) => set('necesidad', e.target.value)}
                                            placeholder="visualizar el burndown"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Beneficio esperado</Form.Label>
                                        <Form.Control
                                            disabled={readOnly}
                                            value={form.beneficio}
                                            onChange={(e) => set('beneficio', e.target.value)}
                                            placeholder="identificar desviaciones"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            {plantilla && (
                                <Alert variant="light" className="small mb-0">
                                    <strong>Vista previa:</strong> {plantilla}
                                </Alert>
                            )}
                        </Tab>

                        <Tab eventKey="criterios" title="Criterios">
                            {form.criterios_aceptacion.map((c, idx) => (
                                <Row key={idx} className="mb-2 align-items-end">
                                    <Col md={3}>
                                        <Form.Label className="small">Dado que</Form.Label>
                                        <Form.Control
                                            size="sm"
                                            disabled={readOnly}
                                            value={c.dado}
                                            onChange={(e) => setCriterion(idx, 'dado', e.target.value)}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="small">Cuando</Form.Label>
                                        <Form.Control
                                            size="sm"
                                            disabled={readOnly}
                                            value={c.cuando}
                                            onChange={(e) => setCriterion(idx, 'cuando', e.target.value)}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small">Entonces</Form.Label>
                                        <Form.Control
                                            size="sm"
                                            disabled={readOnly}
                                            value={c.entonces}
                                            onChange={(e) => setCriterion(idx, 'entonces', e.target.value)}
                                        />
                                    </Col>
                                    <Col md={2}>
                                        {!readOnly && form.criterios_aceptacion.length > 1 && (
                                            <Button variant="outline-danger" size="sm" onClick={() => removeCriterion(idx)}>
                                                Quitar
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                            ))}
                            {!readOnly && (
                                <Button variant="outline-primary" size="sm" onClick={addCriterion}>
                                    + Agregar criterio
                                </Button>
                            )}
                        </Tab>

                        <Tab eventKey="priorizacion" title="Priorización">
                            <div className="mb-3">
                                <Badge bg="secondary">
                                    Método: {labelFor(PRIORIZATION_METHODS, metodoProyecto)}
                                </Badge>
                            </div>

                            {metodoProyecto === 'moscow' && (
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>MoSCoW</Form.Label>
                                            <Form.Control
                                                as="select"
                                                disabled={readOnly}
                                                value={form.moscow}
                                                onChange={(e) => set('moscow', e.target.value)}
                                            >
                                                <option value="">—</option>
                                                {MOSCOW_OPTIONS.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}

                            {metodoProyecto === 'formula' && (
                                <>
                                    <Row className="mb-3">
                                        {SCORE_FIELDS.map(({ key, label }) => (
                                            <Col md={3} key={key} className="mb-2">
                                                <Form.Label className="small">{label} (1-5)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min={1}
                                                    max={5}
                                                    disabled={readOnly}
                                                    value={form[key] ?? ''}
                                                    onChange={(e) => setScore(key, e.target.value)}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                    <Alert variant="info" className="py-2 small">
                                        <strong>Valor final calculado:</strong>{' '}
                                        {calculatePuntuacionFinal(form)}
                                        {' '}
                                        <span className="text-muted">
                                            (suma criterios positivos − complejidad − esfuerzo)
                                        </span>
                                    </Alert>
                                </>
                            )}

                            {metodoProyecto === 'valor_esfuerzo' && (
                                <>
                                    <Row className="mb-3">
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Valor de negocio (1-5)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min={1}
                                                    max={5}
                                                    disabled={readOnly}
                                                    value={form.valor_negocio ?? ''}
                                                    onChange={(e) => setScore('valor_negocio', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Story points</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    disabled={readOnly}
                                                    value={form.story_points}
                                                    onChange={(e) => handlePointsChange(e.target.value)}
                                                >
                                                    <option value="">Sin estimar</option>
                                                    {FIBONACCI_POINTS.map((p) => (
                                                        <option key={p} value={p}>{p}</option>
                                                    ))}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3} className="d-flex align-items-end pb-2">
                                            <span className="small text-muted">
                                                Ratio V/E: <strong>{getValorEsfuerzoRatio(form)?.toFixed(2) ?? '—'}</strong>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <div className="border rounded p-3">
                                                <div className="d-flex text-muted mb-2" style={{ fontSize: 11 }}>
                                                    <span className="me-auto">↑ Valor (Y)</span>
                                                    <span>Bajo esfuerzo ←</span>
                                                    <span className="ms-2">→ Alto esfuerzo (X)</span>
                                                </div>
                                                <div className="row g-1">
                                                    {QUADRANTS.map((q) => {
                                                        const active = getQuadrant() === q.key;
                                                        return (
                                                            <div className="col-6" key={q.key}>
                                                                <div className={`rounded p-2 h-100 border ${q.className} ${active ? 'border-dark border-2' : ''}`} style={{ minHeight: 70 }}>
                                                                    <div className="small fw-semibold">{q.label}</div>
                                                                    {active && (
                                                                        <span style={{ fontSize: 11 }} className="text-muted">
                                                                            ← Esta historia
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </Tab>

                        <Tab eventKey="estimacion" title="Estimación / Puntos de historia">
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Story points (Fibonacci)</Form.Label>
                                        <Form.Control
                                            as="select"
                                            disabled={readOnly}
                                            value={form.story_points}
                                            onChange={(e) => handlePointsChange(e.target.value)}
                                        >
                                            <option value="">Sin estimar</option>
                                            {FIBONACCI_POINTS.map((p) => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Comentario estimación</Form.Label>
                                        <Form.Control
                                            disabled={readOnly}
                                            value={form.estimacion_comentario}
                                            onChange={(e) => set('estimacion_comentario', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            {pointsWarning && <Alert variant="warning" className="py-2">{pointsWarning}</Alert>}
                            {story?.estimacion_historial?.length > 0 && (
                                <div className="small text-muted">
                                    <strong>Historial de puntos:</strong>{' '}
                                    {story.estimacion_historial.map((h, i) => (
                                        <Badge key={i} bg="secondary" className="me-1">
                                            {h.puntos} pts
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </Tab>

                        <Tab eventKey="detalle" title="DoR / Dependencias">
                            <Form.Group className="mb-2">
                                <Form.Label>Reglas de negocio</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    disabled={readOnly}
                                    value={form.reglas_negocio}
                                    onChange={(e) => set('reglas_negocio', e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Dependencias</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    disabled={readOnly}
                                    value={form.dependencias}
                                    onChange={(e) => set('dependencias', e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Supuestos</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    disabled={readOnly}
                                    value={form.supuestos}
                                    onChange={(e) => set('supuestos', e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Requisitos de culminación</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    disabled={readOnly}
                                    value={form.requisitos_culminacion}
                                    onChange={(e) => set('requisitos_culminacion', e.target.value)}
                                    placeholder="Criterios que deben cumplirse para considerar la historia terminada"
                                />
                            </Form.Group>
                            <Form.Check
                                type="checkbox"
                                disabled={readOnly}
                                label="Dependencias críticas abiertas (bloquea paso a Ready)"
                                checked={form.dependencias_criticas_abiertas}
                                onChange={(e) => set('dependencias_criticas_abiertas', e.target.checked)}
                                className="mb-2"
                            />
                            <Form.Check
                                type="checkbox"
                                disabled={readOnly}
                                label="Aprobada por Product Owner (requerido para Ready)"
                                checked={form.aprobado_po}
                                onChange={(e) => set('aprobado_po', e.target.checked)}
                            />
                            {form.estado === 'ready' && (
                                <Alert variant="info" className="mt-3 small mb-0">
                                    Para pasar a <strong>Ready</strong> se valida: descripción, criterios de aceptación,
                                    prioridad, story points, épica, sin dependencias críticas y aprobación PO.
                                </Alert>
                            )}
                        </Tab>

                        {story?.historial?.length > 0 && (
                            <Tab eventKey="historial" title="Historial">
                                <ul className="small mb-0">
                                    {[...story.historial].reverse().slice(0, 20).map((h, i) => (
                                        <li key={i}>
                                            {new Date(h.fecha).toLocaleString('es-ES')} — {h.accion}: {h.detalle}
                                        </li>
                                    ))}
                                </ul>
                            </Tab>
                        )}
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    {!readOnly && (
                        <LoaderButton type="submit" className="btn-primary" isLoading={saving}>
                            Guardar
                        </LoaderButton>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
