import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Row, Col, Card, Button, Table, Badge, ProgressBar, Alert, Form, Modal, Spinner, Tabs, Tab,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import SprintFormModal from './SprintFormModal';
import ScrumBan from './ScrumBan';
import { SPRINT_STATES, PRIORITIES, labelFor } from './scrumConstants';
import {
    getEpicLabel, getPriorityVariant, getSprintUserName, formatSprintDates,
    normalizeUsuariosProyecto,
} from './scrumHelpers';
import * as Api from '../../api';
import { actions as scrumActions } from '../../reducers/scrum';

const CHECKLIST_LABELS = {
    objetivo: 'Objetivo del sprint definido',
    fechas: 'Fechas del sprint confirmadas',
    historias: 'Al menos una historia seleccionada',
    capacidad: 'Capacidad del equipo definida',
    equipo: 'Product Owner o Scrum Master asignado',
    historiasEstimadas: 'Todas las historias tienen story points',
    historiasReady: 'Todas las historias están en Ready',
};

export default function SprintPanel({
    projectId,
    sprints,
    usuarios,
    puedeGestionar,
    dispatch,
}) {
    const [selectedId, setSelectedId] = useState(null);
    const [planning, setPlanning] = useState(null);
    const [loadingPlanning, setLoadingPlanning] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingSprint, setEditingSprint] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [closeComment, setCloseComment] = useState('');
    const [readyFilter, setReadyFilter] = useState('');
    const [activeSprintTab, setActiveSprintTab] = useState('planificacion');

    const usuariosLista = useMemo(() => normalizeUsuariosProyecto(usuarios), [usuarios]);

    const sortedSprints = useMemo(() => {
        const order = { activo: 0, planificado: 1, cerrado: 2, cancelado: 3 };
        return [...sprints].sort((a, b) => (order[a.estado] ?? 9) - (order[b.estado] ?? 9));
    }, [sprints]);

    useEffect(() => {
        if (!selectedId && sortedSprints.length) {
            const preferred = sortedSprints.find((s) => s.estado === 'planificado')
                || sortedSprints.find((s) => s.estado === 'activo')
                || sortedSprints[0];
            setSelectedId(preferred.id);
        }
    }, [sortedSprints, selectedId]);

    const refreshOverview = () => dispatch(scrumActions.fetch({ projectId }));

    const loadPlanning = useCallback(async (sprintId) => {
        if (!sprintId) return;
        setLoadingPlanning(true);
        try {
            const res = await Api.getSprintPlanning(projectId, sprintId);
            setPlanning(res.data);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al cargar planificación');
            setPlanning(null);
        } finally {
            setLoadingPlanning(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (selectedId) loadPlanning(selectedId);
    }, [selectedId, loadPlanning]);

    const sprint = planning?.sprint;
    const isPlanificable = sprint?.estado === 'planificado';
    const isActive = sprint?.estado === 'activo';
    const isClosed = sprint?.estado === 'cerrado';
    const canShowScrumban = (isActive || isPlanificable) && (planning?.sprintStories?.length > 0);
    const canShowMetrics = isActive || isClosed;
    const capacidad = Number(sprint?.capacidad_puntos) || 0;
    const comprometidos = Number(sprint?.puntos_comprometidos) || 0;
    const capacityPct = planning?.capacityPct ?? 0;

    const filteredReady = useMemo(() => {
        const list = planning?.readyStories || [];
        if (!readyFilter) return list;
        const q = readyFilter.toLowerCase();
        return list.filter((s) =>
            [s.codigo, s.titulo, getEpicLabel(s)].join(' ').toLowerCase().includes(q));
    }, [planning?.readyStories, readyFilter]);

    const handleSaveSprint = async (payload) => {
        setSaving(true);
        try {
            if (editingSprint?.id) {
                await Api.updateScrumSprint(projectId, editingSprint.id, payload);
                toast.success('Sprint actualizado');
            } else {
                const res = await Api.createScrumSprint(projectId, payload);
                toast.success('Sprint creado');
                const newId = res.data.sprint.id;
                setSelectedId(newId);
                await loadPlanning(newId);
            }
            setShowForm(false);
            refreshOverview();
            if (selectedId || editingSprint?.id) {
                loadPlanning(editingSprint?.id || selectedId);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al guardar sprint');
        } finally {
            setSaving(false);
        }
    };

    const handleAssign = async (storyId) => {
        try {
            await Api.assignStoryToSprint(projectId, selectedId, storyId);
            await loadPlanning(selectedId);
            refreshOverview();
        } catch (e) {
            toast.error(e.response?.data?.message || 'No se pudo agregar la historia');
        }
    };

    const handleRemove = async (storyId) => {
        try {
            await Api.removeStoryFromSprint(projectId, selectedId, storyId);
            await loadPlanning(selectedId);
            refreshOverview();
        } catch (e) {
            toast.error(e.response?.data?.message || 'No se pudo quitar la historia');
        }
    };

    const handleClear = async () => {
        try {
            await Api.clearSprintStories(projectId, selectedId);
            toast.success('Sprint vaciado');
            await loadPlanning(selectedId);
            refreshOverview();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al vaciar sprint');
        }
    };

    const handleActivate = async () => {
        try {
            await Api.activateScrumSprint(projectId, selectedId);
            toast.success('Sprint activado');
            refreshOverview();
            loadPlanning(selectedId);
        } catch (e) {
            toast.error(e.response?.data?.message || 'No se pudo activar el sprint');
        }
    };

    const handleClose = async () => {
        try {
            await Api.closeScrumSprint(projectId, selectedId, { comentarios_cierre: closeComment });
            toast.success('Sprint cerrado');
            setShowCloseModal(false);
            setCloseComment('');
            refreshOverview();
            loadPlanning(selectedId);
        } catch (e) {
            toast.error(e.response?.data?.message || 'No se pudo cerrar el sprint');
        }
    };

    const estadoBadge = (estado) => {
        const st = SPRINT_STATES.find((s) => s.value === estado);
        return <Badge bg={st?.variant || 'secondary'}>{st?.label || estado}</Badge>;
    };

    const renderStoryRow = (story, action) => (
        <tr key={story.id}>
            <td><code className="small">{story.codigo}</code></td>
            <td className="small">{story.titulo}</td>
            <td>
                {story.prioridad ? (
                    <Badge bg={getPriorityVariant(story.prioridad)}>{labelFor(PRIORITIES, story.prioridad)}</Badge>
                ) : '—'}
            </td>
            <td className="text-center fw-semibold">{story.story_points ?? '—'}</td>
            <td className="small">{getEpicLabel(story)}</td>
            <td className="text-end">{action}</td>
        </tr>
    );

    if (!sortedSprints.length) {
        return (
            <div className="text-center py-5">
                <p className="text-muted mb-3">No hay sprints creados. Creá el primero para planificar.</p>
                {puedeGestionar && (
                    <Button variant="primary" onClick={() => { setEditingSprint(null); setShowForm(true); }}>
                        <i className="bi bi-plus-lg me-1" /> Nuevo sprint
                    </Button>
                )}
                <SprintFormModal
                    show={showForm}
                    onHide={() => setShowForm(false)}
                    sprint={editingSprint}
                    usuarios={usuariosLista}
                    onSave={handleSaveSprint}
                    saving={saving}
                    readOnly={!puedeGestionar}
                />
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h5 className="blue mb-1">Planificación de Sprint</h5>
                    <p className="text-muted small mb-0">Selección de historias y control de capacidad del equipo</p>
                </div>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                    <Form.Control
                        as="select"
                        style={{ minWidth: 220 }}
                        value={selectedId || ''}
                        onChange={(e) => setSelectedId(parseInt(e.target.value, 10))}
                    >
                        {sortedSprints.map((sp) => (
                            <option key={sp.id} value={sp.id}>
                                {sp.codigo || sp.nombre} — {labelFor(SPRINT_STATES, sp.estado)}
                            </option>
                        ))}
                    </Form.Control>
                    {puedeGestionar && (
                        <>
                            <Button variant="outline-primary" size="sm" onClick={() => { setEditingSprint(sprint); setShowForm(true); }}>
                                Editar sprint
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => { setEditingSprint(null); setShowForm(true); }}>
                                <i className="bi bi-plus-lg me-1" /> Nuevo sprint
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {loadingPlanning ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : sprint ? (
                <>
                    <Row className="g-3 mb-4">
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <div className="text-muted small">Sprint</div>
                                    <div className="fw-bold">{sprint.nombre}</div>
                                    <div className="small text-muted">{formatSprintDates(sprint.fecha_inicio, sprint.fecha_fin)}</div>
                                    <div className="mt-2">{estadoBadge(sprint.estado)}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <div className="text-muted small">Objetivo</div>
                                    <div className="small">{sprint.objetivo || 'Sin definir'}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <div className="text-muted small">Capacidad del equipo</div>
                                    <div className="fs-4 fw-bold">{capacidad} <span className="fs-6 text-muted">pts</span></div>
                                    <div className="small text-muted">{usuariosLista.length} miembro(s) en proyecto</div>
                                    {capacidad === 0 && isPlanificable && (
                                        <div className="small text-warning mt-1">
                                            <i className="bi bi-exclamation-triangle me-1" />
                                            Definila en Editar sprint
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <div className="text-muted small">Puntos comprometidos</div>
                                    <div className="fs-4 fw-bold text-primary">{comprometidos} <span className="fs-6 text-muted">pts</span></div>
                                    <div className="small text-muted">{capacityPct}% de capacidad</div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {isPlanificable && capacidad > 0 && (
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-2 small">
                                    <span>{comprometidos} / {capacidad} puntos comprometidos</span>
                                    {planning.overCapacity ? (
                                        <Badge bg="danger">Sobre capacidad</Badge>
                                    ) : planning.nearCapacity ? (
                                        <Badge bg="warning" text="dark">Cerca del límite (95%)</Badge>
                                    ) : (
                                        <Badge bg="success">Dentro de capacidad</Badge>
                                    )}
                                </div>
                                <ProgressBar
                                    now={Math.min(capacityPct, 100)}
                                    variant={planning.overCapacity ? 'danger' : planning.nearCapacity ? 'warning' : 'success'}
                                    style={{ height: 10 }}
                                />
                            </Card.Body>
                        </Card>
                    )}

                    {isActive && (
                        <Alert variant="info" className="py-2 small">
                            Sprint <strong>activo</strong>. Las historias están en ejecución. Podés cerrar el sprint cuando finalice el ciclo.
                        </Alert>
                    )}

                    <Tabs activeKey={activeSprintTab} onSelect={(k) => setActiveSprintTab(k)} className="mb-3">
                        <Tab eventKey="planificacion" title="Planificación">
                            {isPlanificable && !planning?.readyStories?.length && (
                                <Alert variant="info" className="py-2 small mb-3">
                                    <i className="bi bi-info-circle me-1" />
                                    No hay historias <strong>Ready</strong> disponibles. Las historias deben estar en estado <strong>Ready</strong> (desde el backlog) para poder asignarlas al sprint.
                                </Alert>
                            )}
                            {isPlanificable && (
                                <Row className="g-3 mb-4">
                                    <Col lg={6}>
                                        <Card className="border-0 shadow-sm h-100">
                                            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                                <strong className="small">Historias Ready</strong>
                                                <Form.Control
                                                    size="sm"
                                                    placeholder="Filtrar..."
                                                    style={{ maxWidth: 160 }}
                                                    value={readyFilter}
                                                    onChange={(e) => setReadyFilter(e.target.value)}
                                                />
                                            </Card.Header>
                                            <Card.Body className="p-0">
                                                <Table responsive hover size="sm" className="mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Código</th><th>Historia</th><th>Prioridad</th>
                                                            <th>SP</th><th>Épica</th><th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredReady.map((story) => renderStoryRow(story,
                                                            puedeGestionar && (
                                                                <Button variant="outline-success" size="sm" onClick={() => handleAssign(story.id)} title="Agregar al sprint">
                                                                    <i className="bi bi-plus-lg" />
                                                                </Button>
                                                            ),
                                                        ))}
                                                        {filteredReady.length === 0 && (
                                                            <tr><td colSpan={6} className="text-center text-muted small py-3">No hay historias Ready disponibles</td></tr>
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col lg={6}>
                                        <Card className="border-0 shadow-sm h-100">
                                            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                                <strong className="small">Sprint seleccionado</strong>
                                                {puedeGestionar && (planning?.sprintStories?.length > 0) && (
                                                    <Button variant="link" size="sm" className="text-danger p-0" onClick={handleClear}>
                                                        Vaciar sprint
                                                    </Button>
                                                )}
                                            </Card.Header>
                                            <Card.Body className="p-0">
                                                <Table responsive hover size="sm" className="mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Código</th><th>Historia</th><th>Prioridad</th>
                                                            <th>SP</th><th>Épica</th><th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(planning?.sprintStories || []).map((story) => renderStoryRow(story,
                                                            puedeGestionar && (
                                                                <Button variant="outline-danger" size="sm" onClick={() => handleRemove(story.id)} title="Quitar del sprint">
                                                                    <i className="bi bi-x-lg" />
                                                                </Button>
                                                            ),
                                                        ))}
                                                        {!(planning?.sprintStories?.length) && (
                                                            <tr><td colSpan={6} className="text-center text-muted small py-3">Agregá historias desde la columna izquierda</td></tr>
                                                        )}
                                                    </tbody>
                                                </Table>
                                                <div className="p-2 border-top small text-muted">
                                                    Total comprometido: <strong>{comprometidos} pts</strong>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            )}

                            {isActive && (planning?.sprintStories?.length > 0) && (
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Header className="bg-white"><strong className="small">Historias del sprint activo</strong></Card.Header>
                                    <Card.Body className="p-0">
                                        <Table responsive size="sm" className="mb-0">
                                            <thead className="table-light">
                                                <tr><th>Código</th><th>Historia</th><th>SP</th><th>Estado</th><th>Épica</th></tr>
                                            </thead>
                                            <tbody>
                                                {planning.sprintStories.map((s) => (
                                                    <tr key={s.id}>
                                                        <td><code>{s.codigo}</code></td>
                                                        <td>{s.titulo}</td>
                                                        <td>{s.story_points ?? '—'}</td>
                                                        <td><Badge bg="dark">{s.estado}</Badge></td>
                                                        <td>{getEpicLabel(s)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            )}

                            {isClosed && !planning?.sprintStories?.length && (
                                <Alert variant="secondary" className="small">
                                    Este sprint no tiene historias asignadas.
                                </Alert>
                            )}

                            <Row className="g-3 mb-4">
                                <Col md={4}>
                                    <Card className="border-0 shadow-sm h-100">
                                        <Card.Header className="bg-white fw-semibold small">Equipo del sprint</Card.Header>
                                        <Card.Body className="small">
                                            <div className="mb-2">
                                                <span className="text-muted">Product Owner:</span><br />
                                                <strong>{getSprintUserName(sprint.ProductOwner)}</strong>
                                            </div>
                                            <div>
                                                <span className="text-muted">Scrum Master:</span><br />
                                                <strong>{getSprintUserName(sprint.ScrumMaster)}</strong>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="border-0 shadow-sm h-100">
                                        <Card.Header className="bg-white fw-semibold small">Checklist de activación</Card.Header>
                                        <Card.Body className="small p-0">
                                            <ul className="list-group list-group-flush">
                                                {planning?.checklist && Object.entries(CHECKLIST_LABELS).map(([key, label]) => (
                                                    <li key={key} className="list-group-item d-flex align-items-center py-2">
                                                        <i className={`bi ${planning.checklist[key] ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'} me-2`} />
                                                        {label}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="border-0 shadow-sm h-100">
                                        <Card.Header className="bg-white fw-semibold small">Acciones</Card.Header>
                                        <Card.Body className="d-flex flex-column gap-2">
                                            {puedeGestionar && isPlanificable && (
                                                <Button variant="success" onClick={handleActivate}>
                                                    <i className="bi bi-play-fill me-1" /> Activar sprint
                                                </Button>
                                            )}
                                            {puedeGestionar && isActive && (
                                                <Button variant="outline-primary" onClick={() => setShowCloseModal(true)}>
                                                    <i className="bi bi-check2-circle me-1" /> Cerrar sprint
                                                </Button>
                                            )}
                                            {isClosed && (
                                                <Alert variant="secondary" className="mb-0 py-2 small">
                                                    Sprint cerrado. {sprint.comentarios_cierre || ''}
                                                </Alert>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Tab>

                        {canShowScrumban && (
                            <Tab eventKey="scrumban" title="Scrumban">
                                <ScrumBan
                                    projectId={projectId}
                                    sprintStories={planning?.sprintStories || []}
                                    onMove={(storyId, newCol) => {
                                        const updated = (planning?.sprintStories || []).map((s) =>
                                            s.id === storyId ? { ...s, kanban_column: newCol } : s,
                                        );
                                        setPlanning({ ...planning, sprintStories: updated });
                                    }}
                                />
                            </Tab>
                        )}

                        {canShowMetrics && (
                            <Tab eventKey="metricas" title="Métricas">
                                <Row className="g-3 mb-4">
                                    <Col md={4}>
                                        <Card className="border-0 shadow-sm h-100">
                                            <Card.Body>
                                                <div className="text-muted small">Velocidad del equipo</div>
                                                <div className="fs-3 fw-bold text-primary">
                                                    {comprometidos} <span className="fs-6 text-muted">pts</span>
                                                </div>
                                                <div className="small text-muted">Puntos comprometidos en este sprint</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={4}>
                                        <Card className="border-0 shadow-sm h-100">
                                            <Card.Body>
                                                <div className="text-muted small">Puntos completados</div>
                                                <div className="fs-3 fw-bold text-success">
                                                    {planning?.sprintStories?.filter((s) => s.kanban_column === 'done').reduce((a, s) => a + (Number(s.story_points) || 0), 0) || 0}
                                                    {' '}<span className="fs-6 text-muted">pts</span>
                                                </div>
                                                <div className="small text-muted">
                                                    {comprometidos > 0
                                                        ? `${Math.round((planning?.sprintStories?.filter((s) => s.kanban_column === 'done').reduce((a, s) => a + (Number(s.story_points) || 0), 0) || 0) / comprometidos * 100)}% completado`
                                                        : 'Sin datos'}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={4}>
                                        <Card className="border-0 shadow-sm h-100">
                                            <Card.Body>
                                                <div className="text-muted small">Historias</div>
                                                <div className="fs-3 fw-bold">
                                                    {planning?.sprintStories?.length || 0}
                                                </div>
                                                <div className="small text-muted">
                                                    {planning?.sprintStories?.filter((s) => s.kanban_column === 'done').length || 0} terminadas
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                                {planning?.sprintStories && (
                                    <Card className="border-0 shadow-sm">
                                        <Card.Header className="bg-white fw-semibold small">Detalle por historia</Card.Header>
                                        <Card.Body className="p-0">
                                            <Table responsive size="sm" className="mb-0">
                                                <thead className="table-light">
                                                    <tr><th>Código</th><th>Historia</th><th>SP</th><th>Estado Kanban</th><th>Prioridad</th><th>Épica</th></tr>
                                                </thead>
                                                <tbody>
                                                    {planning.sprintStories.map((s) => (
                                                        <tr key={s.id}>
                                                            <td><code>{s.codigo}</code></td>
                                                            <td>{s.titulo}</td>
                                                            <td>{s.story_points ?? '—'}</td>
                                                            <td><Badge bg={s.kanban_column === 'done' ? 'success' : s.kanban_column === 'doing' ? 'primary' : 'secondary'}>{s.kanban_column || 'todo'}</Badge></td>
                                                            <td><Badge bg="info">{s.prioridad || '—'}</Badge></td>
                                                            <td className="small">{getEpicLabel(s)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                )}
                            </Tab>
                        )}
                    </Tabs>
                </>
            ) : null}

            <SprintFormModal
                show={showForm}
                onHide={() => setShowForm(false)}
                sprint={editingSprint}
                usuarios={usuariosLista}
                onSave={handleSaveSprint}
                saving={saving}
                readOnly={!puedeGestionar}
            />

            <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Cerrar sprint</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Comentarios de cierre (opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={closeComment}
                            onChange={(e) => setCloseComment(e.target.value)}
                        />
                    </Form.Group>
                    <Alert variant="warning" className="small mt-3 mb-0">
                        Las historias no completadas volverán al backlog en estado Ready.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCloseModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleClose}>Cerrar sprint</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
