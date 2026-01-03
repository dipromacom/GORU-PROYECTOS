// components/proyectoDetails/AssignUserRole.js (Reemplazar)
import React, { useState } from 'react';
import { Form, Row, Col, Card, Table, Alert, Button } from 'react-bootstrap';
import LoaderButton from '../loaderButton/LoaderButton';
import { actions } from '../../reducers/rolProyecto';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';

function AssignUserRole({ projectId, roles, usuariosEmpresa, usuariosAsignados, isLoading, dispatch }) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRolId, setSelectedRolId] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUserId || !selectedRolId) return;

        const assignedUsers = usuariosAsignados || [];
        const usuarioExistente = assignedUsers.find(u => u.usuario_id === parseInt(selectedUserId));

        const payload = {
            usuarioId: parseInt(selectedUserId),
            proyectoId: parseInt(projectId),
            rolProyectoId: parseInt(selectedRolId)
        };

        // Simular advertencia si ya existe
        if (usuarioExistente) {
            toast.warn(`El usuario ya está en el proyecto con rol: ${usuarioExistente.RolProyecto?.nombre || 'Administrador (Creador)'}. Se actualizará su rol.`);
        }

        setIsUpdating(true);
        dispatch(actions.assignRolProyecto(payload));

        // La saga se encarga de recargar la lista de usuarios.
        setSelectedUserId('');
        setSelectedRolId('');
        setIsUpdating(false);
    };

    const handleEliminar = (usuarioId) => {
        if (window.confirm("¿Está seguro de eliminar este usuario del proyecto?")) {
            dispatch(actions.deleteUsuarioProyectoRequest(usuarioId, parseInt(projectId)));
            toast.info("Eliminando usuario...");
        }
    };

    // Función auxiliar para obtener el nombre del rol para el dropdown
    const getRolName = (rolId) => {
        const rol = roles.find(r => r.id === rolId);
        return rol ? rol.nombre : '';
    };

    return (
        <div>
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <h5 className="blue mb-4">Agregar Colaborador al Proyecto</h5>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3 align-items-end">
                            <Col md={5}>
                                <Form.Group controlId="selectUsuario">
                                    <Form.Label>Usuario (Empresa)</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedUserId}
                                        onChange={e => setSelectedUserId(e.target.value)}
                                        disabled={isLoading || isUpdating}
                                        className="form-select"
                                    >
                                        <option value="">-- Seleccione Usuario --</option>
                                        {usuariosEmpresa && usuariosEmpresa.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.username}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="selectRol">
                                    <Form.Label>Rol a Asignar</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedRolId}
                                        onChange={e => setSelectedRolId(e.target.value)}
                                        disabled={isLoading || isUpdating}
                                        className="form-select"
                                    >
                                        <option value="">-- Seleccione Rol --</option>
                                        {roles && roles.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.nombre}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <LoaderButton
                                    type="submit"
                                    className="btn-success w-100"
                                    disabled={!selectedUserId || !selectedRolId || isLoading || isUpdating}
                                    isLoading={isUpdating}
                                >
                                    <i className="bi bi-person-check-fill me-2" />
                                    Asignar
                                </LoaderButton>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            <h5 className="blue mt-5 mb-3">Usuarios Asignados al Proyecto</h5>
            <Table striped bordered hover responsive size="sm">
                <thead>
                    <tr>
                        <th style={{ width: '50%' }}>Usuario</th>
                        <th style={{ width: '30%' }}>Rol Actual</th>
                        <th style={{ width: '20%' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr><td colSpan="3" className="text-center">Cargando usuarios...</td></tr>
                    ) : (
                        (usuariosAsignados || []).length > 0 ? (
                            usuariosAsignados.map((asignacion) => (
                                <tr key={asignacion.usuario_id}>
                                    <td>{asignacion.Usuario.username}</td>
                                    <td>
                                        {asignacion.rol_proyecto_id === null
                                            ? 'Administrador (Creador)'
                                            : (asignacion.RolProyecto?.nombre || 'Rol no encontrado')}
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleEliminar(asignacion.usuario_id)}
                                            disabled={asignacion.rol_proyecto_id === null} // No permitir eliminar al creador
                                        >
                                            <i className="bi bi-trash-fill" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="text-center">No hay usuarios asignados a este proyecto.</td></tr>
                        )
                    )}
                </tbody>
            </Table>
            <Alert variant="info" className="mt-3">
                <i className="bi bi-info-circle-fill me-2" />
                El usuario con rol 'Administrador (Creador)' es el dueño del proyecto y no puede ser eliminado ni modificado su rol desde aquí.
            </Alert>
        </div>
    );
}

export default connect()(AssignUserRole);       