import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Card, ListGroup } from 'react-bootstrap';
import LoaderButton from '../loaderButton/LoaderButton';
import { actions } from '../../reducers/rolProyecto';
import { toast } from 'react-toastify';

export default function ManageProjectRoles({ roles, permisos, isLoading, dispatch }) {
    const [selectedRol, setSelectedRol] = useState(null);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [permisosActivos, setPermisosActivos] = useState([]); // Array de IDs
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (selectedRol) {
            setNombre(selectedRol.nombre);
            setDescripcion(selectedRol.descripcion || '');
            const ids = selectedRol.PermisosProyecto
                ? selectedRol.PermisosProyecto.map(p => p.id)
                : [];
            setPermisosActivos(ids);
        } else {
            setNombre('');
            setDescripcion('');
            setPermisosActivos([]);
        }
    }, [selectedRol]);

    const handleNewRol = () => {
        setSelectedRol(null);
    };

    const togglePermiso = (permisoId) => {
        setPermisosActivos(prev => {
            if (prev.includes(permisoId)) {
                return prev.filter(id => id !== permisoId);
            } else {
                return [...prev, permisoId];
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            nombre,
            descripcion,
            permisosIds: permisosActivos
        };

        if (selectedRol) {
            dispatch(actions.updateRolProyecto(selectedRol.id, payload));
            toast.info("Actualizando rol...");
        } else {
            dispatch(actions.createRolProyecto(payload));
            toast.info("Creando rol...");
        }

        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <Row>
            {/* Lista Lateral de Roles */}
            <Col md={4} className="border-end">
                <div className="d-grid gap-2 mb-3">
                    <Button variant="outline-primary" onClick={handleNewRol}>
                        <i className="bi bi-plus-lg me-2" /> Crear Nuevo Rol
                    </Button>
                </div>
                <ListGroup variant="flush" className="overflow-auto" style={{ maxHeight: '60vh' }}>
                    {roles.map(rol => (
                        <ListGroup.Item
                            key={rol.id}
                            action
                            active={selectedRol && selectedRol.id === rol.id}
                            onClick={() => setSelectedRol(rol)}
                            className="border-0 rounded mb-1"
                        >
                            <strong>{rol.nombre}</strong>
                            <div className="small text-truncate">{rol.descripcion}</div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Col>

            {/* Formulario de Edición */}
            <Col md={8}>
                <Card className="border-0">
                    <Card.Body>
                        <h5 className="blue mb-3">
                            {selectedRol ? `Editando: ${selectedRol.nombre}` : 'Nuevo Rol'}
                        </h5>
                        <Form onSubmit={handleSave}>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group controlId="nombreRol">
                                        <Form.Label>Nombre</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={nombre}
                                            onChange={e => setNombre(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="descRol">
                                        <Form.Label>Descripción</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={descripcion}
                                            onChange={e => setDescripcion(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />
                            <h6 className="mb-3">Permisos Asignados</h6>

                            <div className="bg-light p-3 rounded" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                                <Row>
                                    {permisos && permisos.map(permiso => (
                                        <Col md={6} key={permiso.id} className="mb-2">
                                            <Form.Check
                                                type="switch"
                                                id={`perm-${permiso.id}`}
                                                label={permiso.nombre}
                                                checked={permisosActivos.includes(permiso.id)}
                                                onChange={() => togglePermiso(permiso.id)}
                                            />
                                            <small className="text-muted ms-5 d-block" style={{ marginTop: '-5px' }}>
                                                {permiso.descripcion}
                                            </small>
                                        </Col>
                                    ))}
                                </Row>
                            </div>

                            <div className="mt-4 d-flex justify-content-end">
                                <LoaderButton
                                    type="submit"
                                    className="btn-primary"
                                    disabled={!nombre || isLoading || isSaving}
                                    isLoading={isSaving}
                                >
                                    Guardar Configuración
                                </LoaderButton>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}