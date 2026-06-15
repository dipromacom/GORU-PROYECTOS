import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { getSuggestedPriorities, getValorEsfuerzoRatio } from './scrumHelpers';

const QUADRANTS = [
    { key: 'hacer', label: 'Hacer primero', className: 'bg-success bg-opacity-10' },
    { key: 'planificar', label: 'Planificar', className: 'bg-warning bg-opacity-10' },
    { key: 'relleno', label: 'Relleno', className: 'bg-secondary bg-opacity-10' },
    { key: 'evitar', label: 'Evitar o posponer', className: 'bg-danger bg-opacity-10' },
];

function getQuadrant(story) {
    const val = Number(story.valor_negocio) || 0;
    const eff = Number(story.story_points) || 0;
    if (!val || !eff) return null;
    const highVal = val >= 3;
    const highEff = eff >= 5;
    if (highVal && !highEff) return 'hacer';
    if (highVal && highEff) return 'planificar';
    if (!highVal && highEff) return 'evitar';
    return 'relleno';
}

export default function BacklogSidebar({ stories }) {
    const suggested = getSuggestedPriorities(stories, 5);
    const withQuadrant = stories
        .map((s) => ({ ...s, quadrant: getQuadrant(s) }))
        .filter((s) => s.quadrant);
    const sinDatos = stories.filter((s) => !getQuadrant(s)).length;

    return (
        <div className="d-flex flex-column gap-3">
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white fw-semibold small">Matriz Valor vs Esfuerzo</Card.Header>
                <Card.Body className="p-2">
                    <div className="d-flex text-muted mb-1" style={{ fontSize: 10 }}>
                        <span className="me-auto">↑ Valor (Y)</span>
                    </div>
                    <div className="row g-1">
                        {QUADRANTS.map((q) => {
                            const items = withQuadrant.filter((s) => s.quadrant === q.key).slice(0, 3);
                            return (
                                <div className="col-6" key={q.key}>
                                    <div className={`rounded p-2 h-100 ${q.className}`} style={{ minHeight: 90 }}>
                                        <div className="small fw-semibold">{q.label}</div>
                                        {items.length === 0 ? (
                                            <div style={{ fontSize: 11 }} className="text-muted">—</div>
                                        ) : items.map((s) => (
                                            <div key={s.id} style={{ fontSize: 11 }}>
                                                <span className="me-1">{s.codigo}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="d-flex justify-content-between text-muted mt-2 px-1" style={{ fontSize: 10 }}>
                        <span>← Bajo esfuerzo (X)</span>
                        <span>Alto esfuerzo (X) →</span>
                    </div>
                    {sinDatos > 0 && (
                        <div className="text-muted mt-2" style={{ fontSize: 10 }}>
                            {sinDatos} historias sin valor o story points no aparecen en la matriz.
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white fw-semibold small">Priorización sugerida</Card.Header>
                <Card.Body className="p-0">
                    {suggested.length === 0 ? (
                        <p className="text-muted small p-3 mb-0">Asigná valor y story points para ver sugerencias.</p>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {suggested.map((s, i) => (
                                <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center py-2">
                                    <div className="small text-truncate me-2">
                                        <span className="text-muted me-1">{i + 1}.</span>
                                        <strong>{s.codigo}</strong> {s.titulo}
                                    </div>
                                    <Badge bg="primary">{(getValorEsfuerzoRatio(s) || 0).toFixed(2)}</Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}
