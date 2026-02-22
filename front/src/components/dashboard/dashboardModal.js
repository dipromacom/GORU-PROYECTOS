/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import "moment/locale/es-mx";
import { Doughnut, Line } from "react-chartjs-2";
import "./DashboardModal.css";

// ─── Constantes ──────────────────────────────────────────────────────────────

const ESTADO_LABEL = { C: "Creado", S: "Iniciado", P: "Planificado", X: "Ejecutado", E: "Cerrado" };
const ESTADO_COLOR = {
    C: "rgba(108,117,125,.82)", S: "rgba(230, 209, 28, 1)",
    P: "rgba(0,123,255,.82)", X: "rgba(40,167,69,.82)", E: "rgba(220, 53, 69, 1)",
};
const ESTADO_BORDER = { C: "#6c757d", S: "#e6d11c", P: "#007bff", X: "#28a745", E: "#dc3545" };

const TIPO_LABEL = { "1": "Ágil", "2": "Predictivo", "3": "Híbrido" };
const TIPO_COLOR = {
    "1": "rgba(111,66,193,.82)", "2": "rgba(253,126,20,.82)", "3": "rgba(32,201,151,.82)",
};
const TIPO_BORDER = { "1": "#6f42c1", "2": "#fd7e14", "3": "#20c997" };

const MODO_LABEL = { P: "Proyectos Equipo", A: "Proyectos Personales", PR: "Programas" };

// KPI definitions — color en CSS custom property --kpi-color
const KPI_CONFIG = (byEstado, pendientes, total) => [
    { label: "Total", value: total, color: "#1a3c5e", icon: "📁" },
    { label: "En Ejecución", value: byEstado.X, color: "#28a745", icon: "▶" },
    { label: "Planificados", value: byEstado.P, color: "#007bff", icon: "📋" },
    { label: "Iniciados", value: byEstado.S, color: "#17a2b8", icon: "🚀" },
    { label: "Cerrados", value: byEstado.E, color: "#343a40", icon: "🔒" },
    { label: "Creados", value: byEstado.C, color: "#6c757d", icon: "🆕" },
    { label: "Pend. Asig.", value: pendientes, color: "#fd7e14", icon: "⚠", sub: "Sin director" },
];

// ─── Opciones Donut — fábrica compartida ─────────────────────────────────────

function makeDonutOptions(total) {
    return {
        cutoutPercentage: 70,
        maintainAspectRatio: false,
        animation: { animateScale: true },
        legend: { display: false },
        tooltips: {
            backgroundColor: "rgba(17,40,64,.92)",
            bodyFontFamily: "'Inter', sans-serif",
            bodyFontSize: 12,
            xPadding: 10,
            yPadding: 8,
            callbacks: {
                label: (item, chartData) => {
                    const val = chartData.datasets[0].data[item.index];
                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                    return ` ${chartData.labels[item.index]}: ${val}  (${pct}%)`;
                },
            },
        },
    };
}

// ─── Leyenda con porcentajes (compartida) ─────────────────────────────────────

function DonutLegend({ labels, borders, values, total }) {
    return (
        <div className="db-donut-legend">
            {labels.map((label, i) => {
                const val = values[i] || 0;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return (
                    <div key={label} className="db-donut-legend-item">
                        <span className="db-legend-dot" style={{ background: borders[i] }} />
                        <span className="db-legend-name">{label}</span>
                        <span className="db-legend-val">{val}</span>
                        <span className="db-legend-pct">{pct}%</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Donut: Estado ────────────────────────────────────────────────────────────

function EstadoDonutChart({ byEstado, total }) {
    const keys = ["C", "S", "P", "X", "E"];
    const labels = keys.map((k) => ESTADO_LABEL[k]);
    const colors = keys.map((k) => ESTADO_COLOR[k]);
    const borders = keys.map((k) => ESTADO_BORDER[k]);
    const values = keys.map((k) => byEstado[k] || 0);

    const data = {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderColor: borders, borderWidth: 2, hoverBorderWidth: 3 }],
    };

    return (
        <>
            <div className="db-donut-chart-wrap">
                <Doughnut data={data} options={makeDonutOptions(total)} />
                <div className="db-donut-center">
                    <div className="db-donut-center-num">{total}</div>
                    <div className="db-donut-center-lbl">total</div>
                </div>
            </div>
            <DonutLegend labels={labels} borders={borders} values={values} total={total} />
        </>
    );
}

// ─── Donut: Metodología ───────────────────────────────────────────────────────

function TipoDonutChart({ byTipo, total }) {
    const keys = ["1", "2", "3"];
    const labels = keys.map((k) => TIPO_LABEL[k]);
    const colors = keys.map((k) => TIPO_COLOR[k]);
    const borders = keys.map((k) => TIPO_BORDER[k]);
    const values = keys.map((k) => byTipo[k] || 0);

    const data = {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderColor: borders, borderWidth: 2, hoverBorderWidth: 3 }],
    };

    return (
        <>
            <div className="db-donut-chart-wrap">
                <Doughnut data={data} options={makeDonutOptions(total)} />
                <div className="db-donut-center">
                    <div className="db-donut-center-num">{total}</div>
                    <div className="db-donut-center-lbl">total</div>
                </div>
            </div>
            <DonutLegend labels={labels} borders={borders} values={values} total={total} />
        </>
    );
}

// ─── Line chart ───────────────────────────────────────────────────────────────

function CreadosPorMesChart({ byMonth }) {
    const labels = byMonth.map(([m]) => m);
    const values = byMonth.map(([, v]) => v);

    const data = {
        labels,
        datasets: [{
            label: "Proyectos creados",
            data: values,
            fill: true,
            backgroundColor: "rgba(26,60,94,.08)",
            borderColor: "#1a3c5e",
            borderWidth: 2,
            pointBackgroundColor: "#1a3c5e",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            lineTension: 0.3,
        }],
    };

    const options = {
        maintainAspectRatio: false,
        legend: { display: false },
        scales: {
            xAxes: [{
                gridLines: { display: false },
                ticks: { fontSize: 11, fontColor: "#9badbf", fontFamily: "'Inter'" },
            }],
            yAxes: [{
                gridLines: { color: "rgba(26,60,94,.06)", drawBorder: false },
                ticks: { fontSize: 11, fontColor: "#9badbf", beginAtZero: true, precision: 0, fontFamily: "'IBM Plex Mono'" },
            }],
        },
        tooltips: {
            backgroundColor: "rgba(17,40,64,.92)",
            bodyFontFamily: "'IBM Plex Mono'",
            bodyFontSize: 13,
            xPadding: 10, yPadding: 8,
            callbacks: {
                label: (item) => ` ${item.yLabel} proyecto${item.yLabel !== 1 ? "s" : ""}`,
            },
        },
    };

    return <Line data={data} options={options} />;
}

// ─── Tabla ────────────────────────────────────────────────────────────────────

function TablaProyectos({ projects }) {
    return (
        <div className="db-table-wrap">
            <table className="db-table">
                <thead>
                    <tr>
                        {["Nombre", "Director", "Inicio", "Estado", "Asig."].map((h) => (
                            <th key={h}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {projects.map((p) => {
                        const director = p.DirectorProyecto?.Persona
                            ? `${p.DirectorProyecto.Persona.nombre} ${p.DirectorProyecto.Persona.apellido || ""}`.trim()
                            : "—";
                        return (
                            <tr key={p.id}>
                                <td className="truncate">{p.nombre}</td>
                                <td style={{ whiteSpace: "nowrap" }}>{director}</td>
                                <td style={{ whiteSpace: "nowrap", fontFamily: "'IBM Plex Mono'", fontSize: 11 }}>
                                    {p.fecha_inicio ? moment(p.fecha_inicio).format("DD/MM/YY") : "—"}
                                </td>
                                <td>
                                    <span
                                        className="db-status-pill"
                                        style={{ background: ESTADO_BORDER[p.estado] || "#6c757d" }}
                                    >
                                        {ESTADO_LABEL[p.estado] || p.estado}
                                    </span>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    {p.pendiente_asignacion
                                        ? <span style={{ color: "#fd7e14", fontWeight: 700 }}>⚠</span>
                                        : <span style={{ color: "#28a745" }}>✔</span>
                                    }
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Tab: Vista General ───────────────────────────────────────────────────────

function TabGeneral({ projects }) {
    const total = projects.length;

    const byEstado = useMemo(() => {
        const c = { C: 0, S: 0, P: 0, X: 0, E: 0 };
        projects.forEach((p) => { if (c[p.estado] !== undefined) c[p.estado]++; });
        return c;
    }, [projects]);

    const byTipo = useMemo(() => {
        const c = { "1": 0, "2": 0, "3": 0 };
        projects.forEach((p) => {
            const k = String(p.tipo_proyecto);
            if (c[k] !== undefined) c[k]++;
        });
        return c;
    }, [projects]);

    const byDirector = useMemo(() => {
        const map = {};
        projects.forEach((p) => {
            const nombre = p.DirectorProyecto?.Persona
                ? `${p.DirectorProyecto.Persona.nombre} ${p.DirectorProyecto.Persona.apellido || ""}`.trim()
                : "Sin director";
            map[nombre] = (map[nombre] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
    }, [projects]);

    const byDpto = useMemo(() => {
        const map = {};
        projects.forEach((p) => {
            const d = p.Departamento?.nombre || "Sin departamento";
            map[d] = (map[d] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [projects]);

    const byMonth = useMemo(() => {
        const months = {};
        for (let i = 5; i >= 0; i--)
            months[moment().subtract(i, "months").format("MMM YY")] = 0;
        projects.forEach((p) => {
            const k = moment(p.fecha_creacion).format("MMM YY");
            if (months[k] !== undefined) months[k]++;
        });
        return Object.entries(months);
    }, [projects]);

    const pendientes = projects.filter((p) => p.pendiente_asignacion).length;
    const kpis = KPI_CONFIG(byEstado, pendientes, total);
    const maxDir = byDirector[0]?.[1] || 1;

    return (
        <div className="db-flex-col">

            {/* ── KPIs ── */}
            <div className="db-kpi-strip-row">
                {kpis.map(({ label, value, color, icon, sub }) => (
                    <div
                        key={label}
                        className="db-kpi"
                        style={{ "--kpi-color": color }}
                    >
                        <div className="db-kpi-content">
                            <div className="db-kpi-label">{label}</div>
                            <div className="db-kpi-value">{value}</div>
                            {sub && <div className="db-kpi-sub">{sub}</div>}
                        </div>

                        <div className="db-kpi-icon-wrapper">
                            {icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Donuts — mismo tamaño, mismo layout ── */}
            <div className="db-donut-row">
                <div className="db-card">
                    <div className="db-section-title">📊 Distribución por Estado</div>
                    <EstadoDonutChart byEstado={byEstado} total={total} />
                </div>
                <div className="db-card">
                    <div className="db-section-title">🔖 Metodología de Proyecto</div>
                    <TipoDonutChart byTipo={byTipo} total={total} />
                </div>
            </div>

            {/* ── Line chart ── */}
            <div className="db-card">
                <div className="db-section-title">📅 Proyectos Creados — últimos 6 meses</div>
                <div className="db-line-wrap">
                    <CreadosPorMesChart byMonth={byMonth} />
                </div>
            </div>

            {/* ── Tabla + Director + Departamentos ── */}
            <div className="db-row">
                <div className="db-card" style={{ flex: 2, minWidth: 320 }}>
                    <div className="db-section-title">📋 Resumen de Proyectos</div>
                    <TablaProyectos projects={projects} />
                </div>

                <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="db-card">
                        <div className="db-section-title">👤 Por Director</div>
                        {byDirector.length === 0
                            ? <p style={{ fontSize: 12, color: "#aaa" }}>Sin datos</p>
                            : byDirector.map(([name, val]) => (
                                <div key={name} className="db-bar-row">
                                    <div className="db-bar-header">
                                        <span className="db-bar-name">{name}</span>
                                        <span className="db-bar-count">{val}</span>
                                    </div>
                                    <div className="db-bar-track">
                                        <div
                                            className="db-bar-fill"
                                            style={{ width: `${Math.round((val / maxDir) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    {byDpto.length > 0 && (
                        <div className="db-card">
                            <div className="db-section-title">🏢 Departamentos</div>
                            <div className="db-chip-wrap">
                                {byDpto.map(([dpto, cnt]) => (
                                    <div key={dpto} className="db-chip">
                                        {dpto}
                                        <span className="db-chip-count">{cnt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

function DashboardModal({ show, onHide, projectList = [], modo = "P" }) {
    const [activeTab, setActiveTab] = useState("general");
    const modoLabel = MODO_LABEL[modo] || "Proyectos";

    const tabs = [
        { key: "general", label: "📌 Vista General" },
        { key: "detalle", label: "🔍 Análisis Detallado", soon: true },
    ];

    return (
        <Modal show={show} onHide={onHide} size="xl" centered dialogClassName="db-modal">

            <Modal.Header closeButton>
                <Modal.Title>
                    📊 Dashboard — Cartera de {modoLabel}
                    <span className="db-header-badge">
                        {projectList.length} proyecto{projectList.length !== 1 ? "s" : ""}
                    </span>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Tab bar */}
                <div className="db-tabs-bar">
                    {tabs.map(({ key, label, soon }) => (
                        <button
                            key={key}
                            className={`db-tab-link${activeTab === key ? " active" : ""}`}
                            onClick={() => setActiveTab(key)}
                        >
                            {label}
                            {soon && <span className="db-badge-soon">Próx.</span>}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="db-scroll">
                    {activeTab === "general" && (
                        projectList.length === 0
                            ? (
                                <div className="db-empty">
                                    <div className="db-empty-icon">📂</div>
                                    <p>No hay proyectos con los filtros actuales.</p>
                                </div>
                            )
                            : <TabGeneral projects={projectList} />
                    )}

                    {activeTab === "detalle" && (
                        <div className="db-wip">
                            <div className="db-wip-icon">🚧</div>
                            <h5>Análisis Detallado — en construcción</h5>
                            <p>
                                Próximamente: desempeño de ejecución, costos, encuestas de satisfacción,
                                historial de estados, riesgo promedio, informes de avance y más.
                            </p>
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <button className="db-close-btn" onClick={onHide}>Cerrar</button>
            </Modal.Footer>

        </Modal>
    );
}

export default DashboardModal;