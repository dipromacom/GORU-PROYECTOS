import React, { useState, useEffect } from 'react';
import { Modal, Tab, Nav } from 'react-bootstrap';
import { connect } from 'react-redux';
import { actions, selectors } from '../../reducers/rolProyecto';
import { actions as sessionActions, selectors as sessionSelectors } from '../../reducers/session';
import AssignUserRole from './AssignUserRole';
import ManageProjectRoles from './ManageProjectRoles';

function RoleSettingsModal({
    show,
    handleClose,
    projectId,
    dispatch,
    usuario,
    roles,
    permisos,
    isLoadingRoles,
    isLoadingPermisos,
    usuariosEmpresa,
    isLoadingUsuariosEmpresa,
    projectDetail,
    usuariosAsignados,
    isLoadingUsuariosAsignados,
}) {
    const [activeTab, setActiveTab] = useState('assign');

    useEffect(() => {
        if (show) {
            // Cargar Roles y Permisos
            dispatch(actions.getAllRolesProyecto());
            dispatch(actions.getAllPermisosProyecto());

            // Cargar usuarios ya asignados al proyecto
            dispatch(actions.getUsuariosProyectoRequest(projectId));
            
        }
    }, [show, dispatch, projectId]);

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static">
            <Modal.Header closeButton className="blue-header">
                <Modal.Title className="blue">
                    <i className="bi bi-gear-fill me-2" />
                    Configuración de Accesos del Proyecto
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    <Nav variant="tabs" className="px-3 pt-3 nav-tabs-custom">
                        <Nav.Item>
                            <Nav.Link eventKey="assign" className="text-dark">
                                <i className="bi bi-person-plus-fill me-2" />
                                Asignar Usuarios
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="manage" className="text-dark">
                                <i className="bi bi-shield-lock-fill me-2" />
                                Gestionar Roles y Permisos
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <Tab.Content className="p-4 bg-light">
                        <Tab.Pane eventKey="assign">
                            <AssignUserRole
                                projectId={projectId}
                                roles={roles}
                                usuariosEmpresa={usuariosEmpresa}
                                usuariosAsignados={usuariosAsignados}
                                isLoading={isLoadingRoles || isLoadingUsuariosEmpresa}
                                dispatch={dispatch}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="manage">
                            <ManageProjectRoles
                                roles={roles}
                                permisos={permisos}
                                isLoading={isLoadingRoles || isLoadingPermisos}
                                dispatch={dispatch}
                            />
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
        </Modal>
    );
}

const mapStateToProps = state => ({
    usuario: sessionSelectors.getUser(state),
    roles: selectors.getRoles(state),
    permisos: selectors.getPermisos(state),
    isLoadingRoles: selectors.getIsLoadingRoles(state),
    isLoadingPermisos: selectors.getIsLoadingPermisos(state),
    usuariosEmpresa: sessionSelectors.getUsuariosEmpresa(state),
    isLoadingUsuariosEmpresa: sessionSelectors.getIsLoadingUsuariosEmpresa(state),
    usuariosAsignados: selectors.getUsuariosAsignados(state),
    isLoadingUsuariosAsignados: selectors.getIsLoadingUsuariosAsignados(state),
});

export default connect(mapStateToProps)(RoleSettingsModal);