import React from 'react';
import { Modal, Button, Table, Badge } from 'react-bootstrap';

const SurveyViewModal = ({ show, onHide, encuesta }) => {
    if (!encuesta) return null;

    const fields = [
        { key: 'comunicacion', label: '1. Comunicación con el equipo' },
        { key: 'rapidez_respuesta', label: '2. Rapidez de respuesta' },
        { key: 'manejo_reuniones', label: '3. Manejo de reuniones' },
        { key: 'cumplimiento_plazos', label: '4. Cumplimiento de plazos' },
        { key: 'cumplimiento_alcance', label: '5. Cumplimiento de alcance' },
        { key: 'calidad_entregado', label: '6. Calidad de lo entregado' },
        { key: 'nivel_capacitaciones', label: '7. Capacitaciones y transferencia' },
        { key: 'gestion_documentacion', label: '8. Gestión de documentación' },
        { key: 'experiencia_director', label: '9. Experiencia del Director de Proyecto' },
        { key: 'satisfaccion_general', label: '10. Satisfacción General' }
    ];

    const getRatingColor = (value) => {
        if (value >= 4) return 'success';
        if (value >= 2) return 'warning';
        return 'danger';
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalle de Encuesta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-4">
                    <h6><strong>Nombre:</strong> {encuesta.nombre}</h6>
                    <p className="text-muted mb-1">
                        <strong>Fecha:</strong> {new Date(encuesta.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Pregunta</th>
                            <th className="text-center" style={{ width: '120px' }}>Calificación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map(field => (
                            <tr key={field.key}>
                                <td>{field.label}</td>
                                <td className="text-center">
                                    
                                        {encuesta[field.key]} / 5
                                    
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {encuesta.comentarios && (
                    <div className="mt-4 p-3 bg-light rounded">
                        <h6 className="fw-bold mb-2">Comentarios Adicionales:</h6>
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{encuesta.comentarios}</p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SurveyViewModal;