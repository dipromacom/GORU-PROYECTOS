import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import moment from 'moment';

const ProjectStatusHistory = ({ logs }) => {
    const statusMap = {
        'C': { text: 'Creado', variant: 'secondary' },
        'S': { text: 'Iniciado', variant: 'success' },
        'P': { text: 'Planificado', variant: 'warning' },
        'X': { text: 'Ejecutado', variant: 'info' },
        'E': { text: 'Cerrado', variant: 'danger' },
        'N/A': { text: 'N/A', variant: 'light' }
    };

    const renderStatusBadge = (statusKey) => {
        const status = statusMap[statusKey] || statusMap['N/A'];
        return <Badge variant={status.variant}>{status.text}</Badge>;
    };

    if (!logs || logs.length === 0) {
        return <div className="text-center p-4">No hay historial de cambios registrado.</div>;
    }

    return (
        <div className="mt-3">
            <h5>Historial de Cambios de Estado</h5>
            <Table responsive hover className="mt-3">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Estado Anterior</th>
                        <th>Nuevo Estado</th>
                        <th>Fecha del Cambio</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id}>
                            <td>{log.usuario}</td>
                            <td>{renderStatusBadge(log.estadoAnterior)}</td>
                            <td>{renderStatusBadge(log.estadoNuevo)}</td>
                            <td>{moment(log.fecha).format('DD/MM/YYYY HH:mm')}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ProjectStatusHistory;