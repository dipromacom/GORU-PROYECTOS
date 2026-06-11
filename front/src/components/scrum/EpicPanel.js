import React from 'react';
import { Card, Table, ProgressBar, Button, Badge } from 'react-bootstrap';
import { labelFor, EPIC_STATES, PRIORITIES } from './scrumConstants';

export default function EpicPanel({ epics, puedeGestionar, onEdit, onCreate, onDelete }) {
    if (!epics.length) {
        return (
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="text-center text-muted py-4">
                    <p className="mb-2">No hay épicas registradas.</p>
                    {puedeGestionar && (
                        <Button variant="outline-primary" size="sm" onClick={onCreate}>
                            <i className="bi bi-plus-lg me-1" /> Nueva épica
                        </Button>
                    )}
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong className="blue">Épicas</strong>
                {puedeGestionar && (
                    <Button variant="outline-primary" size="sm" onClick={onCreate}>
                        <i className="bi bi-plus-lg me-1" /> Nueva épica
                    </Button>
                )}
            </Card.Header>
            <Card.Body className="p-0">
                <Table responsive hover className="mb-0" size="sm">
                    <thead className="table-light">
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Prioridad</th>
                            <th className="text-center">Historias</th>
                            <th className="text-center">Puntos</th>
                            <th>Avance</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {epics.map((ep) => {
                            const st = ep.stats || {};
                            return (
                                <tr key={ep.id}>
                                    <td><Badge bg="secondary">{ep.codigo}</Badge></td>
                                    <td>{ep.nombre}</td>
                                    <td>{labelFor(EPIC_STATES, ep.estado)}</td>
                                    <td>{labelFor(PRIORITIES, ep.prioridad)}</td>
                                    <td className="text-center">
                                        {st.historiasCompletadas ?? 0}/{st.totalHistorias ?? 0}
                                    </td>
                                    <td className="text-center">
                                        {st.puntosCompletados ?? 0}/{st.puntosTotales ?? 0}
                                    </td>
                                    <td style={{ minWidth: 120 }}>
                                        <ProgressBar
                                            now={st.porcentajeAvance ?? 0}
                                            label={`${st.porcentajeAvance ?? 0}%`}
                                            variant="success"
                                            style={{ height: 18, fontSize: 11 }}
                                        />
                                    </td>
                                    <td className="text-nowrap">
                                        <Button variant="link" size="sm" className="p-0 me-2" onClick={() => onEdit(ep)}>
                                            Ver / Editar
                                        </Button>
                                        {puedeGestionar && (
                                            <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => onDelete(ep)}>
                                                Eliminar
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
}
