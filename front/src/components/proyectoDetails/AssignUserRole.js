// components/proyectoDetails/AssignUserRole.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Form, Row, Col, Card, Table, Alert, Button } from 'react-bootstrap';
import LoaderButton from '../loaderButton/LoaderButton';
import { actions } from '../../reducers/rolProyecto';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { getColaboradoresMaxConfig, postInvitacionCorreoExterno } from '../../api';

function maxColaboradoresForModo(cfg, modo) {
    if (!cfg) return null;
    if (modo === 'A') return cfg.maxColaboradoresPersonal;
    if (modo === 'PR') return cfg.maxColaboradoresPrograma;
    return cfg.maxColaboradoresEquipo;
}

function AssignUserRole({
    projectId,
    projectModo,
    roles,
    usuariosEmpresa,
    usuariosAsignados,
    isLoading,
    dispatch,
}) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRolId, setSelectedRolId] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [colabCfg, setColabCfg] = useState(null);
    const [cfgLoadError, setCfgLoadError] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);

    const modo = projectModo || 'P';

    const loadColabConfig = useCallback(async () => {
        setCfgLoadError(null);
        try {
            const res = await getColaboradoresMaxConfig();
            if (res.data.success) {
                setColabCfg(res.data.data);
            } else {
                setCfgLoadError('No se pudieron cargar los límites de colaboradores.');
            }
        } catch (e) {
            setCfgLoadError(
                (e.response && e.response.data && e.response.data.message) || e.message || 'Error al cargar límites.'
            );
        }
    }, []);

    useEffect(() => {
        loadColabConfig();
    }, [loadColabConfig]);

    const maxColab = useMemo(() => maxColaboradoresForModo(colabCfg, modo), [colabCfg, modo]);

    const colabCount = useMemo(
        () => (usuariosAsignados || []).filter((u) => u.rol_proyecto_id != null).length,
        [usuariosAsignados]
    );

    const selectedUid = selectedUserId ? parseInt(selectedUserId, 10) : null;
    const existingSel = (usuariosAsignados || []).find((u) => u.usuario_id === selectedUid);
    const newSlotForSelection = Boolean(
        selectedUid && (!existingSel || existingSel.rol_proyecto_id == null)
    );
    const blockNewAssign =
        maxColab != null && colabCount >= maxColab && newSlotForSelection;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUserId || !selectedRolId) return;

        const assignedUsers = usuariosAsignados || [];
        const uid = parseInt(selectedUserId, 10);
        const usuarioExistente = assignedUsers.find((u) => u.usuario_id === uid);
        const isNewColabSlot = !usuarioExistente || usuarioExistente.rol_proyecto_id == null;

        if (maxColab != null && isNewColabSlot && colabCount >= maxColab) {
            toast.warn(
                `No puede agregar más colaboradores con rol: el límite para este tipo de proyecto es ${maxColab}. `
                + 'Si necesita un tope distinto, contacte al administrador de la plataforma Goru.'
            );
            return;
        }

        if (usuarioExistente && usuarioExistente.rol_proyecto_id != null) {
            toast.warn(
                `El usuario ya está en el proyecto con rol: ${usuarioExistente.RolProyecto?.nombre || '—'}. Se actualizará su rol.`
            );
        }

        const payload = {
            usuarioId: uid,
            proyectoId: parseInt(projectId, 10),
            rolProyectoId: parseInt(selectedRolId, 10),
        };

        setIsUpdating(true);
        dispatch(actions.assignRolProyecto(payload));
        setSelectedUserId('');
        setSelectedRolId('');
        setIsUpdating(false);
    };

    const handleEliminar = (usuarioId) => {
        if (window.confirm('¿Está seguro de eliminar este usuario del proyecto?')) {
            dispatch(actions.deleteUsuarioProyectoRequest(usuarioId, parseInt(projectId, 10)));
            toast.info('Eliminando usuario...');
        }
    };

    const handleInviteExterno = async (e) => {
        e.preventDefault();
        const email = inviteEmail.trim();
        if (!email) {
            toast.warn('Ingrese un correo electrónico.');
            return;
        }
        setSendingInvite(true);
        try {
            const res = await postInvitacionCorreoExterno(parseInt(projectId, 10), { email });
            if (res.data.success) {
                toast.success(res.data.message || 'Correo enviado.');
                setInviteEmail('');
            }
        } catch (err) {
            const msg = (err.response && err.response.data && err.response.data.message) || err.message || 'Error al enviar.';
            toast.warn(msg);
        } finally {
            setSendingInvite(false);
        }
    };

    const modoLabel = modo === 'A' ? 'personal' : modo === 'PR' ? 'programa' : 'equipo';
    const atLimit = maxColab != null && colabCount >= maxColab;

    return (
        <div>
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <h5 className="blue mb-4">Agregar Colaborador al Proyecto</h5>
                    {cfgLoadError && (
                        <Alert variant="warning" className="mb-3">
                            {cfgLoadError}
                        </Alert>
                    )}
                    {maxColab != null && (
                        <Alert variant={atLimit ? 'warning' : 'info'} className="mb-3">
                            Colaboradores con rol en este proyecto ({modoLabel}):{' '}
                            <strong>
                                {colabCount} / {maxColab}
                            </strong>
                            {atLimit && (
                                <span className="d-block mt-2">
                                    Ha alcanzado el máximo permitido. No podrá asignar nuevos usuarios hasta eliminar un
                                    colaborador o solicitar al administrador Goru que aumente el límite global.
                                </span>
                            )}
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3 align-items-end">
                            <Col md={5}>
                                <Form.Group controlId="selectUsuario">
                                    <Form.Label>Usuario (Empresa)</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        disabled={isLoading || isUpdating || blockNewAssign}
                                        className="form-select"
                                    >
                                        <option value="">-- Seleccione Usuario --</option>
                                        {usuariosEmpresa && usuariosEmpresa.map((u) => (
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
                                        onChange={(e) => setSelectedRolId(e.target.value)}
                                        disabled={isLoading || isUpdating || blockNewAssign}
                                        className="form-select"
                                    >
                                        <option value="">-- Seleccione Rol --</option>
                                        {roles && roles.map((r) => (
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
                                    disabled={
                                        !selectedUserId ||
                                        !selectedRolId ||
                                        isLoading ||
                                        isUpdating ||
                                        blockNewAssign
                                    }
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

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <h5 className="blue mb-3">Invitar por correo (aún no es usuario de Goru)</h5>
                    <p className="text-muted small mb-3">
                        Se enviará un correo con el enlace para registrarse en Goru. Esto no agrega automáticamente a la
                        persona al proyecto: cuando ya tenga cuenta y esté en la misma empresa, podrá agregarla como
                        colaborador arriba.
                    </p>
                    <Form onSubmit={handleInviteExterno}>
                        <Row className="g-2 align-items-end">
                            <Col md={8}>
                                <Form.Group className="mb-0">
                                    <Form.Label>Correo electrónico</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                        disabled={sendingInvite}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <LoaderButton
                                    type="submit"
                                    variant="outline-primary"
                                    className="w-100"
                                    isLoading={sendingInvite}
                                    disabled={sendingInvite}
                                >
                                    Enviar invitación
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
                        <tr>
                            <td colSpan="3" className="text-center">
                                Cargando usuarios...
                            </td>
                        </tr>
                    ) : (usuariosAsignados || []).length > 0 ? (
                        usuariosAsignados.map((asignacion) => (
                            <tr key={asignacion.usuario_id}>
                                <td>{asignacion.Usuario.username}</td>
                                <td>
                                    {asignacion.rol_proyecto_id === null
                                        ? 'Administrador (Creador)'
                                        : asignacion.RolProyecto?.nombre || 'Rol no encontrado'}
                                </td>
                                <td>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleEliminar(asignacion.usuario_id)}
                                        disabled={asignacion.rol_proyecto_id === null}
                                    >
                                        <i className="bi bi-trash-fill" />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center">
                                No hay usuarios asignados a este proyecto.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
            <Alert variant="info" className="mt-3">
                <i className="bi bi-info-circle-fill me-2" />
                El usuario con rol &apos;Administrador (Creador)&apos; es el dueño del proyecto y no puede ser eliminado
                ni modificado su rol desde aquí.
            </Alert>
        </div>
    );
}

export default connect()(AssignUserRole);
