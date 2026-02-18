import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

const InformeAvanceList = ({ listaInformes, onEdit, onDelete, onDownloadPDF }) => {
    return (
        <div className="table-responsive">
            <Table striped bordered hover>
                <thead className="table-light">
                    <tr>
                        <th>Nombre</th>
                        <th>Fecha</th>
                        <th className="text-center">Estado</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {listaInformes.map(informe => (
                        <tr key={informe.id}>
                            <td>
                                <strong>{informe.nombre_persona}</strong>
                            </td>
                            <td>
                                {new Date(informe.fecha_informe).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </td>
                            <td className="text-center">
                                <Badge bg="success">Completado</Badge>
                            </td>
                            <td className="text-center">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => onEdit(informe)}
                                >
                                    <i className="bi bi-pencil me-1"></i>
                                    Editar
                                </Button>
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => onDownloadPDF(informe)}
                                >
                                    <i className="bi bi-file-earmark-pdf me-1"></i>
                                    PDF
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => onDelete(informe.id)}
                                >
                                    <i className="bi bi-trash me-1"></i>
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {listaInformes.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center text-muted py-4">
                                <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                No hay informes registrados aún para este proyecto
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default InformeAvanceList;