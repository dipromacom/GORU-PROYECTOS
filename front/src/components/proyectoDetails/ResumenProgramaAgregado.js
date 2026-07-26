import React, { useMemo } from "react";
import { Row, Col, Card, Badge, Table, Accordion } from "react-bootstrap";
import SummaryChart from '../summaryChart/SummaryChart';
import "./ResumenProgramaAgregado.css";

const ESTADO_LABELS = {
    C: "Creado",
    P: "Planificado",
    S: "Iniciado",
    X: "Ejecutado",
    E: "Cerrado",
};

const ESTADO_COLORS = {
    C: "secondary",
    P: "info",
    S: "warning",
    X: "primary",
    E: "danger",
};

const formatCurrency = (value) => {
    if (!value) return "$0.00";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
};

const getPercentageColor = (pct) => {
    if (pct >= 80) return "success";
    if (pct >= 50) return "warning";
    return "danger";
};

/**
 * Componente que muestra el resumen agregado del programa (sub-pestaña "Proyectos")
 * Recibe el objeto `resumen` con la estructura: { programa, proyectos[], totales }
 */
function ResumenProgramaAgregado({ resumen }) {
    // Safe destructuring with defaults
    const programa = resumen?.programa || {};
    const proyectos = resumen?.proyectos || [];
    const t = resumen?.totales || {};

    // Derived rows for each accordion section
    const riesgoRows = useMemo(() => {
        if (!proyectos.length) return [];
        return proyectos
            .filter(p => (p.riesgos?.total || 0) > 0)
            .map(p => ({
                proyecto: p.nombre,
                total: p.riesgos?.total || 0,
                altos: p.riesgos?.altos || 0,
                medios: p.riesgos?.medios || 0,
                bajos: p.riesgos?.bajos || 0,
                cerrados: p.riesgos?.cerrados || 0,
            }));
    }, [proyectos]);

    const costRows = useMemo(() => {
        if (!proyectos.length) return [];
        return proyectos.map(p => ({
            proyecto: p.nombre,
            presupuesto: p.costos?.presupuesto || 0,
            ejecutado: p.costos?.ejecutado || 0,
            desviacion: p.costos?.desviacion || 0,
            contingencia: p.costos?.contingencia || 0,
            gestion: p.costos?.gestion || 0,
            contingenciaReal: p.costos?.contingenciaReal || 0,
            gestionReal: p.costos?.gestionReal || 0,
        }));
    }, [proyectos]);

    const entregableRows = useMemo(() => {
        if (!proyectos.length) return [];
        return proyectos.map(p => ({
            proyecto: p.nombre,
            total: p.alcance?.total || 0,
            completados: p.alcance?.completados || 0,
            porcentaje: p.alcance?.porcentaje || 0,
        }));
    }, [proyectos]);

    const hitoRows = useMemo(() => {
        if (!proyectos.length) return [];
        return proyectos.map(p => ({
            proyecto: p.nombre,
            total: p.hitos?.total || 0,
            cumplidos: p.hitos?.cumplidos || 0,
            vencidos: p.hitos?.vencidos || 0,
            pendientes: p.hitos?.pendientes || 0,
            porcentaje: p.hitos?.porcentaje || 0,
        }));
    }, [proyectos]);

    const calidadRows = useMemo(() => {
        if (!proyectos.length) return [];
        return proyectos.map(p => ({
            proyecto: p.nombre,
            total: p.calidad?.total || 0,
            cumplidas: p.calidad?.cumplidas || 0,
            porcentaje: p.calidad?.porcentaje || 0,
        }));
    }, [proyectos]);

    const leccionRows = useMemo(() => {
        if (!proyectos.length) return [];
        return proyectos
            .filter(p => (p.leccionesAprendidas?.total || 0) > 0)
            .map(p => ({
                proyecto: p.nombre,
                total: p.leccionesAprendidas?.total || 0,
            }));
    }, [proyectos]);

    // Safe accessors for totals
    const alcance = t.alcance || {};
    const hitos = t.hitos || {};
    const costos = t.costos || {};
    const calidad = t.calidad || {};
    const riesgos = t.riesgos || {};
    const leccionesAprendidas = t.leccionesAprendidas || {};

    // Compute risk index for chart (weighted: altos=1, medios=0.5)
    const riesgoIndex = useMemo(() => {
        if (!riesgos.total) return 0;
        return Math.round(((riesgos.altos || 0) * 1 + (riesgos.medios || 0) * 0.5) / riesgos.total * 100);
    }, [riesgos]);

    return (
        <div className="rpa-container">
            {/* Gráficos de Resumen - estilo igual a Resumen de Ejecución */}
            {Object.keys(t).length > 0 && (
                <Row className="mb-4" style={{ rowGap: "50px", alignItems: "end", paddingBottom: "40px" }}>
                    <Col md={4} className="d-flex justify-content-center pb-4">
                        <SummaryChart type="Avance de Alcance" value={alcance.porcentaje || 0} />
                    </Col>
                    <Col md={4} className="d-flex justify-content-center pb-4">
                        <SummaryChart type="Avance de Hitos" value={hitos.porcentaje || 0} />
                    </Col>
                    <Col md={4} className="d-flex justify-content-center pb-4">
                        <SummaryChart type="cost" value={costos.desviacionPorcentaje || 0} />
                    </Col>
                    <Col md={4} className="d-flex justify-content-center pb-4">
                        <SummaryChart type="Avance de Calidad" value={calidad.porcentaje || 0} />
                    </Col>
                    <Col md={4} className="d-flex justify-content-center pb-4">
                        <SummaryChart type="risk" value={riesgoIndex} />
                    </Col>
                </Row>
            )}

            {/* Tabs de Detalle por Categoría - Compatible con react-bootstrap v1 */}
            {proyectos.length > 0 && Object.keys(t).length > 0 && (
                <Accordion defaultActiveKey="0" className="rpa-accordion mt-4">
                    {/* Resumen General */}
                    <Card className="rpa-accordion-card">
                        <Accordion.Toggle as={Card.Header} eventKey="0" className="rpa-accordion-header">
                            <i className="bi bi-grid-3x3-gap me-2" />
                            Resumen General por Proyecto
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table className="table table-sm table-hover rpa-table">
                                        <thead>
                                            <tr>
                                                <th>Proyecto</th>
                                                <th className="text-center">Estado</th>
                                                <th className="text-center">Alcance %</th>
                                                <th className="text-center">Hitos %</th>
                                                <th className="text-end">Presupuesto</th>
                                                <th className="text-end">Ejecutado</th>
                                                <th className="text-end">Desviación</th>
                                                <th className="text-center">Calidad %</th>
                                                <th className="text-center">Riesgos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {proyectos.map(p => (
                                                <tr key={p.id} style={{ cursor: "default" }}>
                                                    <td className="fw-medium">{p.nombre}</td>
                                                    <td className="text-center">
                                                        <Badge bg={ESTADO_COLORS[p.estado] || "secondary"}>{ESTADO_LABELS[p.estado]}</Badge>
                                                    </td>
                                                    <td className="text-center"><span className={`fw-bold text-${getPercentageColor(p.alcance?.porcentaje || 0)}`}>{p.alcance?.porcentaje || 0}%</span></td>
                                                    <td className="text-center"><span className={`fw-bold text-${getPercentageColor(p.hitos?.porcentaje || 0)}`}>{p.hitos?.porcentaje || 0}%</span></td>
                                                    <td className="text-end">{formatCurrency(p.costos?.presupuesto)}</td>
                                                    <td className="text-end">{formatCurrency(p.costos?.ejecutado)}</td>
                                                    <td className="text-end"><span className={(p.costos?.desviacion || 0) > 0 ? "text-danger fw-bold" : "text-success fw-bold"}>{formatCurrency(p.costos?.desviacion)}</span></td>
                                                    <td className="text-center"><span className={`fw-bold text-${getPercentageColor(p.calidad?.porcentaje || 0)}`}>{p.calidad?.porcentaje || 0}%</span></td>
                                                    <td className="text-center"><span className="badge bg-danger">{p.riesgos?.altos || 0}</span> <span className="badge bg-warning text-dark ms-1">{p.riesgos?.medios || 0}</span> <span className="badge bg-success ms-1">{p.riesgos?.bajos || 0}</span></td>
                                                </tr>
                                            ))}
                                            <tr className="table-secondary fw-bold">
                                                <td>TOTAL</td>
                                                <td></td>
                                                <td className="text-center">{alcance.porcentaje || 0}%</td>
                                                <td className="text-center">{hitos.porcentaje || 0}%</td>
                                                <td className="text-end">{formatCurrency(costos.presupuestoTotal)}</td>
                                                <td className="text-end">{formatCurrency(costos.ejecutadoTotal)}</td>
                                                <td className="text-end text-danger">{formatCurrency(costos.desviacionTotal)}</td>
                                                <td className="text-center">{calidad.porcentaje || 0}%</td>
                                                <td className="text-center"><span className="badge bg-danger">{riesgos.altos || 0}</span> <span className="badge bg-warning text-dark ms-1">{riesgos.medios || 0}</span> <span className="badge bg-success ms-1">{riesgos.bajos || 0}</span></td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>

                    {/* Alcance / Entregables */}
                    <Card className="rpa-accordion-card">
                        <Accordion.Toggle as={Card.Header} eventKey="1" className="rpa-accordion-header">
                            <i className="bi bi-kanban me-2" />
                            Alcance y Entregables ({alcance.totalEntregables || 0} total, {alcance.completados || 0} completados)
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="1">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table className="table table-sm table-hover">
                                        <thead><tr><th>Proyecto</th><th className="text-center">Total Entregables</th><th className="text-center">Completados</th><th className="text-center">% Avance</th></tr></thead>
                                        <tbody>
                                            {entregableRows.map((r, i) => (
                                                <tr key={i}><td>{r.proyecto}</td><td className="text-center">{r.total}</td><td className="text-center">{r.completados}</td><td className="text-center"><span className={`fw-bold text-${getPercentageColor(r.porcentaje)}`}>{r.porcentaje}%</span></td></tr>
                                            ))}
                                            <tr className="table-secondary fw-bold"><td>TOTAL</td><td className="text-center">{alcance.totalEntregables || 0}</td><td className="text-center">{alcance.completados || 0}</td><td className="text-center">{alcance.porcentaje || 0}%</td></tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>

                    {/* Hitos */}
                    <Card className="rpa-accordion-card">
                        <Accordion.Toggle as={Card.Header} eventKey="2" className="rpa-accordion-header">
                            <i className="bi bi-flag me-2" />
                            Hitos ({hitos.total || 0} total, {hitos.cumplidos || 0} cumplidos, {hitos.vencidos || 0} vencidos)
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="2">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table className="table table-sm table-hover">
                                        <thead><tr><th>Proyecto</th><th className="text-center">Total</th><th className="text-center text-success">Cumplidos</th><th className="text-center text-danger">Vencidos</th><th className="text-center text-warning">Pendientes</th><th className="text-center">% Cumplimiento</th></tr></thead>
                                        <tbody>
                                            {hitoRows.map((r, i) => (
                                                <tr key={i}><td>{r.proyecto}</td><td className="text-center">{r.total}</td><td className="text-center text-success">{r.cumplidos}</td><td className="text-center text-danger">{r.vencidos}</td><td className="text-center text-warning">{r.pendientes}</td><td className="text-center"><span className={`fw-bold text-${getPercentageColor(r.porcentaje)}`}>{r.porcentaje}%</span></td></tr>
                                            ))}
                                            <tr className="table-secondary fw-bold"><td>TOTAL</td><td className="text-center">{hitos.total || 0}</td><td className="text-center text-success">{hitos.cumplidos || 0}</td><td className="text-center text-danger">{hitos.vencidos || 0}</td><td className="text-center text-warning">{hitos.pendientes || 0}</td><td className="text-center">{hitos.porcentaje || 0}%</td></tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>

                    {/* Costos */}
                    <Card className="rpa-accordion-card">
                        <Accordion.Toggle as={Card.Header} eventKey="3" className="rpa-accordion-header">
                            <i className="bi bi-currency-dollar me-2" />
                            Costos y Presupuesto (Desviación total: {formatCurrency(costos.desviacionTotal)} / {costos.desviacionPorcentaje || 0}%)
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="3">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table className="table table-sm table-hover">
                                        <thead><tr><th>Proyecto</th><th className="text-end">Presupuesto</th><th className="text-end">Ejecutado</th><th className="text-end">Desviación</th><th className="text-end">Res. Contingencia</th><th className="text-end">Res. Gestión</th><th className="text-end">Cont. Real</th><th className="text-end">Gest. Real</th></tr></thead>
                                        <tbody>
                                            {costRows.map((r, i) => (
                                                <tr key={i}><td>{r.proyecto}</td><td className="text-end">{formatCurrency(r.presupuesto)}</td><td className="text-end">{formatCurrency(r.ejecutado)}</td><td className="text-end"><span className={r.desviacion > 0 ? "text-danger fw-bold" : "text-success fw-bold"}>{formatCurrency(r.desviacion)}</span></td><td className="text-end">{formatCurrency(r.contingencia)}</td><td className="text-end">{formatCurrency(r.gestion)}</td><td className="text-end">{formatCurrency(r.contingenciaReal)}</td><td className="text-end">{formatCurrency(r.gestionReal)}</td></tr>
                                            ))}
                                            <tr className="table-secondary fw-bold"><td>TOTAL</td><td className="text-end">{formatCurrency(costos.presupuestoTotal)}</td><td className="text-end">{formatCurrency(costos.ejecutadoTotal)}</td><td className="text-end text-danger">{formatCurrency(costos.desviacionTotal)}</td><td className="text-end">{formatCurrency(costos.reservContingencia)}</td><td className="text-end">{formatCurrency(costos.reservGestion)}</td><td className="text-end">{formatCurrency(costos.reservContingenciaReal)}</td><td className="text-end">{formatCurrency(costos.reservGestionReal)}</td></tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>

                    {/* Calidad */}
                    <Card className="rpa-accordion-card">
                        <Accordion.Toggle as={Card.Header} eventKey="4" className="rpa-accordion-header">
                            <i className="bi bi-shield-check me-2" />
                            Calidad ({calidad.totalMetricas || 0} métricas, {calidad.cumplidas || 0} cumplidas)
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="4">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table className="table table-sm table-hover">
                                        <thead><tr><th>Proyecto</th><th className="text-center">Total Métricas</th><th className="text-center">Cumplidas</th><th className="text-center">% Cumplimiento</th></tr></thead>
                                        <tbody>
                                            {calidadRows.map((r, i) => (
                                                <tr key={i}><td>{r.proyecto}</td><td className="text-center">{r.total}</td><td className="text-center">{r.cumplidas}</td><td className="text-center"><span className={`fw-bold text-${getPercentageColor(r.porcentaje)}`}>{r.porcentaje}%</span></td></tr>
                                            ))}
                                            <tr className="table-secondary fw-bold"><td>TOTAL</td><td className="text-center">{calidad.totalMetricas || 0}</td><td className="text-center">{calidad.cumplidas || 0}</td><td className="text-center">{calidad.porcentaje || 0}%</td></tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>

                    {/* Riesgos */}
                    <Card className="rpa-accordion-card">
                        <Accordion.Toggle as={Card.Header} eventKey="5" className="rpa-accordion-header">
                            <i className="bi bi-exclamation-triangle me-2" />
                            Riesgos ({riesgos.total || 0} total, {riesgos.altos || 0} altos, {riesgos.medios || 0} medios, {riesgos.bajos || 0} bajos)
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="5">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table className="table table-sm table-hover">
                                        <thead><tr><th>Proyecto</th><th className="text-center">Total</th><th className="text-center text-danger">Altos</th><th className="text-center text-warning">Medios</th><th className="text-center text-success">Bajos</th><th className="text-center">Cerrados</th></tr></thead>
                                        <tbody>
                                            {riesgoRows.map((r, i) => (
                                                <tr key={i}><td>{r.proyecto}</td><td className="text-center">{r.total}</td><td className="text-center text-danger">{r.altos}</td><td className="text-center text-warning">{r.medios}</td><td className="text-center text-success">{r.bajos}</td><td className="text-center">{r.cerrados}</td></tr>
                                            ))}
                                            <tr className="table-secondary fw-bold"><td>TOTAL</td><td className="text-center">{riesgos.total || 0}</td><td className="text-center text-danger">{riesgos.altos || 0}</td><td className="text-center text-warning">{riesgos.medios || 0}</td><td className="text-center text-success">{riesgos.bajos || 0}</td><td className="text-center">{riesgos.cerrados || 0}</td></tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>

                    {/* Lecciones Aprendidas */}
                    <Card className="rpa-accordion-card">
                        <Accordion.Toggle as={Card.Header} eventKey="7" className="rpa-accordion-header">
                            <i className="bi bi-lightbulb me-2" />
                            Lecciones Aprendidas ({leccionesAprendidas.total || 0} total)
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="7">
                            <Card.Body className="p-0">
                                {leccionRows.length > 0 ? (
                                    <div className="table-responsive">
                                        <Table className="table table-sm table-hover">
                                            <thead><tr><th>Proyecto</th><th className="text-center">Lecciones</th></tr></thead>
                                            <tbody>
                                                {leccionRows.map((r, i) => (<tr key={i}><td>{r.proyecto}</td><td className="text-center">{r.total}</td></tr>))}
                                                <tr className="table-secondary fw-bold"><td>TOTAL</td><td className="text-center">{leccionesAprendidas.total || 0}</td></tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-muted text-center py-3">No hay lecciones aprendidas registradas en los proyectos del programa</p>
                                )}
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            )}

            {/* Empty state when no data */}
            {!resumen && (
                <div className="rpa-empty">
                    <i className="bi bi-graph-up" />
                    <p>No hay datos de resumen disponibles</p>
                </div>
            )}
            {resumen && !proyectos.length && Object.keys(t).length === 0 && (
                <div className="rpa-empty">
                    <i className="bi bi-diagram-3" />
                    <p>El programa no tiene proyectos hijos con datos de ejecución</p>
                </div>
            )}
        </div>
    );
}

export default ResumenProgramaAgregado;