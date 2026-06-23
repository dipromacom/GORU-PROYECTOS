import React, { useEffect, useState } from 'react';
import {
    Row, Col, Card, Spinner, Alert, Table, ProgressBar,
} from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import * as Api from '../../api';
import BurndownChart from './BurndownChart';
import BurnupChart from './BurnupChart';
import ScrumPill from './ScrumPill';

function KpiCard({ label, value, sub, accent = 'primary' }) {
    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body>
                <div className="text-muted small">{label}</div>
                <div className={`fs-3 fw-bold text-${accent}`}>{value}</div>
                {sub && <div className="small text-muted mt-1">{sub}</div>}
            </Card.Body>
        </Card>
    );
}

function predictibilityStyle(pct) {
    if (pct == null) return { background: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    if (pct >= 90 && pct <= 110) return { background: '#d1fae5', color: '#065f46', border: '#a7f3d0' };
    if (pct >= 75) return { background: '#fef3c7', color: '#92400e', border: '#fde68a' };
    return { background: '#fee2e2', color: '#991b1b', border: '#fecaca' };
}

export default function MetricsPanel({ projectId }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Api.getScrumMetrics(projectId)
            .then((res) => {
                if (!cancelled) {
                    setMetrics(res.data.metrics);
                    setError(null);
                }
            })
            .catch((e) => {
                if (!cancelled) setError(e.response?.data?.message || 'Error al cargar métricas');
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [projectId]);

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted small">Calculando indicadores ágiles...</p>
            </div>
        );
    }

    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!metrics) return <Alert variant="secondary">Sin datos de métricas.</Alert>;

    const {
        velocity = [],
        velocityAvg,
        velocityTrendPct,
        predictabilityAvg,
        productProgress = {},
        epicProgress = [],
        forecast = {},
        complianceTrend = [],
        activeSprint,
        alerts = [],
    } = metrics;

    const velocityLabels = velocity.map((v) => v.codigo || v.nombre);
    const velocityChartData = {
        labels: velocityLabels,
        datasets: [
            {
                label: 'Comprometidos',
                data: velocity.map((v) => v.comprometidos),
                backgroundColor: 'rgba(148, 163, 184, 0.7)',
            },
            {
                label: 'Completados',
                data: velocity.map((v) => v.completados),
                backgroundColor: 'rgba(37, 99, 235, 0.85)',
            },
        ],
    };

    const velocityOptions = {
        maintainAspectRatio: false,
        legend: { display: true, position: 'top', labels: { fontSize: 11 } },
        scales: {
            xAxes: [{ stacked: false, gridLines: { display: false }, ticks: { fontSize: 10 } }],
            yAxes: [{ stacked: false, ticks: { beginAtZero: true, fontSize: 10 } }],
        },
        tooltips: { mode: 'index', intersect: false },
    };

    const complianceData = {
        labels: complianceTrend.map((c) => c.codigo || c.nombre),
        datasets: [{
            label: 'Cumplimiento sprint (%)',
            data: complianceTrend.map((c) => c.pct),
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            pointRadius: 4,
            fill: false,
            borderWidth: 2,
        }],
    };

    const complianceOptions = {
        maintainAspectRatio: false,
        legend: { display: false },
        scales: {
            xAxes: [{ gridLines: { display: false }, ticks: { fontSize: 10 } }],
            yAxes: [{ ticks: { beginAtZero: true, max: 120, fontSize: 10 }, gridLines: { color: 'rgba(0,0,0,0.06)' } }],
        },
    };

    const trendLabel = velocityTrendPct > 0
        ? `↑ ${velocityTrendPct}% vs sprints anteriores`
        : velocityTrendPct < 0
            ? `↓ ${Math.abs(velocityTrendPct)}% vs sprints anteriores`
            : 'Sin variación reciente';

    return (
        <div>
            <Row className="g-3 mb-4">
                <Col md={3}>
                    <KpiCard
                        label="Velocity promedio"
                        value={`${velocityAvg ?? 0} pts`}
                        sub={trendLabel}
                        accent="primary"
                    />
                </Col>
                <Col md={3}>
                    <KpiCard
                        label="Predictibilidad"
                        value={predictabilityAvg != null ? `${predictabilityAvg}%` : '—'}
                        sub="Completados / comprometidos"
                        accent={predictabilityAvg >= 75 ? 'success' : 'warning'}
                    />
                </Col>
                <Col md={3}>
                    <KpiCard
                        label="Avance del producto"
                        value={`${productProgress.progressPct ?? 0}%`}
                        sub={`${productProgress.completedPoints ?? 0} / ${productProgress.totalPoints ?? 0} pts`}
                        accent="success"
                    />
                </Col>
                <Col md={3}>
                    <KpiCard
                        label="Forecast"
                        value={forecast.sprintsRemaining != null ? `${forecast.sprintsRemaining} sprints` : '—'}
                        sub={forecast.estimatedEndDate
                            ? `Fin estimado: ${new Date(forecast.estimatedEndDate).toLocaleDateString('es-ES')}`
                            : `Confianza: ${forecast.confidence || 'baja'}`}
                        accent="dark"
                    />
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white fw-semibold small">
                            Velocity por sprint
                        </Card.Header>
                        <Card.Body>
                            {velocity.length > 0 ? (
                                <div style={{ height: 280 }}>
                                    <Bar data={velocityChartData} options={velocityOptions} />
                                </div>
                            ) : (
                                <p className="text-muted small mb-0">Activá o cerrá sprints para ver velocity.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white fw-semibold small">Alertas ejecutivas</Card.Header>
                        <Card.Body className="small">
                            {alerts.length === 0 ? (
                                <p className="text-muted mb-0">Sin alertas activas.</p>
                            ) : (
                                alerts.map((a, i) => (
                                    <Alert key={i} variant={a.severity === 'danger' ? 'danger' : 'warning'} className="py-2 px-3 mb-2 small">
                                        {a.message}
                                    </Alert>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {activeSprint && (
                <Row className="g-3 mb-4">
                    <Col md={6}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white fw-semibold small">
                                Burndown — {activeSprint.nombre}
                            </Card.Header>
                            <Card.Body>
                                <BurndownChart sprint={activeSprint} stories={activeSprint.stories || []} />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white fw-semibold small">
                                Burnup — {activeSprint.nombre}
                            </Card.Header>
                            <Card.Body>
                                <BurnupChart sprint={activeSprint} stories={activeSprint.stories || []} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <Row className="g-3 mb-4">
                <Col md={5}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white fw-semibold small">Avance del producto</Card.Header>
                        <Card.Body className="small">
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Puntos completados</span>
                                    <strong>{productProgress.completedPoints ?? 0} pts</strong>
                                </div>
                                <ProgressBar now={productProgress.progressPct ?? 0} variant="success" />
                            </div>
                            <Row className="g-2 text-center">
                                <Col xs={4}>
                                    <div className="text-muted">Épicas completadas</div>
                                    <div className="fs-5 fw-bold text-success">{productProgress.epicsCompleted ?? 0}</div>
                                </Col>
                                <Col xs={4}>
                                    <div className="text-muted">En progreso</div>
                                    <div className="fs-5 fw-bold text-primary">{productProgress.epicsInProgress ?? 0}</div>
                                </Col>
                                <Col xs={4}>
                                    <div className="text-muted">Pendientes</div>
                                    <div className="fs-5 fw-bold">{productProgress.epicsPending ?? 0}</div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={7}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white fw-semibold small">Cumplimiento por sprint</Card.Header>
                        <Card.Body>
                            {complianceTrend.length > 0 ? (
                                <div style={{ height: 200 }}>
                                    <Line data={complianceData} options={complianceOptions} />
                                </div>
                            ) : (
                                <p className="text-muted small mb-0">Sin sprints cerrados aún.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white fw-semibold small">Avance por épica</Card.Header>
                <Card.Body className="p-0">
                    <Table responsive size="sm" className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Épica</th>
                                <th>Historias</th>
                                <th>Puntos</th>
                                <th>Avance</th>
                                <th>Sprint inicio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {epicProgress.length === 0 && (
                                <tr><td colSpan={5} className="text-center text-muted py-3">Sin épicas registradas</td></tr>
                            )}
                            {epicProgress.map((e) => (
                                <tr key={e.id}>
                                    <td>
                                        <code className="small me-1">{e.codigo}</code>
                                        {e.nombre}
                                    </td>
                                    <td>{e.historiasCompletadas ?? 0} / {e.totalHistorias ?? 0}</td>
                                    <td>{e.puntosCompletados ?? 0} / {e.puntosTotales ?? 0}</td>
                                    <td style={{ minWidth: 140 }}>
                                        <ProgressBar now={e.porcentajeAvance ?? 0} label={`${e.porcentajeAvance ?? 0}%`} variant="info" />
                                    </td>
                                    <td className="small text-muted">{e.sprintInicio || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {velocity.length > 0 && (
                <Card className="border-0 shadow-sm mt-4">
                    <Card.Header className="bg-white fw-semibold small">Detalle velocity y predictibilidad</Card.Header>
                    <Card.Body className="p-0">
                        <Table responsive size="sm" className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Sprint</th>
                                    <th>Comprometidos</th>
                                    <th>Completados</th>
                                    <th>Diferencia</th>
                                    <th>Predictibilidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {velocity.map((v) => (
                                    <tr key={v.sprintId}>
                                        <td><code>{v.codigo}</code> {v.nombre}</td>
                                        <td>{v.comprometidos}</td>
                                        <td className="fw-semibold">{v.completados}</td>
                                        <td className={v.diff >= 0 ? 'text-success' : 'text-danger'}>
                                            {v.diff >= 0 ? '+' : ''}{v.diff}
                                        </td>
                                        <td>
                                            {v.predictibilidad != null ? (
                                                <ScrumPill
                                                    label={`${v.predictibilidad}%`}
                                                    style={predictibilityStyle(v.predictibilidad)}
                                                />
                                            ) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
}
