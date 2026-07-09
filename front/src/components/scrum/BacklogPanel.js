import React, { useEffect, useMemo, useState } from 'react';
import {
    Row, Col, Form, Button, Table, Card, ButtonGroup, Alert, Modal, Tabs, Tab, Pagination,
} from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import moment from 'moment';
import EpicPanel from './EpicPanel';
import EpicFormModal from './EpicFormModal';
import StoryFormModal from './StoryFormModal';
import BacklogSidebar from './BacklogSidebar';
import ScrumPill, { PriorityPill, EstadoPill, TipoPill } from './ScrumPill';
import {
    STORY_TYPES, STORY_STATES, PRIORITIES, PRIORIZATION_METHODS, WARNING_PILL_STYLE, labelFor,
} from './scrumConstants';
import {
    filterStories, getAssigneeName, getAssigneeInitials, getEpicLabel, getSprintLabel,
    getUsuarioLabel, getValorEsfuerzoRatio, getQuadrantLabel,
    normalizeUsuariosProyecto, storiesToCsv, openBacklogPrintPdf,
} from './scrumHelpers';
import * as Api from '../../api';
import { actions as scrumActions } from '../../reducers/scrum';

const PAGE_SIZE = 12;

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

function AssigneeCell({ story }) {
    const name = getAssigneeName(story);
    const initials = getAssigneeInitials(story);
    if (name === '—') return <span className="text-muted">—</span>;
    return (
        <div className="d-flex align-items-center">
            <span
                className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center me-2 flex-shrink-0"
                style={{ width: 28, height: 28, fontSize: 11, fontWeight: 600 }}
            >
                {initials}
            </span>
            <span className="small text-truncate">{name}</span>
        </div>
    );
}

function StoryTableCells({ story, onOpen, puedeGestionar, onDuplicate, onArchive, onDelete, showArchived }) {
    const prioridad = story.prioridad;
    return (
        <>
            <td><code className="small">{story.codigo}</code></td>
            <td><TipoPill tipo={story.tipo} /></td>
            <td>
                <Button variant="link" className="p-0 text-start text-decoration-none" onClick={() => onOpen(story)}>
                    {story.titulo}
                </Button>
                {!story.story_points && !showArchived && (
                    <ScrumPill label="Sin SP" style={WARNING_PILL_STYLE} className="ms-1" />
                )}
            </td>
            <td className="small">{getEpicLabel(story)}</td>
            <td><PriorityPill prioridad={prioridad} /></td>
            <td className="text-center">{story.valor_negocio ?? '—'}</td>
            <td className="text-center fw-semibold">{story.story_points ?? '—'}</td>
            <td><EstadoPill estado={story.estado} /></td>
            <td className="small">{getSprintLabel(story)}</td>
            <td><AssigneeCell story={story} /></td>
            {puedeGestionar && (
                <td className="text-nowrap">
                    {!showArchived ? (
                        <>
                            <Button variant="link" size="sm" className="p-0 me-1" onClick={() => onDuplicate(story)} title="Duplicar">
                                <i className="bi bi-copy" />
                            </Button>
                            <Button variant="link" size="sm" className="p-0 me-1 text-warning" onClick={() => onArchive(story)} title="Archivar">
                                <i className="bi bi-archive" />
                            </Button>
                            <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => onDelete(story)} title="Eliminar">
                                <i className="bi bi-trash" />
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline-success" size="sm" onClick={() => onArchive(story)}>
                            Restaurar
                        </Button>
                    )}
                </td>
            )}
        </>
    );
}

export default function BacklogPanel({
    projectId,
    projectName,
    epics,
    stories,
    archivedStories,
    sprints,
    stats,
    config,
    usuarios,
    puedeGestionar,
    dispatch,
}) {
    const [viewMode, setViewMode] = useState('table');
    const [subView, setSubView] = useState('backlog');
    const [activeTab, setActiveTab] = useState('historias');
    const [showArchived, setShowArchived] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '', tipo: '', estado: '', prioridad: '', epic_id: '', sprint_id: '', asignado_a: '',
    });
    const [showEpicModal, setShowEpicModal] = useState(false);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [selectingMethod, setSelectingMethod] = useState(false);
    const [editingEpic, setEditingEpic] = useState(null);
    const [editingStory, setEditingStory] = useState(null);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [confirmArchive, setConfirmArchive] = useState(null);

    useEffect(() => {
        setPage(1);
    }, [filters, showArchived, viewMode]);

    const usuariosLista = useMemo(() => normalizeUsuariosProyecto(usuarios), [usuarios]);
    const sourceStories = showArchived
        ? archivedStories
        : (stories || []).filter((s) => s.estado !== 'done');
    const filtered = useMemo(() => filterStories(sourceStories, filters), [sourceStories, filters]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const canDrag = puedeGestionar && !showArchived && filtered.length <= PAGE_SIZE;
    const csvData = useMemo(() => storiesToCsv(filtered, epics, sprints), [filtered, epics, sprints]);

    const refresh = (includeArchived = showArchived) =>
        dispatch(scrumActions.fetch({ projectId, includeArchived }));

    const handleToggleArchived = () => {
        const next = !showArchived;
        setShowArchived(next);
        dispatch(scrumActions.fetch({ projectId, includeArchived: next }));
    };

    const handleSaveEpic = async (payload) => {
        setSaving(true);
        try {
            if (editingEpic?.id) {
                await Api.updateScrumEpic(projectId, editingEpic.id, payload);
                toast.success('Épica actualizada');
            } else {
                await Api.createScrumEpic(projectId, payload);
                toast.success('Épica creada');
            }
            setShowEpicModal(false);
            refresh();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al guardar épica');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveStory = async (payload) => {
        setSaving(true);
        try {
            if (editingStory?.id) {
                await Api.updateScrumStory(projectId, editingStory.id, payload);
                toast.success('Historia actualizada');
            } else {
                await Api.createScrumStory(projectId, payload);
                toast.success('Historia creada');
            }
            setShowStoryModal(false);
            refresh();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al guardar historia');
        } finally {
            setSaving(false);
        }
    };

    const handleDuplicate = async (story) => {
        try {
            await Api.duplicateScrumStory(projectId, story.id);
            toast.success('Historia duplicada');
            refresh();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al duplicar');
        }
    };

    const doArchive = async (story) => {
        try {
            await Api.archiveScrumStory(projectId, story.id);
            toast.success('Historia archivada');
            setConfirmArchive(null);
            refresh(true);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al archivar');
        }
    };

    const doUnarchive = async (story) => {
        try {
            await Api.unarchiveScrumStory(projectId, story.id);
            toast.success('Historia restaurada');
            refresh(true);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al restaurar');
        }
    };

    const handleArchive = (story) => {
        if (showArchived) {
            doUnarchive(story);
        } else {
            setConfirmArchive(story);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            if (confirmDelete.type === 'epic') {
                await Api.deleteScrumEpic(projectId, confirmDelete.item.id);
                toast.success('Épica eliminada');
            } else {
                await Api.deleteScrumStory(projectId, confirmDelete.item.id);
                toast.success('Historia eliminada');
            }
            setConfirmDelete(null);
            refresh();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al eliminar');
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination || !canDrag) return;
        const reordered = reorder(filtered, result.source.index, result.destination.index);
        try {
            await Api.reorderScrumStories(projectId, reordered.map((s) => s.id));
            refresh();
        } catch (e) {
            toast.error('Error al reordenar backlog');
        }
    };

    const handleRecalculate = async () => {
        const metodo = config?.metodo_priorizacion || 'puntuacion';
        try {
            await Api.recalculateScrumPriorities(projectId, metodo);
            toast.success('Prioridades recalculadas según ' + labelFor(PRIORIZATION_METHODS, metodo));
            refresh();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al recalcular');
        }
    };

    const handleSelectMethod = async (metodo) => {
        setSelectingMethod(true);
        try {
            await Api.updateScrumConfig(projectId, { metodo_priorizacion: metodo });
            await Api.recalculateScrumPriorities(projectId, metodo);
            toast.success(`Método seleccionado: ${labelFor(PRIORIZATION_METHODS, metodo)}`);
            setShowMethodModal(false);
            refresh();
            setEditingStory(null);
            setShowStoryModal(true);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al seleccionar método');
        } finally {
            setSelectingMethod(false);
        }
    };

    const handleNewStory = () => {
        if (!config || config.metodo_priorizacion === 'manual') {
            setShowMethodModal(true);
        } else {
            setEditingStory(null);
            setShowStoryModal(true);
        }
    };

    const openStory = (story) => {
        setEditingStory(story);
        setShowStoryModal(true);
    };

    const renderPagination = () => {
        if (filtered.length <= PAGE_SIZE) return null;
        const from = (page - 1) * PAGE_SIZE + 1;
        const to = Math.min(page * PAGE_SIZE, filtered.length);
        return (
            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                <span className="small text-muted">
                    Mostrando {from} – {to} de {filtered.length} historias
                </span>
                <Pagination size="sm" className="mb-0">
                    <Pagination.Prev disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                                {idx > 0 && arr[idx - 1] !== p - 1 && <Pagination.Ellipsis disabled />}
                                <Pagination.Item active={p === page} onClick={() => setPage(p)}>{p}</Pagination.Item>
                            </React.Fragment>
                        ))}
                    <Pagination.Next disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} />
                </Pagination>
            </div>
        );
    };

    const tableHeader = (
        <thead className="table-light">
            <tr>
                {canDrag && <th style={{ width: 28 }} />}
                <th>Código</th>
                <th>Tipo</th>
                <th>Historia</th>
                <th>Épica</th>
                <th>Prioridad</th>
                <th className="text-center">Valor</th>
                <th className="text-center">Story Points</th>
                <th>Estado</th>
                <th>Sprint</th>
                <th>Responsable</th>
                {puedeGestionar && <th style={{ width: 80 }} />}
            </tr>
        </thead>
    );

    const renderTable = (rows, droppableId) => {
        const body = rows.map((story, index) => {
            const cells = (
                <StoryTableCells
                    story={story}
                    onOpen={openStory}
                    puedeGestionar={puedeGestionar}
                    onDuplicate={handleDuplicate}
                    onArchive={handleArchive}
                    onDelete={(s) => setConfirmDelete({ type: 'story', item: s })}
                    showArchived={showArchived}
                />
            );
            if (canDrag) {
                return (
                    <Draggable key={story.id} draggableId={String(story.id)} index={index}>
                        {(dragProvided) => (
                            <tr ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                                <td {...dragProvided.dragHandleProps} className="text-muted" style={{ cursor: 'grab' }}>⋮⋮</td>
                                {cells}
                            </tr>
                        )}
                    </Draggable>
                );
            }
            return <tr key={story.id}>{cells}</tr>;
        });

        if (canDrag) {
            return (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId={droppableId}>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                <Table responsive hover size="sm" className="bg-white shadow-sm mb-0">
                                    {tableHeader}
                                    <tbody>{body}{provided.placeholder}</tbody>
                                </Table>
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            );
        }

        return (
            <Table responsive hover size="sm" className="bg-white shadow-sm mb-0">
                {tableHeader}
                <tbody>{body}</tbody>
            </Table>
        );
    };

    const metodoLabel = labelFor(PRIORIZATION_METHODS, config?.metodo_priorizacion || 'puntuacion');

    const renderPriorizacion = () => (
        <div>
            <Alert variant="info" className="py-2 small mb-3">
                <i className="bi bi-info-circle me-1" />
                Método de priorización del proyecto: <strong>{metodoLabel}</strong>.
                Presioná <strong>Recalcular prioridad</strong> para reordenar la lista de mayor a menor según este criterio.
            </Alert>
            <Row className="mb-3 align-items-end">
                <Col md="auto">
                    {puedeGestionar && (
                        <Button variant="success" onClick={handleRecalculate}>
                            <i className="bi bi-sort-down me-1" /> Recalcular prioridad
                        </Button>
                    )}
                </Col>
            </Row>
            <Row>
                <Col lg={8}>
                    <Table responsive size="sm" hover className="bg-white shadow-sm">
                        <thead className="table-light">
                            <tr>
                                <th>#</th><th>Código</th><th>Título</th><th>Valor</th>
                                <th>Esfuerzo (SP)</th>
                                {config?.metodo_priorizacion === 'puntuacion' && <th>Puntuación</th>}
                                {config?.metodo_priorizacion === 'moscow' && <th>MoSCoW</th>}
                                {config?.metodo_priorizacion === 'valor_esfuerzo' && <th>Ratio V/E</th>}
                                {config?.metodo_priorizacion === 'valor_esfuerzo' && <th>Cuadrante</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, i) => {
                                const ratio = getValorEsfuerzoRatio(s);
                                const cuadrante = config?.metodo_priorizacion === 'valor_esfuerzo' ? getQuadrantLabel(s) : null;
                                return (
                                    <tr key={s.id}>
                                        <td>{i + 1}</td>
                                        <td>{s.codigo}</td>
                                        <td>{s.titulo}</td>
                                        <td>{s.valor_negocio ?? '—'}</td>
                                        <td>{s.story_points ?? '—'}</td>
                                        {config?.metodo_priorizacion === 'puntuacion' && <td><strong>{s.prioridad_score ?? '—'}</strong></td>}
                                        {config?.metodo_priorizacion === 'moscow' && <td>{s.moscow || '—'}</td>}
                                        {config?.metodo_priorizacion === 'valor_esfuerzo' && <td>{ratio != null ? ratio.toFixed(2) : '—'}</td>}
                                        {config?.metodo_priorizacion === 'valor_esfuerzo' && <td className="small">{cuadrante || '—'}</td>}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Col>
                <Col lg={4}>
                    <BacklogSidebar stories={filtered} metodo={config?.metodo_priorizacion || 'puntuacion'} />
                </Col>
            </Row>
        </div>
    );

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h5 className="blue mb-1">Backlog del Producto</h5>
                    <p className="text-muted small mb-0">Gestión y priorización de épicas e historias de usuario</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    {puedeGestionar && (
                        <>
                            <Button variant="primary" onClick={handleNewStory}>
                                <i className="bi bi-plus-lg me-1" /> Nueva historia
                            </Button>
                            <Button variant="outline-primary" onClick={() => { setEditingEpic(null); setShowEpicModal(true); }}>
                                <i className="bi bi-plus-lg me-1" /> Nueva épica
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => setSubView(subView === 'priorizacion' ? 'backlog' : 'priorizacion')}
                            >
                                <i className="bi bi-sort-down me-1" /> Priorizar backlog
                            </Button>
                        </>
                    )}
                    <CSVLink
                        data={csvData}
                        filename={`Backlog_${projectName}_${moment().format('YYYYMMDD')}.csv`}
                        className="btn btn-outline-secondary btn-sm"
                    >
                        Excel (CSV)
                    </CSVLink>
                    <Button variant="outline-secondary" size="sm" onClick={() => openBacklogPrintPdf(filtered, projectName)}>
                        PDF
                    </Button>
                </div>
            </div>

            {!showArchived && (
                <Row className="g-3 mb-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="text-muted small">Historias totales</div>
                                <div className="fs-3 fw-bold text-primary">{stats?.totalStories ?? 0}</div>
                                <div className="small text-muted">Backlog activo</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="text-muted small">Historias Ready</div>
                                <div className="fs-3 fw-bold text-success">{stats?.storiesReady ?? 0}</div>
                                <div className="small text-muted">{stats?.storiesReadyPct ?? 0}% del backlog</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="text-muted small">Puntos sin estimar</div>
                                <div className="fs-3 fw-bold text-warning">{stats?.unestimatedStories ?? 0}</div>
                                <div className="small text-muted">{stats?.readyPoints ?? 0} pts ready</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="text-muted small">Épicas activas</div>
                                <div className="fs-3 fw-bold">{stats?.activeEpics ?? 0}</div>
                                <div className="small text-muted">{stats?.totalEpics ?? 0} épicas en total</div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {subView === 'priorizacion' ? renderPriorizacion() : (
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                    <Tab eventKey="epicas" title={`Épicas (${epics.length})`}>
                        <EpicPanel
                            epics={epics}
                            puedeGestionar={puedeGestionar}
                            onCreate={() => { setEditingEpic(null); setShowEpicModal(true); }}
                            onEdit={(ep) => { setEditingEpic(ep); setShowEpicModal(true); }}
                            onDelete={(ep) => setConfirmDelete({ type: 'epic', item: ep })}
                        />
                    </Tab>
                    <Tab eventKey="historias" title="Historias">
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body className="py-3">
                                <Row className="g-2 align-items-center">
                                    <Col md={4}>
                                        <Form.Control
                                            placeholder="Buscar historias..."
                                            value={filters.search}
                                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Form.Control as="select" value={filters.prioridad} onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}>
                                            <option value="">Prioridad</option>
                                            {PRIORITIES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </Form.Control>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Control as="select" value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
                                            <option value="">Estado</option>
                                            {STORY_STATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </Form.Control>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Control as="select" value={filters.epic_id} onChange={(e) => setFilters({ ...filters, epic_id: e.target.value })}>
                                            <option value="">Épica</option>
                                            {epics.map((e) => <option key={e.id} value={e.id}>{e.codigo} — {e.nombre}</option>)}
                                        </Form.Control>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Control as="select" value={filters.sprint_id} onChange={(e) => setFilters({ ...filters, sprint_id: e.target.value })}>
                                            <option value="">Sprint</option>
                                            <option value="none">Sin sprint</option>
                                            {sprints.map((sp) => (
                                                <option key={sp.id} value={sp.id}>{sp.nombre || sp.codigo}</option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                </Row>
                                <Row className="g-2 mt-2 align-items-center">
                                    <Col md={3}>
                                        <Form.Control as="select" value={filters.asignado_a} onChange={(e) => setFilters({ ...filters, asignado_a: e.target.value })}>
                                            <option value="">Responsable</option>
                                            {usuariosLista.map((u) => (
                                                <option key={u.usuario_id} value={u.usuario_id}>{getUsuarioLabel(u)}</option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Control as="select" value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}>
                                            <option value="">Tipo</option>
                                            {STORY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </Form.Control>
                                    </Col>
                                    <Col md={7} className="d-flex flex-wrap gap-2 justify-content-md-end align-items-center">
                                        <ButtonGroup size="sm">
                                            <Button variant={viewMode === 'table' ? 'secondary' : 'outline-secondary'} onClick={() => setViewMode('table')}>Tabla</Button>
                                            <Button variant={viewMode === 'cards' ? 'secondary' : 'outline-secondary'} onClick={() => setViewMode('cards')}>Tarjetas</Button>
                                        </ButtonGroup>
                                        <Form.Check
                                            type="switch"
                                            id="toggle-archived"
                                            label={`Archivados (${stats?.archivedStories ?? archivedStories.length})`}
                                            checked={showArchived}
                                            onChange={handleToggleArchived}
                                            className="small ms-2"
                                        />
                                        {!canDrag && !showArchived && filtered.length > PAGE_SIZE && (
                                            <span className="small text-muted">Reordenar: ver ≤{PAGE_SIZE} ítems</span>
                                        )}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {showArchived && (
                            <Alert variant="info" className="py-2 small">
                                Mostrando historias archivadas. Podés restaurarlas al backlog activo.
                            </Alert>
                        )}

                        <Row>
                            <Col lg={viewMode === 'table' ? 8 : 12}>
                                {viewMode === 'table' ? (
                                    <>
                                        {renderTable(paginated, 'backlog-table')}
                                        {renderPagination()}
                                    </>
                                ) : (
                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="backlog-cards" direction="horizontal">
                                            {(provided) => (
                                                <Row ref={provided.innerRef} {...provided.droppableProps} className="g-3">
                                                    {paginated.map((story, index) => (
                                                        <Col md={4} key={story.id}>
                                                            <Draggable draggableId={`card-${story.id}`} index={index} isDragDisabled={!canDrag}>
                                                                {(dragProvided) => (
                                                                    <Card
                                                                        ref={dragProvided.innerRef}
                                                                        {...dragProvided.draggableProps}
                                                                        {...dragProvided.dragHandleProps}
                                                                        className="h-100 shadow-sm"
                                                                    >
                                                                        <Card.Body>
                                                                            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                                                                <code>{story.codigo}</code>
                                                                                <div className="d-flex gap-1">
                                                                                    <TipoPill tipo={story.tipo} />
                                                                                    <PriorityPill prioridad={story.prioridad} />
                                                                                </div>
                                                                            </div>
                                                                            <Card.Title className="h6">{story.titulo}</Card.Title>
                                                                            <div className="small text-muted mb-2">
                                                                                {getEpicLabel(story)} · SP: {story.story_points ?? '—'} · {getSprintLabel(story)}
                                                                            </div>
                                                                            <AssigneeCell story={story} />
                                                                            <Button variant="outline-primary" size="sm" className="mt-2" onClick={() => openStory(story)}>
                                                                                Abrir
                                                                            </Button>
                                                                        </Card.Body>
                                                                    </Card>
                                                                )}
                                                            </Draggable>
                                                        </Col>
                                                    ))}
                                                    {provided.placeholder}
                                                </Row>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                )}

                                {filtered.length === 0 && (
                                    <Alert variant="secondary" className="text-center">
                                        {showArchived ? 'No hay historias archivadas.' : 'No hay ítems en el backlog con los filtros actuales.'}
                                    </Alert>
                                )}
                            </Col>
                            {viewMode === 'table' && !showArchived && (
                                <Col lg={4} className="d-none d-lg-block">
                                    <BacklogSidebar stories={filtered} metodo={config?.metodo_priorizacion || 'puntuacion'} />
                                </Col>
                            )}
                        </Row>
                    </Tab>
                </Tabs>
            )}

            <EpicFormModal
                show={showEpicModal}
                onHide={() => setShowEpicModal(false)}
                epic={editingEpic}
                usuarios={usuarios}
                onSave={handleSaveEpic}
                saving={saving}
                readOnly={!puedeGestionar}
            />

            <Modal show={showMethodModal} backdrop="static" keyboard={false} centered size="lg">
                <Modal.Header>
                    <Modal.Title>Seleccionar método de priorización</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted small mb-3">
                        Para crear una historia primero debés seleccionar el método de priorización del proyecto.
                        <strong> Esta elección es definitiva</strong> y no podrá cambiarse después.
                    </p>
                    <div className="row g-3">
                        {PRIORIZATION_METHODS.map((m) => (
                            <div className="col-md-4" key={m.value}>
                                <Card
                                    className={`border-0 shadow-sm h-100 text-center ${selectingMethod ? 'pe-none opacity-50' : ''}`}
                                    role="button"
                                    onClick={() => !selectingMethod && handleSelectMethod(m.value)}
                                >
                                    <Card.Body className="d-flex flex-column align-items-center py-4">
                                        <div className="fs-1 mb-2 text-primary">
                                            {m.value === 'puntuacion' ? <i className="bi bi-123" /> : null}
                                            {m.value === 'moscow' ? <i className="bi bi-bar-chart" /> : null}
                                            {m.value === 'valor_esfuerzo' ? <i className="bi bi-grid-3x3" /> : null}
                                        </div>
                                        <h6 className="mb-1">{m.label}</h6>
                                        <small className="text-muted">
                                            {m.value === 'puntuacion' ? 'Valor + urgencia + riesgo − complejidad − esfuerzo' : null}
                                            {m.value === 'moscow' ? 'Must / Should / Could / Won\'t' : null}
                                            {m.value === 'valor_esfuerzo' ? 'Matriz 2×2 valor vs esfuerzo' : null}
                                        </small>
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>

            <StoryFormModal
                show={showStoryModal}
                onHide={() => setShowStoryModal(false)}
                story={editingStory}
                epics={epics}
                sprints={sprints}
                usuarios={usuarios}
                metodoPriorizacion={config?.metodo_priorizacion || 'puntuacion'}
                onSave={handleSaveStory}
                saving={saving}
                readOnly={!puedeGestionar}
            />

            <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)} centered>
                <Modal.Header closeButton><Modal.Title>Confirmar eliminación</Modal.Title></Modal.Header>
                <Modal.Body>¿Eliminar {confirmDelete?.type === 'epic' ? 'la épica' : 'la historia'} <strong>{confirmDelete?.item?.nombre || confirmDelete?.item?.titulo}</strong>?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={!!confirmArchive} onHide={() => setConfirmArchive(null)} centered>
                <Modal.Header closeButton><Modal.Title>Archivar historia</Modal.Title></Modal.Header>
                <Modal.Body>
                    ¿Archivar <strong>{confirmArchive?.titulo}</strong>? Dejará de aparecer en el backlog activo pero podés restaurarla después.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmArchive(null)}>Cancelar</Button>
                    <Button variant="warning" onClick={() => doArchive(confirmArchive)}>Archivar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
