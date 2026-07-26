import React, { useEffect, useMemo } from 'react';
import { Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Doughnut, Bar } from 'react-chartjs-2';
import { actions as scrumActions, selectors as scrumSelectors } from '../../reducers/scrum';

const COLORS = {
    primary: '#0d6efd',
    success: '#198754',
    warning: '#ffc107',
    danger: '#dc3545',
    secondary: '#6c757d',
    info: '#0dcaf0',
};

function DoughnutCard({ title, data, colors, height = 180 }) {
    const chartData = {
        labels: data.map((d) => d.label),
        datasets: [{
            data: data.map((d) => d.value),
            backgroundColor: colors || data.map((_, i) => Object.values(COLORS)[i % Object.keys(COLORS).length]),
            borderWidth: 2,
            borderColor: '#fff',
        }],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, fontSize: 11 } },
        cutoutPercentage: 65,
    };
    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white fw-semibold small">{title}</Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center" style={{ minHeight: height }}>
                {data.every((d) => d.value === 0) ? (
                    <p className="text-muted small mb-0">Sin datos</p>
                ) : (
                    <div style={{ height, width: '100%' }}>
                        <Doughnut data={chartData} options={options} />
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

function BarCard({ title, labels, values, colors, height = 200, onClickBar }) {
    const chartData = {
        labels,
        datasets: [{
            label: title,
            data: values,
            backgroundColor: colors || '#0d6efd',
            borderRadius: 4,
        }],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        scales: {
            yAxes: [{ ticks: { beginAtZero: true, stepSize: 1, fontSize: 10 } }],
            xAxes: [{ ticks: { fontSize: 10 } }],
        },
        onClick: (event, elements) => {
            if (elements.length > 0 && onClickBar) {
                const idx = elements[0]._index;
                onClickBar(idx);
            }
        },
    };
    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white fw-semibold small">{title}</Card.Header>
            <Card.Body style={{ minHeight: height }}>
                {values.every((v) => v === 0) ? (
                    <p className="text-muted small mb-0 text-center">Sin datos</p>
                ) : (
                    <div style={{ height }}>
                        <Bar data={chartData} options={options} />
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

function AgileIndicators({ projectId, sprints, stories, loading, fetch, onNavigate }) {
    useEffect(() => {
        if (projectId && sprints.length === 0 && stories.length === 0) {
            fetch({ projectId });
        }
    }, [projectId, fetch]);

    const sprintStatusData = useMemo(() => {
        const cerrados = sprints.filter((s) => s.estado === 'cerrado').length;
        const activos = sprints.filter((s) => s.estado === 'activo').length;
        const planificados = sprints.filter((s) => s.estado === 'planificado').length;
        const cancelados = sprints.filter((s) => s.estado === 'cancelado').length;
        return [
            { label: 'Cerrados', value: cerrados },
            { label: 'Activos', value: activos },
            { label: 'Planificados', value: planificados },
            { label: 'Cancelados', value: cancelados },
        ].filter((d) => d.value > 0);
    }, [sprints]);

    const storyStatusData = useMemo(() => {
        const done = stories.filter((s) => s.estado === 'done' || s.kanban_column === 'done').length;
        const enSprint = stories.filter((s) => s.estado === 'en_sprint').length;
        const ready = stories.filter((s) => s.estado === 'ready').length;
        const backlog = stories.filter((s) => s.estado === 'backlog').length;
        const idea = stories.filter((s) => s.estado === 'idea' || s.estado === 'refinamiento').length;
        return [
            { label: 'Completadas', value: done },
            { label: 'En Sprint', value: enSprint },
            { label: 'Ready', value: ready },
            { label: 'Backlog', value: backlog },
            { label: 'Ideas', value: idea },
        ].filter((d) => d.value > 0);
    }, [stories]);

    const typeBreakdownData = useMemo(() => {
        const map = {};
        stories.forEach((s) => {
            const t = s.tipo || 'historia';
            map[t] = (map[t] || 0) + 1;
        });
        const typeColors = {
            historia: COLORS.primary,
            tarea: COLORS.secondary,
            bug: COLORS.danger,
            mejora: COLORS.success,
            spike: COLORS.warning,
        };
        return {
            labels: Object.keys(map),
            values: Object.values(map),
            colors: Object.keys(map).map((t) => typeColors[t] || COLORS.info),
        };
    }, [stories]);

    const processedSprints = useMemo(() => {
        const sorted = [...sprints].sort((a, b) => new Date(a.fecha_inicio || 0) - new Date(b.fecha_inicio || 0));
        return sorted.map((s) => {
            const ss = stories.filter((st) => st.sprint_id === s.id);
            const comprometidos = ss.reduce((a, st) => a + (Number(st.story_points) || 0), 0);
            const completados = ss.filter((st) => st.estado === 'done' || st.kanban_column === 'done')
                .reduce((a, st) => a + (Number(st.story_points) || 0), 0);
            return { ...s, comprometidos, completados, totalHistorias: ss.length };
        });
    }, [sprints, stories]);

    const sprintBarData = useMemo(() => ({
        labels: processedSprints.map((s) => s.codigo || s.nombre || `#${s.id}`),
        comprometidos: processedSprints.map((s) => s.comprometidos),
        completados: processedSprints.map((s) => s.completados),
    }), [processedSprints]);

    const totalSP = useMemo(() => stories.reduce((a, s) => a + (Number(s.story_points) || 0), 0), [stories]);
    const doneSP = useMemo(() => stories.filter((s) => s.estado === 'done' || s.kanban_column === 'done')
        .reduce((a, s) => a + (Number(s.story_points) || 0), 0), [stories]);
    const pctCompletado = totalSP > 0 ? Math.round((doneSP / totalSP) * 100) : 0;

    if (loading) {
        return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
    }

    return (
        <div className="mt-4">
            <h6 className="fw-bold mb-3">Indicadores de Sprint</h6>
            <Row className="g-3 mb-4">
                <Col md={4}>
                    <DoughnutCard title="Estado de Sprints" data={sprintStatusData} colors={[COLORS.success, COLORS.primary, COLORS.secondary, COLORS.danger]} />
                </Col>
                <Col md={8}>
                    <BarCard
                        title="Puntos por Sprint"
                        labels={sprintBarData.labels}
                        values={sprintBarData.completados}
                        colors={sprintBarData.completados.map((v, i) => v >= (sprintBarData.comprometidos[i] || 0) ? COLORS.success : COLORS.warning)}
                        onClickBar={(idx) => {
                            const s = processedSprints[idx];
                            if (s && onNavigate) onNavigate('scrum', s.id);
                        }}
                    />
                </Col>
            </Row>

            <hr className="my-4" />
            <h6 className="fw-bold mb-3">Indicadores de Historias</h6>
            <Row className="g-3 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center h-100" onClick={() => onNavigate && onNavigate('scrum')} role="button" style={{ cursor: 'pointer' }}>
                        <Card.Body>
                            <div className="text-muted small">Total HU</div>
                            <div className="fs-3 fw-bold text-primary">{stories.length}</div>
                            <small className="text-muted">Ver backlog</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center h-100" onClick={() => onNavigate && onNavigate('scrum')} role="button" style={{ cursor: 'pointer' }}>
                        <Card.Body>
                            <div className="text-muted small">Completadas</div>
                            <div className="fs-3 fw-bold text-success">{storyStatusData.find((d) => d.label === 'Completadas')?.value || 0}</div>
                            <small className="text-muted">Ver cerradas</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center h-100" onClick={() => onNavigate && onNavigate('scrum')} role="button" style={{ cursor: 'pointer' }}>
                        <Card.Body>
                            <div className="text-muted small">En progreso</div>
                            <div className="fs-3 fw-bold text-primary">{storyStatusData.find((d) => d.label === 'En Sprint')?.value || 0}</div>
                            <small className="text-muted">Ver kanban</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center h-100" onClick={() => onNavigate && onNavigate('scrum')} role="button" style={{ cursor: 'pointer' }}>
                        <Card.Body>
                            <div className="text-muted small">Story Points</div>
                            <div className="fs-3 fw-bold">{totalSP}</div>
                            <small className="text-muted">{doneSP} completados</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                <Col md={4}>
                    <DoughnutCard title="Estado de Historias" data={storyStatusData} />
                </Col>
                <Col md={4}>
                    <DoughnutCard title="Historias por Tipo" data={[
                        ...typeBreakdownData.labels.map((l, i) => ({ label: l, value: typeBreakdownData.values[i] })),
                    ]} colors={typeBreakdownData.colors} />
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white fw-semibold small text-center">Avance Global</Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center" style={{ minHeight: 200 }}>
                            {totalSP === 0 ? (
                                <p className="text-muted small mb-0">Sin datos</p>
                            ) : (
                                <div style={{ height: 160, width: '100%' }}>
                                    <Doughnut data={{
                                        labels: ['Completado', 'Pendiente'],
                                        datasets: [{
                                            data: [pctCompletado, 100 - pctCompletado],
                                            backgroundColor: [COLORS.success, '#e9ecef'],
                                            borderWidth: 0,
                                        }],
                                    }} options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutoutPercentage: 70,
                                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, fontSize: 11 } },
                                        tooltips: {
                                            callbacks: {
                                                label: (item) => `${item.value}%`,
                                            },
                                        },
                                    }} />
                                    <div className="text-center mt-1">
                                        <span className="fw-bold fs-5">{pctCompletado}%</span>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <hr className="my-4" />
            <h6 className="fw-bold mb-3">Resumen por Sprint</h6>
            {processedSprints.length === 0 ? (
                <p className="text-muted small">No hay sprints creados.</p>
            ) : (
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <table className="table table-sm mb-0 small">
                                <thead className="table-light">
                                    <tr><th>Sprint</th><th>Estado</th><th>HU</th><th>SP comp.</th><th>SP compl.</th><th>%</th></tr>
                                </thead>
                                <tbody>
                                    {processedSprints.map((s) => (
                                        <tr key={s.id} onClick={() => onNavigate && onNavigate('scrum', s.id)} role="button" style={{ cursor: 'pointer' }}>
                                            <td><code>{s.codigo || s.nombre}</code></td>
                                            <td><Badge bg={s.estado === 'cerrado' ? 'success' : s.estado === 'activo' ? 'primary' : 'secondary'}>{s.estado}</Badge></td>
                                            <td>{s.totalHistorias}</td>
                                            <td>{s.comprometidos}</td>
                                            <td>{s.completados}</td>
                                            <td>{s.comprometidos > 0 ? `${Math.round((s.completados / s.comprometidos) * 100)}%` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
}

const mapStateToProps = (state) => ({
    sprints: scrumSelectors.getSprints(state),
    stories: scrumSelectors.getStories(state),
    loading: scrumSelectors.isLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
    fetch: (params) => dispatch(scrumActions.fetch(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AgileIndicators);
