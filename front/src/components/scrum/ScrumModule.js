import React, { useEffect, useState } from 'react';
import { Nav, Card, Spinner, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import { actions as scrumActions, selectors as scrumSelectors } from '../../reducers/scrum';
import { actions as rolProyectoActions, selectors as rolProyectoSelectors } from '../../reducers/rolProyecto';
import BacklogPanel from './BacklogPanel';
import SprintPanel from './SprintPanel';

const SECTIONS = [
    { key: 'resumen', label: 'Resumen', icon: 'bi-speedometer2' },
    { key: 'backlog', label: 'Backlog', icon: 'bi-list-task' },
    { key: 'sprint', label: 'Sprint', icon: 'bi-calendar-check' },
    { key: 'metricas', label: 'Métricas', icon: 'bi-graph-down' },
    { key: 'docs', label: 'Documentación', icon: 'bi-journal-text' },
];

function ScrumModule({
    projectId,
    dispatch,
    epics,
    stories,
    archivedStories,
    sprints,
    stats,
    config,
    proyecto,
    usuarios,
    loading,
    error,
    puedeGestionar,
}) {
    const [activeSection, setActiveSection] = useState('resumen');
    const projectName = proyecto?.nombre || 'Proyecto';

    useEffect(() => {
        if (projectId) {
            dispatch(scrumActions.fetch({ projectId }));
            dispatch(rolProyectoActions.getUsuariosProyectoRequest(projectId));
        }
        return () => dispatch(scrumActions.clean());
    }, [projectId, dispatch]);

    const renderSectionContent = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Cargando módulo Scrum...</p>
                </div>
            );
        }

        if (error) {
            return <Alert variant="danger">{error}</Alert>;
        }

        switch (activeSection) {
            case 'resumen':
                return (
                    <div className="row g-3">
                        <div className="col-md-3">
                            <Card className="text-center h-100 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="text-muted small">Épicas</div>
                                    <div className="fs-3 fw-bold text-primary">{stats?.totalEpics ?? 0}</div>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col-md-3">
                            <Card className="text-center h-100 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="text-muted small">Historias</div>
                                    <div className="fs-3 fw-bold text-primary">{stats?.totalStories ?? 0}</div>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col-md-3">
                            <Card className="text-center h-100 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="text-muted small">Listas (Ready)</div>
                                    <div className="fs-3 fw-bold text-success">{stats?.storiesReady ?? 0}</div>
                                    <div className="small text-muted">{stats?.readyPoints ?? 0} pts</div>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col-md-3">
                            <Card className="text-center h-100 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="text-muted small">Sprint activo</div>
                                    <div className="fs-6 fw-bold mt-2">
                                        {stats?.activeSprint?.nombre || 'Ninguno'}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col-md-4">
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="text-muted small">Puntos en backlog</div>
                                    <div className="fs-4 fw-bold">{stats?.totalBacklogPoints ?? 0}</div>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col-md-4">
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="text-muted small">Historias completadas</div>
                                    <div className="fs-4 fw-bold text-success">{stats?.storiesDone ?? 0}</div>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col-md-4">
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="text-muted small">Sin estimar</div>
                                    <div className="fs-4 fw-bold text-warning">{stats?.unestimatedStories ?? 0}</div>
                                </Card.Body>
                            </Card>
                        </div>
                        {!puedeGestionar && (
                            <div className="col-12">
                                <Alert variant="info" className="mb-0">
                                    Tienes acceso de solo lectura al módulo Scrum.
                                </Alert>
                            </div>
                        )}
                    </div>
                );
            case 'backlog':
                return (
                    <BacklogPanel
                        projectId={projectId}
                        projectName={projectName}
                        epics={epics}
                        stories={stories}
                        archivedStories={archivedStories}
                        sprints={sprints}
                        stats={stats}
                        config={config}
                        usuarios={usuarios}
                        puedeGestionar={puedeGestionar}
                        dispatch={dispatch}
                    />
                );
            case 'sprint':
                return (
                    <SprintPanel
                        projectId={projectId}
                        sprints={sprints}
                        usuarios={usuarios}
                        puedeGestionar={puedeGestionar}
                        dispatch={dispatch}
                    />
                );
            case 'metricas':
                return (
                    <Alert variant="secondary" className="mb-0">
                        Burndown, velocity y predictibilidad estarán disponibles en una fase posterior.
                    </Alert>
                );
            case 'docs':
                return (
                    <Alert variant="secondary" className="mb-0">
                        DoR, DoD, retrospectivas y actas se integrarán en una fase posterior.
                    </Alert>
                );
            default:
                return null;
        }
    };

    return (
        <div className="scrum-module py-3">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h4 className="blue mb-1">Scrum</h4>
                    <p className="text-muted mb-0 small">
                        Gestión ágil del proyecto — {epics.length} épica(s), {stories.length} historia(s)
                    </p>
                </div>
            </div>

            <Nav variant="pills" className="mb-4 flex-wrap custom-tabs-style">
                {SECTIONS.map(({ key, label, icon }) => (
                    <Nav.Item key={key}>
                        <Nav.Link
                            active={activeSection === key}
                            onClick={() => setActiveSection(key)}
                            className="px-3 py-2"
                        >
                            <i className={`bi ${icon} me-2`} />
                            {label}
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            {renderSectionContent()}
        </div>
    );
}

const mapStateToProps = (state) => ({
    epics: scrumSelectors.getEpics(state),
    stories: scrumSelectors.getStories(state),
    archivedStories: scrumSelectors.getArchivedStories(state),
    sprints: scrumSelectors.getSprints(state),
    stats: scrumSelectors.getStats(state),
    config: scrumSelectors.getConfig(state),
    proyecto: scrumSelectors.getProyecto(state),
    usuarios: rolProyectoSelectors.getUsuariosAsignados(state),
    loading: scrumSelectors.isLoading(state),
    error: scrumSelectors.getError(state),
});

export default connect(mapStateToProps)(ScrumModule);
