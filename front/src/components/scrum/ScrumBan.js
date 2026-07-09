import React, { useState } from 'react';
import { Card, Row, Col, Badge, Alert, Modal, Form, Button } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PriorityPill, TipoPill } from './ScrumPill';
import { getEpicLabel } from './scrumHelpers';
import { toast } from 'react-toastify';
import * as Api from '../../api';

const COLUMNS = [
    { key: 'todo', label: 'Por hacer', variant: 'secondary' },
    { key: 'doing', label: 'En progreso', variant: 'primary' },
    { key: 'done', label: 'Terminado', variant: 'success' },
];

function formatDate(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ScrumBan({ projectId, sprintStories, onMove }) {
    const [saving, setSaving] = useState(false);
    const [closeTarget, setCloseTarget] = useState(null);
    const [closeDate, setCloseDate] = useState(new Date().toISOString().split('T')[0]);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [reopenTarget, setReopenTarget] = useState(null);
    const [showReopenConfirm, setShowReopenConfirm] = useState(false);
    const [showReopenFinal, setShowReopenFinal] = useState(false);

    const storiesByColumn = (colKey) =>
        (sprintStories || []).filter((s) => (s.kanban_column || 'todo') === colKey);

    const handleDragEnd = async (result) => {
        if (!result.destination || saving) return;
        const { draggableId, destination } = result;
        const newCol = destination.droppableId;
        const story = (sprintStories || []).find((s) => String(s.id) === draggableId);
        if (!story || story.kanban_column === newCol) return;

        if (newCol === 'done') {
            setCloseTarget(story);
            setCloseDate(new Date().toISOString().split('T')[0]);
            setShowCloseModal(true);
            return;
        }

        applyMove(story, newCol);
    };

    const applyMove = async (story, newCol, customDate) => {
        const storyId = parseInt(story.id, 10);
        const payload = { kanban_column: newCol };
        if (customDate) {
            payload.estimado_at = customDate;
        }

        if (onMove) onMove(storyId, newCol, customDate);
        setSaving(true);
        try {
            await Api.updateScrumStory(projectId, storyId, payload);
        } catch (e) {
            if (onMove) onMove(storyId, story.kanban_column);
            toast.error('Error al mover la historia');
        } finally {
            setSaving(false);
        }
    };

    const requestReopen = (story) => {
        setReopenTarget(story);
        setShowReopenConfirm(true);
    };

    const confirmReopenFirst = () => {
        setShowReopenConfirm(false);
        setShowReopenFinal(true);
    };

    const executeReopen = async () => {
        if (!reopenTarget) return;
        const storyId = parseInt(reopenTarget.id, 10);
        const payload = { kanban_column: 'doing', estimado_at: null };
        if (onMove) onMove(storyId, 'doing', null);
        setSaving(true);
        try {
            await Api.updateScrumStory(projectId, storyId, payload);
            toast.success(`Historia ${reopenTarget.codigo} reabierta`);
        } catch (e) {
            if (onMove) onMove(storyId, reopenTarget.kanban_column);
            toast.error('Error al reabrir la historia');
        } finally {
            setSaving(false);
            setShowReopenFinal(false);
            setReopenTarget(null);
        }
    };

    const cancelReopen = () => {
        setShowReopenConfirm(false);
        setShowReopenFinal(false);
        setReopenTarget(null);
    };

    const confirmClose = () => {
        if (!closeTarget) return;
        applyMove(closeTarget, 'done', closeDate);
        setShowCloseModal(false);
        setCloseTarget(null);
    };

    if (!sprintStories?.length) {
        return (
            <Alert variant="info" className="small">
                No hay historias en este sprint. Asigná historias desde la pestaña Planificación.
            </Alert>
        );
    }

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Row className="g-3">
                    {COLUMNS.map((col) => {
                        const items = storiesByColumn(col.key);
                        return (
                            <Col md={4} key={col.key}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Header className={`bg-${col.variant} bg-opacity-10 fw-semibold small d-flex justify-content-between`}>
                                        <span>{col.label}</span>
                                        <Badge bg={col.variant}>{items.length}</Badge>
                                    </Card.Header>
                                    <Droppable droppableId={col.key}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                style={{ minHeight: 200 }}
                                                className="p-2"
                                            >
                                                {items.map((story, index) => {
                                                    const isDone = story.kanban_column === 'done';
                                                    return (
                                                        <Draggable
                                                            key={story.id}
                                                            draggableId={String(story.id)}
                                                            index={index}
                                                            isDragDisabled={isDone}
                                                        >
                                                            {(dragProvided) => (
                                                                <div
                                                                    ref={dragProvided.innerRef}
                                                                    {...dragProvided.draggableProps}
                                                                    {...(isDone ? {} : dragProvided.dragHandleProps)}
                                                                    className="mb-2"
                                                                >
                                                                    <Card className={`shadow-sm ${isDone ? 'opacity-75' : ''}`}>
                                                                        <Card.Body className="p-2">
                                                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                                                <code className="small">{story.codigo}</code>
                                                                                <div className="d-flex gap-1">
                                                                                    <TipoPill tipo={story.tipo} />
                                                                                    <PriorityPill prioridad={story.prioridad} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="small fw-semibold mb-1">{story.titulo}</div>
                                                                            <div className="d-flex justify-content-between text-muted" style={{ fontSize: 11 }}>
                                                                                <span>{getEpicLabel(story)}</span>
                                                                                <span>SP: {story.story_points ?? '—'}</span>
                                                                            </div>
                                                                            {story.asignado_a && (
                                                                                <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                                                                                    <i className="bi bi-person me-1" />
                                                                                    {story.Asignado?.username || '—'}
                                                                                </div>
                                                                            )}
                                                                            {story.estimado_at && (
                                                                                <div className="mt-1">
                                                                                    <span className="badge bg-success" style={{ fontSize: 10 }}>
                                                                                        Finalizado: {formatDate(story.estimado_at)}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {isDone && (
                                                                                <div className="mt-2">
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="outline-warning"
                                                                                        className="w-100"
                                                                                        style={{ fontSize: 11 }}
                                                                                        onClick={() => requestReopen(story)}
                                                                                    >
                                                                                        <i className="bi bi-arrow-counterclockwise me-1" />
                                                                                        Reabrir
                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                        </Card.Body>
                                                                    </Card>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </DragDropContext>

            <Modal show={showCloseModal} onHide={() => { setShowCloseModal(false); setCloseTarget(null); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cerrar historia</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Cerrar la historia <strong>{closeTarget?.codigo} — {closeTarget?.titulo}</strong>?</p>
                    <Form.Group>
                        <Form.Label>Fecha de finalización:</Form.Label>
                        <Form.Control
                            type="date"
                            value={closeDate}
                            onChange={(e) => setCloseDate(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowCloseModal(false); setCloseTarget(null); }}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={confirmClose}>
                        Confirmar cierre
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showReopenConfirm} onHide={cancelReopen} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reabrir historia</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Estás seguro de querer reabrir la historia <strong>{reopenTarget?.codigo} — {reopenTarget?.titulo}</strong>?</p>
                    <p className="text-muted small mb-0">Se eliminará la fecha de cierre y volverá a "En progreso" para que puedas moverla nuevamente.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelReopen}>
                        Cancelar
                    </Button>
                    <Button variant="warning" onClick={confirmReopenFirst}>
                        Sí, reabrir
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showReopenFinal} onHide={cancelReopen} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmación final</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">¿Estás completamente seguro? Esta acción quitará la historia de la columna "Terminado" y borrará su fecha de cierre.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelReopen}>
                        No, cancelar
                    </Button>
                    <Button variant="danger" onClick={executeReopen} disabled={saving}>
                        {saving ? 'Reabriendo...' : 'Sí, confirmar reapertura'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
