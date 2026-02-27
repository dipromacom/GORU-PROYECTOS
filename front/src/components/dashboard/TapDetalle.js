/* eslint-disable no-unused-vars */
/**
 * TabDetalle.js  –  Segunda pestaña del DashboardModal
 * ─────────────────────────────────────────────────────
 * Usa Redux connect() con los 5 nuevos actions de dashboard.
 * Cada action se despacha UNA SOLA VEZ al montar el componente.
 *
 * ─── Mapeo exacto de reducers ────────────────────────────────────────────────
 *  gantt.tasks            → array, cada task tiene { project_id, parent_id, progress }
 *  kanban.status          → { byId: { [id]: { title, tasks:[taskId,...] } }, allIds }
 *  kanban.tasks           → { byId: { [id]: { deadline, ... } }, allIds }
 *  project.todo           → array, cada tarea tiene { proyectoId, done, dueDate }
 *  encuesta.listaEncuestas→ array (el payload de GET_SURVEYS_DASHBOARD_SUCCESS)
 *  informeAvance.listaInformes → array (el payload de GET_INFORMES_DASHBOARD_SUCCESS)
 */

import React, { useMemo, useState, useEffect } from "react";
import { connect } from "react-redux";
import { Radar, Bar } from "react-chartjs-2";
import { actions as projectActions, selectors as projectSelectors } from "../../reducers/project";
import { actions as ganttActions, selectors as ganttSelectors } from "../../reducers/gantt";
import { actions as kanbanActions, selectors as kanbanSelectors } from "../../reducers/kanban";
import { actions as surveyActions, selectors as surveySelectors } from "../../reducers/encuesta-satisfaccion";
import { actions as informeActions, selectors as informeSelectors } from "../../reducers/informe-avance";
import { selectors as sessionSelectors } from "../../reducers/session";
import "./DashboardModal.css";

// ─── Dev flag — poner en false antes de producción ───────────────────────────
const DEBUG = process.env.NODE_ENV === "production";

// ─── Constantes ───────────────────────────────────────────────────────────────

const EJECUTADO_CERRADO = ["X", "E"];
const PLANIF_EJEC_CERRADO = ["P", "X", "E"];
const TIPO_PREDICTIVO = "2";
const TIPO_HIBRIDO = "3";
const TIPO_AGIL = "1";
const DONE_WORDS = ["done", "terminado", "completado", "cerrado", "finalizado"];

const SURVEY_FIELDS = [
    "comunicacion", "rapidez_respuesta", "manejo_reuniones",
    "cumplimiento_plazos", "cumplimiento_alcance", "calidad_entregado",
    "nivel_capacitaciones", "gestion_documentacion", "experiencia_director",
    "satisfaccion_general",
];
const SURVEY_LABELS = {
    comunicacion: "Comunicación", rapidez_respuesta: "Rapidez",
    manejo_reuniones: "Reuniones", cumplimiento_plazos: "Plazos",
    cumplimiento_alcance: "Alcance", calidad_entregado: "Calidad",
    nivel_capacitaciones: "Capacitación", gestion_documentacion: "Documentación",
    experiencia_director: "Director", satisfaccion_general: "Satisfacción",
};
const ESTADO_COLOR = { C: "#6c757d", S: "#e6d11c", P: "#007bff", X: "#28a745", E: "#dc3545" };
const ESTADO_LABEL = { C: "Creado", S: "Iniciado", P: "Planificado", X: "Ejecutado", E: "Cerrado" };

// ─── Helpers: normalización de arrays desde el store ─────────────────────────

/**
 * El payload de los actions dashboard puede llegar como:
 *   - Array directamente: [...]
 *   - Objeto con propiedad: { encuestas: [...] } o { informes: [...] } o { data: [...] }
 * Esta función normaliza cualquiera de esos formatos a array.
 */
const toArray = (val, ...keys) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    for (const k of keys) {
        if (Array.isArray(val[k])) return val[k];
    }
    return [];
};

/**
 * Extrae el project_id de una entidad — Sequelize puede nombrar la FK de varias formas.
 */
const getPid = (obj) =>
    obj?.proyecto_id ?? obj?.ProyectoId ?? obj?.proyectoId ?? obj?.project_id ?? obj?.projectId ?? null;

// ─── Helpers de cálculo ───────────────────────────────────────────────────────

const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

const pctCompletados = (arr) => {
    if (!Array.isArray(arr) || !arr.length) return null;
    return Math.round((arr.filter((i) => i.completado).length / arr.length) * 100);
};

/**
 * Desviación de costo — misma fórmula que InputCostosList:
 *   (presupuestoRealTotal / presupuestoEstimadoTotal) × 100
 */
const desvCosto = (p) => {
    const ents = Array.isArray(p.costo_entregable) ? p.costo_entregable : [];
    if (!ents.length) return null;
    const estimado = ents.reduce((s, c) => s + (parseFloat(c.costo) || 0), 0)
        + (parseFloat(p.costo_reserva_contingencia) || 0)
        + (parseFloat(p.costo_reserva_gestion) || 0);
    const real = ents.reduce((s, c) => s + (parseFloat(c.costoReal) || 0), 0)
        + (parseFloat(p.costo_reserva_contingencia_real) || 0)
        + (parseFloat(p.costo_reserva_gestion_real) || 0);
    if (!estimado) return null;
    return parseFloat(((real / estimado) * 100).toFixed(2));
};

const promedioRiesgo = (riesgos) => {
    if (!Array.isArray(riesgos) || !riesgos.length) return null;
    const vals = riesgos.map((r) => Number(r.valor) || 0).filter((v) => v > 0);
    return vals.length ? Math.round((avg(vals) / 9) * 100) : null;
};

/**
 * Normaliza el store de gantt a un array de tasks.
 * El controller retorna { tasks: { allIds, byId } } y el saga puede guardarlo
 * como { allIds, byId } o como array según la implementación del saga.
 * Esta función maneja ambos casos.
 */
const ganttStoreToArray = (ganttTasksFromStore) => {
    if (!ganttTasksFromStore) return [];
    // Caso 1: ya es array (saga hizo payload.map(...) )
    if (Array.isArray(ganttTasksFromStore)) return ganttTasksFromStore;
    // Caso 2: objeto normalizado { byId, allIds } (saga guardó payload directamente)
    if (ganttTasksFromStore.byId) return Object.values(ganttTasksFromStore.byId);
    return [];
};

/**
 * Avance % Gantt para un array de tasks de UN proyecto.
 * Solo tareas individuales (type !== "group"), igual que projectSummary.avgProgress.
 */
const avanceGanttTareas = (tasks) => {
    if (!Array.isArray(tasks) || !tasks.length) return null;
    const individuales = tasks.filter((t) => t.type !== "group");
    if (!individuales.length) return null;
    return Math.round(
        individuales.reduce((acc, t) => acc + (parseFloat(t.progress) || 0), 0) / individuales.length
    );
};

/** Índice de desempeño (0-2) para arrays de alcance/hitos/calidad del projectList */
const indiceDesempeno = (arr) => {
    if (!Array.isArray(arr) || !arr.length) return null;
    const completados = arr.filter((i) => i.completado).length;
    const hoy = new Date();
    const vencidos = arr.filter(
        (i) => !i.completado && (i.deadline || i.date) && new Date(i.deadline || i.date) < hoy
    ).length;
    const denom = completados + vencidos;
    return denom ? Math.min(+(completados / denom).toFixed(2), 2) : null;
};

/**
 * Índice de desempeño Gantt (0-2) — misma lógica que projectSummary.avgPerformance:
 * Para cada tarea individual calcula el progreso esperado a hoy.
 * SPI = progreso_real / progreso_esperado, ignorando tareas futuras (expectedProgress = 0).
 */
const calcGanttPerformance = (task) => {
    const start = new Date(task.start_date);
    const end = new Date(task.end_date);
    const now = new Date();
    const totalMs = end - start;
    const elapsedMs = Math.min(now - start, totalMs);
    if (totalMs <= 0 || elapsedMs <= 0) return { performance: 0, expectedProgress: 0, isFuture: true };
    const expectedProgress = (elapsedMs / totalMs) * 100;
    const performance = expectedProgress > 0
        ? Math.min((parseFloat(task.progress) || 0) / expectedProgress, 2)
        : 0;
    return { performance, expectedProgress, isFuture: false };
};

const indiceGanttTareas = (tasks) => {
    if (!Array.isArray(tasks) || !tasks.length) return null;
    const individuales = tasks.filter((t) => t.type !== "group");
    if (!individuales.length) return null;

    let totalPerformance = 0;
    let validCount = 0;
    individuales.forEach((t) => {
        const m = calcGanttPerformance(t);
        if (!m.isFuture && m.expectedProgress > 0) {
            totalPerformance += m.performance;
            validCount++;
        }
    });
    // Si todas las tareas son futuras, no hay base para calcular
    if (validCount === 0) return null;
    return Math.min(+(totalPerformance / validCount).toFixed(2), 2);
};

/**
 * Índice Kanban (0-2) — lógica SPI igual que calculateEfficiency():
 *   EV = tareas cerradas (closed_at) a tiempo (≤ deadline) o sin deadline
 *   PV = tareas cuyo deadline ya venció a hoy
 *   Si PV = 0: return 2.0 si hay cerradas, else 1.0
 */
const indiceKanbanStore = (kanbanStatus, kanbanTasks) => {
    const tasksById = kanbanTasks?.byId;
    if (!tasksById || !Object.keys(tasksById).length) return null;

    const allTasks = Object.values(tasksById);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // EV: cerradas a tiempo
    const successfulTasks = allTasks.filter((t) => {
        if (!t.closed_at) return false;
        const closedAt = new Date(t.closed_at.split("T")[0] + "T00:00:00");
        const deadline = t.deadline ? new Date(t.deadline.split("T")[0] + "T00:00:00") : null;
        return !deadline || closedAt <= deadline;
    }).length;

    // PV: tareas cuyo deadline ya llegó
    const shouldBeDone = allTasks.filter((t) => {
        if (!t.deadline) return false;
        const deadline = new Date(t.deadline.split("T")[0] + "T00:00:00");
        return deadline <= today;
    }).length;

    if (shouldBeDone === 0) return successfulTasks > 0 ? 2.0 : 1.0;
    return Math.min(+(successfulTasks / shouldBeDone).toFixed(2), 2.0);
};

/**
 * Índice To-Do (0-2) — lógica SPI igual que performanceData:
 *   EV = tareas cerradas (done=true) con closeDate ≤ duedate
 *   PV = tareas cuyo duedate ya llegó (done o no)
 *   Campo en DB: duedate (minúsculas), closeDate
 *   Si PV = 0: return 2.0 si hay cerradas a tiempo, else 1.0
 */
const indiceTodoTareas = (tareas) => {
    if (!Array.isArray(tareas) || !tareas.length) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // PV: tareas que ya debían estar listas
    const debianEstarListas = tareas.filter((t) => {
        const fecha = t.duedate || t.dueDate;
        if (!fecha) return false;
        const dl = new Date(fecha);
        dl.setHours(0, 0, 0, 0);
        return dl <= hoy;
    }).length;

    // EV: cerradas a tiempo (closeDate ≤ duedate)
    const cerradasATiempo = tareas.filter((t) => {
        if (!t.done || !t.closeDate) return false;
        const fecha = t.duedate || t.dueDate;
        if (!fecha) return false;
        const dl = new Date(fecha);
        dl.setHours(0, 0, 0, 0);
        const cl = new Date(t.closeDate);
        cl.setHours(0, 0, 0, 0);
        return cl <= dl;
    }).length;

    if (debianEstarListas === 0) return cerradasATiempo > 0 ? 2.0 : 1.0;
    return Math.min(+(cerradasATiempo / debianEstarListas).toFixed(2), 2.0);
};

// ─── Colores ──────────────────────────────────────────────────────────────────

const barColor = (v) => v == null ? "#9badbf" : v >= 80 ? "#28a745" : v >= 50 ? "#ffc107" : "#dc3545";
const satisfColor = (v) => { const n = parseFloat(v); return !v ? "#9badbf" : n >= 4 ? "#28a745" : n >= 3 ? "#ffc107" : "#dc3545"; };
const indiceColor = (v) => v == null ? "#9badbf" : v >= 1 ? "#28a745" : v >= 0.6 ? "#ffc107" : "#dc3545";
const indiceLabel = (v) => v == null ? "—" : v >= 1 ? "Excelente" : v >= 0.6 ? "Regular" : "Crítico";

// ─── Debug panel (solo en desarrollo) ────────────────────────────────────────

function DebugPanel({ ganttTasks, kanbanStatus, kanbanTasks, todoTareas, listaEncuestas, listaInformes }) {
    if (!DEBUG) return null;
    const s = (v) => JSON.stringify(v)?.substring(0, 120) + "…";
    return (
        <details style={{ background: "#f0f4f8", border: "1px solid #ccc", borderRadius: 6, padding: 10, marginBottom: 12, fontSize: 10, fontFamily: "monospace" }}>
            <summary style={{ cursor: "pointer", fontWeight: 700, color: "#1a3c5e" }}>🔍 Debug — datos del store (solo en desarrollo)</summary>
            <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {`ganttTasks      (${(ganttTasks || []).length} tasks): ${s(ganttTasks?.[0])}
todoTareas      (${(todoTareas || []).length} tasks): ${s(todoTareas?.[0])}
listaEncuestas  (${(listaEncuestas || []).length} enc): ${s(listaEncuestas?.[0])}
listaInformes   (${(listaInformes || []).length} inf): ${s(listaInformes?.[0])}
kanban.status   (${Object.keys(kanbanStatus?.byId || {}).length} cols): ${s(Object.values(kanbanStatus?.byId || {})[0])}
kanban.tasks    (${Object.keys(kanbanTasks?.byId || {}).length} tasks): ${s(Object.values(kanbanTasks?.byId || {})[0])}`}
            </pre>
        </details>
    );
}

// ─── Subcomponentes UI ────────────────────────────────────────────────────────

const SectionTitle = ({ children }) => <div className="db-section-title">{children}</div>;
const Card = ({ children, style = {} }) => <div className="db-card" style={style}>{children}</div>;

function MiniKpi({ label, value, color = "#1a3c5e", sub }) {
    return (
        <div className="db-kpi" style={{ "--kpi-color": color, minWidth: 150, flex: 1 }}>
            <div className="db-kpi-content">
                <div className="db-kpi-label">{label}</div>
                <div className="db-kpi-value" style={{ fontSize: 22 }}>{value ?? "—"}</div>
                {sub && <div className="db-kpi-sub">{sub}</div>}
            </div>
        </div>
    );
}

function ProgressBar({ label, value, color = "#1a3c5e", tooltip }) {
    const pct = value != null ? Math.min(Math.round(value), 100) : null;
    return (
        <div className="db-bar-row" title={tooltip}>
            <div className="db-bar-header">
                <span className="db-bar-name">{label}</span>
                <span className="db-bar-count">{value != null ? `${value}%` : "—"}</span>
            </div>
            <div className="db-bar-track">
                {pct != null
                    ? <div className="db-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    : <div style={{ width: "100%", height: "100%", background: "repeating-linear-gradient(45deg,#dce4ed,#dce4ed 4px,#eaf0f6 4px,#eaf0f6 8px)", borderRadius: 10 }} />
                }
            </div>
        </div>
    );
}

function IndiceCard({ label, value, desc }) {
    const color = indiceColor(value);
    return (
        <Card>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a3c5e", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".6px" }}>{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "var(--font-mono)" }}>
                    {value != null ? value.toFixed(2) : "—"}
                </div>
                <span className="db-status-pill" style={{ background: color, fontSize: 9 }}>{indiceLabel(value)}</span>
            </div>
            <div style={{ fontSize: 11, color: "#9badbf", marginTop: 4 }}>{desc}</div>
            <div className="db-bar-track" style={{ marginTop: 8 }}>
                <div className="db-bar-fill" style={{ width: value != null ? `${Math.min((value / 2) * 100, 100)}%` : "0%", background: color }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9badbf", marginTop: 2 }}>
                <span>0</span><span>1.0</span><span>2.0</span>
            </div>
        </Card>
    );
}

function RiesgoSemaforo({ valor }) {
    if (valor == null) return <span style={{ color: "#9badbf", fontSize: 12 }}>Sin datos</span>;
    const color = valor < 34 ? "#28a745" : valor < 67 ? "#ffc107" : "#dc3545";
    const label = valor < 34 ? "Bajo" : valor < 67 ? "Medio" : "Alto";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: color }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color }}>{label} ({valor}%)</span>
        </div>
    );
}

function StarRating({ value, max = 5 }) {
    if (value == null) return <span style={{ color: "#9badbf", fontSize: 12 }}>Sin datos</span>;
    const filled = Math.round(value);
    return (
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {Array.from({ length: max }).map((_, i) => (
                <span key={i} style={{ color: i < filled ? "#f4b942" : "#dce4ed", fontSize: 18 }}>★</span>
            ))}
            <span style={{ marginLeft: 6, fontFamily: "var(--font-mono)", fontSize: 13, color: "#6b7f94" }}>
                {Number(value).toFixed(1)} / {max}
            </span>
        </div>
    );
}

// ─── SECCIÓN 1: Resumen de Ejecución ─────────────────────────────────────────

function SeccionEjecucion({ projects, ganttTasks }) {
    const activos = useMemo(() => projects.filter((p) => EJECUTADO_CERRADO.includes(p.estado)), [projects]);

    // Normalizar ganttTasks a array (puede llegar como array o { byId, allIds })
    const ganttArray = useMemo(() => ganttStoreToArray(ganttTasks), [ganttTasks]);

    const ganttPorProyecto = useMemo(() => {
        const map = {};
        ganttArray.forEach((t) => {
            const pid = Number(t.project_id ?? t.projectId);
            if (!isNaN(pid)) {
                if (!map[pid]) map[pid] = [];
                map[pid].push(t);
            }
        });
        return map;
    }, [ganttArray]);

    const calcArr = (fn) => {
        const vals = activos.map(fn).filter((v) => v != null);
        return vals.length ? Math.round(avg(vals)) : null;
    };

    const alcance = calcArr((p) => pctCompletados(p.alcance_entregables));
    const hitos = calcArr((p) => pctCompletados(p.tiempo_fechas_criticas));
    const calidad = calcArr((p) => pctCompletados(p.calidad_metricas));
    const costo = calcArr((p) => desvCosto(p));
    const riesgo = calcArr((p) => promedioRiesgo(p.riesgos));

    const ganttVals = activos
        .filter((p) => [TIPO_PREDICTIVO, TIPO_HIBRIDO].includes(String(p.tipo_proyecto)))
        .map((p) => avanceGanttTareas(ganttPorProyecto[p.id]))
        .filter((v) => v != null);
    const gantt = ganttVals.length ? Math.round(avg(ganttVals)) : null;

    if (!activos.length) return (
        <div style={{ color: "#9badbf", fontSize: 13, padding: "12px 0" }}>
            No hay proyectos en ejecución o cerrados.
        </div>
    );

    return (
        <div className="db-flex-col">
            <div style={{ fontSize: 11, color: "#9badbf" }}>
                Basado en {activos.length} proyecto{activos.length !== 1 ? "s" : ""} en ejecución / cerrados
            </div>

            <div className="db-kpi-strip-row">
                <MiniKpi label="Avance Alcance" value={alcance != null ? `${alcance}%` : null} color="#1a3c5e" />
                <MiniKpi label="Avance Hitos" value={hitos != null ? `${hitos}%` : null} color="#007bff" />
                <MiniKpi label="Avance Calidad" value={calidad != null ? `${calidad}%` : null} color="#17a2b8" />
                <MiniKpi label="Riesgo Promedio" value={riesgo != null ? `${riesgo}%` : null} color="#e0cd1a" />
                {gantt != null && <MiniKpi label="Avance Gantt" value={`${gantt}%`} color="#6f42c1" sub="Pred. / Híbrido" />}
                <MiniKpi
                    label="Ejec. Presupuestaria"
                    value={costo != null ? `${costo}%` : null}
                    color={costo != null && costo > 100 ? "#dc3545" : "#28a745"}
                    sub={costo != null ? (costo > 100 ? "Sobre presupuesto" : "En presupuesto") : null}
                />
            </div>

            <Card>
                <SectionTitle>📊 Avance Promedio por Componente</SectionTitle>
                <ProgressBar label="Alcance" value={alcance} color={barColor(alcance)} />
                <ProgressBar label="Hitos (cronograma)" value={hitos} color={barColor(hitos)} />
                <ProgressBar label="Calidad de entregables" value={calidad} color={barColor(calidad)} />

                {/* Costo — puede superar 100% */}
                <div className="db-bar-row">
                    <div className="db-bar-header">
                        <span className="db-bar-name">Ejecución presupuestaria</span>
                        <span className="db-bar-count">{costo != null ? `${costo}%` : "—"}</span>
                    </div>
                    <div className="db-bar-track">
                        {costo != null
                            ? <div className="db-bar-fill" style={{ width: `${Math.min(costo, 100)}%`, background: costo > 100 ? "#dc3545" : "#28a745" }} />
                            : <div style={{ width: "100%", height: "100%", background: "#dce4ed", borderRadius: 10 }} />
                        }
                    </div>
                </div>
                <div style={{ marginTop: 14 }}>
                    <ProgressBar label="Riesgo promedio" value={riesgo} color={barColor(riesgo)} />
                </div>
                {gantt != null && (
                    <div style={{ marginTop: 14 }}>
                        <div className="db-bar-header">
                            <span className="db-bar-name">Avance Gantt</span>
                            <span className="db-bar-count">{gantt}%</span>
                        </div>
                        <div className="db-bar-track">
                            <div className="db-bar-fill" style={{ width: `${Math.min(gantt, 100)}%`, background: barColor(gantt) }} />
                        </div>
                    </div>
                )}
            </Card>

            <Card>
                <SectionTitle>📋 Desglose por Proyecto</SectionTitle>
                <div className="db-table-wrap">
                    <table className="db-table">
                        <thead>
                            <tr>{["Proyecto", "Tipo", "Alcance", "Hitos", "Calidad", "Gantt", "Costo %", "Riesgo"].map((h) => <th key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {activos.map((p) => {
                                const tipo = String(p.tipo_proyecto);
                                const usaGantt = [TIPO_PREDICTIVO, TIPO_HIBRIDO].includes(tipo);
                                const alc = pctCompletados(p.alcance_entregables);
                                const hit = pctCompletados(p.tiempo_fechas_criticas);
                                const cal = pctCompletados(p.calidad_metricas);
                                const gnt = usaGantt ? avanceGanttTareas(ganttPorProyecto[p.id]) : null;
                                const cst = desvCosto(p);
                                const rsk = promedioRiesgo(p.riesgos);
                                const pill = (v) => v == null
                                    ? <span style={{ color: "#9badbf" }}>—</span>
                                    : <span className="db-status-pill" style={{ background: v >= 80 ? "#28a745" : v >= 50 ? "#ffc107" : "#dc3545" }}>{v}%</span>;
                                return (
                                    <tr key={p.id}>
                                        <td className="truncate">{p.nombre}</td>
                                        <td>{{ "1": "Ágil", "2": "Pred.", "3": "Híb." }[tipo] || "—"}</td>
                                        <td>{pill(alc)}</td>
                                        <td>{pill(hit)}</td>
                                        <td>{pill(cal)}</td>
                                        <td>{usaGantt ? pill(gnt) : <span style={{ color: "#9badbf" }}>N/A</span>}</td>
                                        <td>{cst == null ? <span style={{ color: "#9badbf" }}>—</span>
                                            : <span style={{ color: cst > 100 ? "#dc3545" : "#28a745", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>{cst}%</span>}</td>
                                        <td>{rsk == null ? <span style={{ color: "#9badbf" }}>—</span>
                                            : <span className="db-status-pill" style={{ background: rsk < 34 ? "#28a745" : rsk < 67 ? "#ffc107" : "#dc3545" }}>
                                                {rsk < 34 ? "Bajo" : rsk < 67 ? "Medio" : "Alto"}
                                            </span>}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

// ─── SECCIÓN 2: Resumen de Desempeño ─────────────────────────────────────────

function SeccionDesempeno({ projects, ganttTasks, kanbanStatus, kanbanTasks, todoTareas }) {
    const activos = useMemo(() => projects.filter((p) => EJECUTADO_CERRADO.includes(p.estado)), [projects]);

    const ganttArray = useMemo(() => ganttStoreToArray(ganttTasks), [ganttTasks]);

    const ganttPorProyecto = useMemo(() => {
        const map = {};
        ganttArray.forEach((t) => {
            const pid = Number(t.project_id ?? t.projectId);
            if (!isNaN(pid)) {
                if (!map[pid]) map[pid] = [];
                map[pid].push(t);
            }
        });
        return map;
    }, [ganttArray]);

    // To-do agrupado por proyecto — field puede ser proyectoId (del modelo Tarea de Sequelize)
    const todoPorProyecto = useMemo(() => {
        const map = {};
        (todoTareas || []).forEach((t) => {
            const pid = Number(t.proyecto_id ?? t.proyectoId ?? t.projectId);
            if (!isNaN(pid)) {
                if (!map[pid]) map[pid] = [];
                map[pid].push(t);
            }
        });
        return map;
    }, [todoTareas]);

    const calcIndice = (fn) => {
        const vals = activos.map(fn).filter((v) => v != null);
        return vals.length ? +(avg(vals).toFixed(2)) : null;
    };

    const indices = {
        alcance: calcIndice((p) => indiceDesempeno(p.alcance_entregables)),
        hitos: calcIndice((p) => indiceDesempeno(p.tiempo_fechas_criticas)),
        calidad: calcIndice((p) => indiceDesempeno(p.calidad_metricas)),
        gantt: calcIndice((p) =>
            [TIPO_PREDICTIVO, TIPO_HIBRIDO].includes(String(p.tipo_proyecto))
                ? indiceGanttTareas(ganttPorProyecto[p.id])
                : null
        ),
        // Kanban viene normalizado globalmente del store (todos los proyectos del modo)
        kanban: indiceKanbanStore(kanbanStatus, kanbanTasks),
        // To-do agrupado por proyecto
        todo: calcIndice((p) => indiceTodoTareas(todoPorProyecto[p.id])),
    };

    const radarLabels = ["🎯 Alcance", "🏁 Hitos", "✅ Calidad", "📊 Kanban", "📋 To-Do", "📅 Gantt"];
    const radarValues = [
        indices.alcance, indices.hitos, indices.calidad,
        indices.kanban, indices.todo, indices.gantt,
    ].map((v) => v ?? 0);

    const radarData = {
        labels: radarLabels,
        datasets: [{
            label: "Índice de Desempeño",
            data: radarValues,
            backgroundColor: "rgba(26,60,94,.15)",
            borderColor: "#1a3c5e",
            borderWidth: 2,
            pointBackgroundColor: "#1a3c5e",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
        }],
    };

    const radarOptions = {
        maintainAspectRatio: false,
        scale: {
            ticks: {
                beginAtZero: true, max: 2, stepSize: 0.5,
                fontFamily: "'IBM Plex Mono'", fontSize: 10,
                fontColor: "#9badbf", backdropColor: "transparent",
            },
            pointLabels: { fontFamily: "'Inter'", fontSize: 11, fontColor: "#1a2e42", fontStyle: "bold" },
            gridLines: { color: "rgba(26,60,94,.08)" },
            angleLines: { color: "rgba(26,60,94,.08)" },
        },
        legend: { display: false },
        tooltips: {
            backgroundColor: "rgba(17,40,64,.92)",
            bodyFontFamily: "'IBM Plex Mono'",
            callbacks: {
                label: (item, data) => {
                    const v = data.datasets[0].data[item.index];
                    return ` ${Number(v).toFixed(2)}  ${indiceLabel(v)}`;
                },
            },
        },
    };

    const indiceConfig = [
        { key: "alcance", label: "🎯 Índice de Alcance", desc: "Entregables completados vs pendientes vencidos" },
        { key: "hitos", label: "🏁 Índice de Hitos", desc: "Hitos cumplidos a tiempo" },
        { key: "calidad", label: "✅ Índice de Calidad", desc: "Métricas de calidad completadas" },
        { key: "kanban", label: "📊 Índice Kanban", desc: "Tareas Done vs vencidas (Ágil/Híbrido)" },
        { key: "todo", label: "📋 Índice To-Do", desc: "Tareas cerradas vs abiertas vencidas" },
        { key: "gantt", label: "📅 Índice Gantt", desc: "Progreso tareas Gantt (Pred./Híbrido)" },
    ];

    if (!activos.length) return (
        <div style={{ color: "#9badbf", fontSize: 13, padding: "12px 0" }}>
            No hay proyectos en ejecución o cerrados.
        </div>
    );

    return (
        <div className="db-flex-col">
            <div style={{ fontSize: 11, color: "#9badbf" }}>
                Basado en {activos.length} proyecto{activos.length !== 1 ? "s" : ""} · Escala 0–2 (1.0 = óptimo)
            </div>

            <div className="db-row">
                <Card style={{ flex: 1, minWidth: 260 }}>
                    <SectionTitle>📡 Radar de Desempeño</SectionTitle>
                    <div style={{ height: 280 }}>
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                        {[
                            { label: "Excelente ≥1.0", color: "#28a745" },
                            { label: "Regular ≥0.6", color: "#ffc107" },
                            { label: "Crítico <0.6", color: "#dc3545" },
                        ].map((l) => (
                            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}>
                                <div style={{ width: 9, height: 9, borderRadius: "50%", background: l.color }} />
                                <span style={{ color: "#6b7f94" }}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <div style={{ flex: 1, minWidth: 260, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {indiceConfig.map(({ key, label, desc }) => (
                        <IndiceCard key={key} label={label} value={indices[key]} desc={desc} />
                    ))}
                </div>
            </div>

            <div style={{ fontSize: 11, color: "#9badbf", textAlign: "center" }}>
                Kanban y Gantt muestran — cuando el tipo de proyecto no aplica · To-Do aplica a todos
            </div>
        </div>
    );
}

// ─── SECCIÓN 3: Encuestas e Informes ─────────────────────────────────────────

function SeccionEncuestasInformes({ projects, listaEncuestas, listaInformes }) {
    const [subView, setSubView] = useState("encuestas");

    // ── Encuestas ──────────────────────────────────────────────────────────────
    const elegibles = useMemo(() => projects.filter((p) => PLANIF_EJEC_CERRADO.includes(p.estado)), [projects]);

    /**
     * Normalizar listaEncuestas:
     *   El reducer GET_SURVEYS_DASHBOARD_SUCCESS guarda action.payload en listaEncuestas.
     *   El payload puede ser un array directo o { encuestas: [...] }
     */
    const encuestasArray = useMemo(() => toArray(listaEncuestas, "encuestas", "data"), [listaEncuestas]);

    const encuestasPorProyecto = useMemo(() => {
        const map = {};
        encuestasArray.forEach((e) => {
            const pid = Number(getPid(e));
            if (!isNaN(pid)) {
                if (!map[pid]) map[pid] = [];
                map[pid].push(e);
            }
        });
        return map;
    }, [encuestasArray]);

    const totalEncuestas = encuestasArray.length;
    const proyectosConEnc = elegibles.filter((p) => (encuestasPorProyecto[p.id] || []).length > 0).length;
    const promedioGeneral = totalEncuestas
        ? avg(encuestasArray.map((e) => parseFloat(e.satisfaccion_general) || 0)).toFixed(1)
        : null;

    const promediosPorCampo = useMemo(() => {
        if (!totalEncuestas) return {};
        return Object.fromEntries(
            SURVEY_FIELDS.map((f) => [
                f,
                avg(encuestasArray.map((e) => parseFloat(e[f]) || 0)).toFixed(2),
            ])
        );
    }, [encuestasArray, totalEncuestas]);

    const barEncData = {
        labels: SURVEY_FIELDS.map((f) => SURVEY_LABELS[f]),
        datasets: [{
            label: "Promedio",
            data: SURVEY_FIELDS.map((f) => parseFloat(promediosPorCampo[f]) || 0),
            backgroundColor: SURVEY_FIELDS.map((_, i) => `rgba(26,${60 + i * 10},${94 + i * 12},.75)`),
            borderColor: "#1a3c5e", borderWidth: 1,
        }],
    };
    const barEncOpts = {
        maintainAspectRatio: false, legend: { display: false },
        scales: {
            xAxes: [{ ticks: { fontSize: 9, fontColor: "#9badbf" }, gridLines: { display: false } }],
            yAxes: [{ ticks: { beginAtZero: true, max: 5, fontSize: 10, fontColor: "#9badbf", fontFamily: "'IBM Plex Mono'" }, gridLines: { color: "rgba(26,60,94,.06)" } }],
        },
        tooltips: { backgroundColor: "rgba(17,40,64,.92)", callbacks: { label: (i) => ` ${i.yLabel} / 5` } },
    };

    // ── Informes ───────────────────────────────────────────────────────────────
    /**
     * Normalizar listaInformes:
     *   El reducer GET_INFORMES_DASHBOARD_SUCCESS guarda action.payload en listaInformes.
     *   El payload puede ser un array directo o { informes: [...] }
     */
    const informesArray = useMemo(() => toArray(listaInformes, "informes", "data"), [listaInformes]);

    const informesPorProyecto = useMemo(() => {
        const map = {};
        informesArray.forEach((inf) => {
            const pid = Number(getPid(inf));
            if (!isNaN(pid)) {
                if (!map[pid]) map[pid] = [];
                map[pid].push(inf);
            }
        });
        return map;
    }, [informesArray]);

    const datosInforme = useMemo(() =>
        projects.map((p) => {
            const infs = informesPorProyecto[p.id] || [];
            const ultimo = infs.length
                ? infs.reduce((acc, i) => !acc || new Date(i.fecha_informe) > new Date(acc.fecha_informe) ? i : acc, null)
                : null;
            return {
                id: p.id, nombre: p.nombre, estado: p.estado,
                director: p.DirectorProyecto?.Persona
                    ? `${p.DirectorProyecto.Persona.nombre} ${p.DirectorProyecto.Persona.apellido || ""}`.trim()
                    : "—",
                total: infs.length, ultimo,
            };
        }).sort((a, b) => b.total - a.total),
        [projects, informesPorProyecto]);

    const totalInformes = datosInforme.reduce((s, p) => s + p.total, 0);
    const proyectosConInforme = datosInforme.filter((p) => p.total > 0).length;
    const top10 = datosInforme.slice(0, 10);

    const barInfData = {
        labels: top10.map((p) => p.nombre.length > 16 ? p.nombre.substring(0, 14) + "…" : p.nombre),
        datasets: [{
            label: "Informes", data: top10.map((p) => p.total),
            backgroundColor: "rgba(26,60,94,.72)", borderColor: "#1a3c5e", borderWidth: 1,
        }],
    };
    const barInfOpts = {
        maintainAspectRatio: false, legend: { display: false },
        scales: {
            xAxes: [{ ticks: { fontSize: 9, fontColor: "#9badbf" }, gridLines: { display: false } }],
            yAxes: [{ ticks: { beginAtZero: true, precision: 0, fontSize: 10, fontColor: "#9badbf", fontFamily: "'IBM Plex Mono'" }, gridLines: { color: "rgba(26,60,94,.06)" } }],
        },
        tooltips: { backgroundColor: "rgba(17,40,64,.92)", callbacks: { label: (i) => ` ${i.yLabel} informe${i.yLabel !== 1 ? "s" : ""}` } },
    };

    const subBtn = (key, icon, label) => (
        <button
            onClick={() => setSubView(key)}
            style={{
                background: subView === key ? "var(--navy-pale)" : "transparent",
                border: `1px solid ${subView === key ? "var(--navy)" : "var(--border)"}`,
                color: subView === key ? "var(--navy)" : "var(--text-muted)",
                borderRadius: "var(--radius-sm)", padding: "5px 14px", cursor: "pointer",
                fontFamily: "var(--font)", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 5,
            }}
        >{icon} {label}</button>
    );

    return (
        <div className="db-flex-col">
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                {subBtn("encuestas", "⭐", "Encuestas de Satisfacción")}
                {subBtn("informes", "📄", "Informes de Avance")}
            </div>

            {/* ── ENCUESTAS ── */}
            {subView === "encuestas" && (
                <>
                    <div className="db-kpi-strip-row">
                        <MiniKpi label="Total Encuestas" value={totalEncuestas} color="#1a3c5e" sub="en toda la cartera" />
                        <MiniKpi label="Proyectos c/Encuesta" value={proyectosConEnc} color="#007bff" sub={`de ${elegibles.length} elegibles`} />
                        <MiniKpi
                            label="Satisfacción General"
                            value={promedioGeneral != null ? `${promedioGeneral} / 5` : null}
                            color={satisfColor(promedioGeneral)}
                            sub="promedio ponderado"
                        />
                    </div>

                    {totalEncuestas === 0 ? (
                        <div style={{ color: "#9badbf", fontSize: 13, padding: "16px 0" }}>
                            No hay encuestas registradas. Verifica que los proyectos tengan encuestas y que el endpoint retorne datos.
                        </div>
                    ) : (
                        <>
                            <Card>
                                <SectionTitle>⭐ Satisfacción General de la Cartera</SectionTitle>
                                <StarRating value={promedioGeneral} />
                                <div style={{ marginTop: 16 }}>
                                    <SectionTitle>📊 Promedio por Dimensión</SectionTitle>
                                    <div style={{ height: 175 }}>
                                        <Bar data={barEncData} options={barEncOpts} />
                                    </div>
                                </div>
                            </Card>
                            <Card>
                                <SectionTitle>📋 Detalle por Proyecto</SectionTitle>
                                <div className="db-table-wrap">
                                    <table className="db-table">
                                        <thead>
                                            <tr>{["Proyecto", "Encuestas", "Satisf. Gral.", "Comunicación", "Plazos", "Calidad"].map(h => <th key={h}>{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {elegibles.map((p) => {
                                                const encs = encuestasPorProyecto[p.id] || [];
                                                if (!encs.length) return (
                                                    <tr key={p.id}>
                                                        <td className="truncate">{p.nombre}</td>
                                                        <td style={{ color: "#9badbf" }}>0</td>
                                                        <td colSpan={4} style={{ color: "#9badbf", fontStyle: "italic" }}>Sin encuestas</td>
                                                    </tr>
                                                );
                                                const prom = (f) => avg(encs.map((e) => parseFloat(e[f]) || 0)).toFixed(1);
                                                const sg = prom("satisfaccion_general");
                                                return (
                                                    <tr key={p.id}>
                                                        <td className="truncate">{p.nombre}</td>
                                                        <td style={{ fontFamily: "var(--font-mono)" }}>{encs.length}</td>
                                                        <td><span className="db-status-pill" style={{ background: satisfColor(sg) }}>{sg} / 5</span></td>
                                                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{prom("comunicacion")}</td>
                                                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{prom("cumplimiento_plazos")}</td>
                                                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{prom("calidad_entregado")}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </>
                    )}
                </>
            )}

            {/* ── INFORMES ── */}
            {subView === "informes" && (
                <>
                    <div className="db-kpi-strip-row">
                        <MiniKpi label="Total Informes" value={totalInformes} color="#1a3c5e" sub="en toda la cartera" />
                        <MiniKpi label="Proyectos c/Informes" value={proyectosConInforme} color="#007bff" sub={`de ${projects.length} totales`} />
                        <MiniKpi label="Prom. por Proyecto" value={projects.length ? (totalInformes / projects.length).toFixed(1) : "—"} color="#17a2b8" />
                    </div>

                    {totalInformes > 0 && (
                        <Card>
                            <SectionTitle>📈 Informes por Proyecto (top 10)</SectionTitle>
                            <div style={{ height: 175 }}>
                                <Bar data={barInfData} options={barInfOpts} />
                            </div>
                        </Card>
                    )}

                    <Card>
                        <SectionTitle>📋 Detalle por Proyecto</SectionTitle>
                        <div className="db-table-wrap">
                            <table className="db-table">
                                <thead>
                                    <tr>{["Proyecto", "Director", "Estado", "# Informes", "Último informe"].map(h => <th key={h}>{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {datosInforme.map((p) => (
                                        <tr key={p.id}>
                                            <td className="truncate">{p.nombre}</td>
                                            <td style={{ whiteSpace: "nowrap" }}>{p.director}</td>
                                            <td><span className="db-status-pill" style={{ background: ESTADO_COLOR[p.estado] || "#6c757d" }}>{ESTADO_LABEL[p.estado] || p.estado}</span></td>
                                            <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: p.total > 0 ? "#1a3c5e" : "#9badbf" }}>{p.total}</td>
                                            <td style={{ fontSize: 11, color: "#6b7f94" }}>
                                                {p.ultimo
                                                    ? new Date(p.ultimo.fecha_informe).toLocaleDateString("es-ES")
                                                    : <span style={{ color: "#9badbf", fontStyle: "italic" }}>Sin informes</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const SUBSECCIONES = [
    { key: "ejecucion", icon: "📈", label: "Resumen de Ejecución" },
    { key: "desempeno", icon: "📡", label: "Resumen de Desempeño" },
    { key: "reportes", icon: "📋", label: "Encuestas e Informes" },
];

function TabDetalle({
    projects, modo,
    // Store
    usuario, ganttTasks, kanbanStatus, kanbanTasks,
    todoTareas, listaEncuestas, listaInformes,
    isLoadingGantt, isLoadingKanban,
    dispatch,
}) {
    const [activeSub, setActiveSub] = useState("ejecucion");
    const [dataLoaded, setDataLoaded] = useState(false);

    /**
     * Despacha los 5 actions UNA SOLA VEZ al montar.
     * Se resetea si cambia el modo para recargar con el nuevo filtro.
     */
    useEffect(() => {
        if (modo === "A" || !usuario?.id || dataLoaded) return;
        const uid = usuario.id;
        dispatch(projectActions.getTasksDashboard(uid, modo, null));
        dispatch(ganttActions.fetchGanttDashboard(uid, modo));
        dispatch(kanbanActions.fetchKanbanDashboard(uid, modo));
        dispatch(surveyActions.getSurveysDashboard(uid, modo));
        dispatch(informeActions.getInformesDashboard(uid, modo));
        setDataLoaded(true);
    }, [modo, usuario, dataLoaded, dispatch]);

    useEffect(() => {
        setDataLoaded(false);
    }, [modo]);

    const isLoading = isLoadingGantt || isLoadingKanban;

    if (modo === "A") return (
        <div className="db-wip">
            <div className="db-wip-icon">🔒</div>
            <h5>No disponible para Proyectos Personales</h5>
            <p>El Análisis Detallado está disponible únicamente para Proyectos Equipo y Programas.</p>
        </div>
    );

    if (!projects.length) return (
        <div className="db-empty">
            <div className="db-empty-icon">📂</div>
            <p>No hay proyectos con los filtros actuales.</p>
        </div>
    );

    return (
        <div className="db-flex-col">
            {/* Sub-navegación */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 4 }}>
                {SUBSECCIONES.map(({ key, icon, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveSub(key)}
                        style={{
                            background: activeSub === key ? "var(--navy)" : "var(--surface)",
                            color: activeSub === key ? "#fff" : "var(--text-muted)",
                            border: `1px solid ${activeSub === key ? "var(--navy)" : "var(--border)"}`,
                            borderRadius: "var(--radius-sm)", padding: "6px 14px", cursor: "pointer",
                            fontFamily: "var(--font)", fontSize: 12, fontWeight: 600,
                            transition: "all var(--transition)", display: "flex", alignItems: "center", gap: 6,
                        }}
                    >
                        {icon} {label}
                    </button>
                ))}
                {isLoading && (
                    <span style={{ fontSize: 11, color: "#9badbf", alignSelf: "center", marginLeft: 8 }}>
                        ⏳ Cargando datos…
                    </span>
                )}
            </div>

            {/* Panel de debug — solo en desarrollo, ver consola del navegador */}
            <DebugPanel
                ganttTasks={ganttTasks}
                kanbanStatus={kanbanStatus}
                kanbanTasks={kanbanTasks}
                todoTareas={todoTareas}
                listaEncuestas={listaEncuestas}
                listaInformes={listaInformes}
            />

            {activeSub === "ejecucion" && (
                <SeccionEjecucion projects={projects} ganttTasks={ganttTasks} />
            )}
            {activeSub === "desempeno" && (
                <SeccionDesempeno
                    projects={projects}
                    ganttTasks={ganttTasks}
                    kanbanStatus={kanbanStatus}
                    kanbanTasks={kanbanTasks}
                    todoTareas={todoTareas}
                />
            )}
            {activeSub === "reportes" && (
                <SeccionEncuestasInformes
                    projects={projects}
                    listaEncuestas={listaEncuestas}
                    listaInformes={listaInformes}
                />
            )}
        </div>
    );
}

// ─── Redux connect ────────────────────────────────────────────────────────────
// Basado en la estructura EXACTA de los reducers recibidos:
//   gantt.tasks             → array plano (ganttReducer defaultState: { tasks: [] })
//   kanban.status / .tasks  → { byId, allIds } (kanbanReducer defaultState)
//   project.todo            → array (projectReducer defaultState: todo: [])
//   encuesta.listaEncuestas → array (encuestaReducer defaultState: listaEncuestas: [])
//   informeAvance.listaInformes → array (informeAvanceReducer defaultState: listaInformes: [])

const mapStateToProps = (state) => ({
    // session.userSystem — igual que ProyectoDetail con sessionSelectors.getUser(state)
    usuario: sessionSelectors.getUser(state),

    ganttTasks: ganttSelectors.getTasks(state),           // gantt.tasks
    isLoadingGantt: state.gantt?.isLoading ?? false,

    kanbanStatus: state.kanban?.status ?? { byId: {}, allIds: [] },
    kanbanTasks: state.kanban?.tasks ?? { byId: {}, allIds: [] },
    isLoadingKanban: state.kanban?.isLoading ?? false,

    todoTareas: projectSelectors.getToDo(state),           // project.todo
    listaEncuestas: surveySelectors.getListaEncuestas(state), // encuesta.listaEncuestas
    listaInformes: informeSelectors.getListaInformes(state), // informeAvance.listaInformes
});

export default connect(mapStateToProps)(TabDetalle);