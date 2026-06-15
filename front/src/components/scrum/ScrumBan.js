import React, { useState } from 'react';
import { Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PriorityPill } from './ScrumPill';
import { getEpicLabel } from './scrumHelpers';
import { toast } from 'react-toastify';
import * as Api from '../../api';

const COLUMNS = [
    { key: 'todo', label: 'Por hacer', variant: 'secondary' },
    { key: 'doing', label: 'En progreso', variant: 'primary' },
    { key: 'done', label: 'Terminado', variant: 'success' },
];

export default function ScrumBan({ projectId, sprintStories, onMove }) {
    const [saving, setSaving] = useState(false);

    const storiesByColumn = (colKey) =>
        (sprintStories || []).filter((s) => (s.kanban_column || 'todo') === colKey);

    const handleDragEnd = async (result) => {
        if (!result.destination || saving) return;
        const { draggableId, destination } = result;
        const newCol = destination.droppableId;
        const story = (sprintStories || []).find((s) => String(s.id) === draggableId);
        if (!story || story.kanban_column === newCol) return;

        const storyId = parseInt(draggableId, 10);
        if (onMove) onMove(storyId, newCol);
        setSaving(true);
        try {
            await Api.updateScrumStory(projectId, storyId, { kanban_column: newCol });
        } catch (e) {
            if (onMove) onMove(storyId, story.kanban_column);
            toast.error('Error al mover la historia');
        } finally {
            setSaving(false);
        }
    };

    if (!sprintStories?.length) {
        return (
            <Alert variant="info" className="small">
                No hay historias en este sprint. Asigná historias desde la pestaña Planificación.
            </Alert>
        );
    }

    return (
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
                                            {items.map((story, index) => (
                                                <Draggable
                                                    key={story.id}
                                                    draggableId={String(story.id)}
                                                    index={index}
                                                >
                                                    {(dragProvided) => (
                                                        <div
                                                            ref={dragProvided.innerRef}
                                                            {...dragProvided.draggableProps}
                                                            {...dragProvided.dragHandleProps}
                                                            className="mb-2"
                                                        >
                                                            <Card className="shadow-sm">
                                                                <Card.Body className="p-2">
                                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                                        <code className="small">{story.codigo}</code>
                                                                        <PriorityPill prioridad={story.prioridad} />
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
                                                                </Card.Body>
                                                            </Card>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
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
    );
}
