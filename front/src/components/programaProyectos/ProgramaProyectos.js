/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { connect } from "react-redux";
import { Button, Modal, Badge, Form, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { actions as programaActions, selectors as programaSelectors } from "../../reducers/programa";
import "./ProgramaProyectos.css";

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADO_META = {
    C: { label: "Creado", color: "#6c757d", bg: "#f8f9fa", icon: "bi-circle" },
    S: { label: "Iniciado", color: "#b8860b", bg: "#fffbea", icon: "bi-play-circle" },
    P: { label: "Planificado", color: "#0062cc", bg: "#e8f0fe", icon: "bi-clipboard-check" },
    X: { label: "Ejecutado", color: "#155724", bg: "#e8f5e9", icon: "bi-lightning-charge" },
    E: { label: "Cerrado", color: "#721c24", bg: "#fdecea", icon: "bi-lock" },
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Pill de estado reutilizable */
function EstadoPill({ estado }) {
    const meta = ESTADO_META[estado] || { label: estado, color: "#6c757d", bg: "#f8f9fa", icon: "bi-question" };
    return (
        <span
            className="pp-estado-pill"
            style={{ color: meta.color, background: meta.bg, borderColor: meta.color }}
        >
            <i className={`bi ${meta.icon} pp-pill-icon`} />
            {meta.label}
        </span>
    );
}

/** Resumen compacto de métricas del programa */
function ResumenPrograma({ proyectos }) {
    const stats = useMemo(() => {
        const total = proyectos.length;
        const porEstado = proyectos.reduce((acc, p) => {
            acc[p.estado] = (acc[p.estado] || 0) + 1;
            return acc;
        }, {});
        const activos = (porEstado.X || 0) + (porEstado.P || 0) + (porEstado.S || 0);
        const cerrados = porEstado.E || 0;
        const pendAsig = proyectos.filter(p => !p.DirectorProyecto?.Persona).length;
        const conFecha = proyectos.filter(p => p.fecha_inicio).length;
        return { total, porEstado, activos, cerrados, pendAsig, conFecha };
    }, [proyectos]);

    const kpis = [
        { icon: "bi-collection", label: "Total", value: stats.total, accent: "#1a3c5e" },
        { icon: "bi-lightning-charge", label: "En curso", value: stats.activos, accent: "#28a745" },
        { icon: "bi-lock", label: "Cerrados", value: stats.cerrados, accent: "#6c757d" },
        { icon: "bi-exclamation-triangle", label: "Sin director", value: stats.pendAsig, accent: "#fd7e14" },
    ];

    return (
        <div className="pp-resumen-strip">
            {kpis.map(k => (
                <div key={k.label} className="pp-kpi" style={{ "--kpi-accent": k.accent }}>
                    <i className={`bi ${k.icon} pp-kpi-icon`} />
                    <div className="pp-kpi-body">
                        <span className="pp-kpi-value">{k.value}</span>
                        <span className="pp-kpi-label">{k.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Fila de tabla para un proyecto asignado al programa */
function FilaProyecto({ proyecto, onIr, onEliminar, cerrado }) {
    const history = useHistory();
    const director = proyecto.DirectorProyecto?.Persona
        ? `${proyecto.DirectorProyecto.Persona.nombre} ${proyecto.DirectorProyecto.Persona.apellido || ""}`.trim()
        : "—";
    const empresa = proyecto.Empresa?.nombre || "—";
    const fechaInicio = proyecto.fecha_inicio
        ? moment(proyecto.fecha_inicio).format("DD/MM/YY")
        : "—";

    return (
        <tr className="pp-fila">
            <td className="pp-col-nombre">
                <span className="pp-nombre">{proyecto.nombre}</span>
                {!proyecto.DirectorProyecto?.Persona  && (
                    <span className="pp-badge-warn ms-2" title="Sin director asignado">
                        <i className="bi bi-exclamation-triangle-fill" /> Sin director
                    </span>
                )}
            </td>
            <td className="pp-col-director">{director}</td>
            <td className="pp-col-empresa">{empresa}</td>
            <td className="pp-col-fecha" style={{ fontFamily: "monospace", fontSize: 12 }}>{fechaInicio}</td>
            <td className="pp-col-estado">
                <EstadoPill estado={proyecto.estado} />
            </td>
            <td className="pp-col-acciones">
                <button
                    className="pp-btn-icon pp-btn-go"
                    title="Ir al proyecto"
                    onClick={() => history.push(`/projects/${proyecto.id}`)}
                >
                    <i className="bi bi-box-arrow-up-right" />
                </button>
                {!cerrado && (
                    <button
                        className="pp-btn-icon pp-btn-remove"
                        title="Quitar del programa"
                        onClick={() => onEliminar(proyecto)}
                    >
                        <i className="bi bi-x-circle" />
                    </button>
                )}
            </td>
        </tr>
    );
}

/** Modal de confirmación genérico */
function ConfirmModal({ show, title, body, onConfirm, onCancel, variant = "danger" }) {
    return (
        <Modal show={show} onHide={onCancel} centered size="sm">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title style={{ fontSize: 16, fontWeight: 700 }}>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ fontSize: 14, color: "#444", paddingTop: 6 }}>{body}</Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="outline-secondary" size="sm" onClick={onCancel}>Cancelar</Button>
                <Button variant={variant} size="sm" onClick={onConfirm}>Confirmar</Button>
            </Modal.Footer>
        </Modal>
    );
}

/** Modal para añadir proyectos disponibles */
function AgregarProyectoModal({ show, onHide, disponibles, isLoading, onAgregar }) {
    const [busqueda, setBusqueda] = useState("");
    const [seleccionado, setSeleccionado] = useState(null);
    const [confirmando, setConfirmando] = useState(false);

    const filtrados = useMemo(() => {
        if (!busqueda.trim()) return disponibles;
        const q = busqueda.toLowerCase();
        return disponibles.filter(p =>
            p.nombre.toLowerCase().includes(q) ||
            (p.DirectorProyecto?.Persona?.nombre || "").toLowerCase().includes(q) ||
            (p.Empresa?.nombre || "").toLowerCase().includes(q)
        );
    }, [disponibles, busqueda]);

    const handleSeleccionar = (p) => {
        setSeleccionado(p);
        setConfirmando(true);
    };

    const handleConfirmar = () => {
        if (seleccionado) {
            onAgregar(seleccionado.id);
            setSeleccionado(null);
            setConfirmando(false);
        }
    };

    const handleClose = () => {
        setBusqueda("");
        setSeleccionado(null);
        setConfirmando(false);
        onHide();
    };

    return (
        <>
            <Modal show={show && !confirmando} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton className="pp-modal-header">
                    <Modal.Title>
                        <i className="bi bi-plus-circle me-2" />
                        Agregar proyecto al programa
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pp-modal-body">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre, director o empresa..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="pp-search mb-3"
                        autoFocus
                    />

                    {isLoading ? (
                        <div className="pp-empty-state">
                            <div className="pp-spinner" />
                            <p>Cargando proyectos disponibles…</p>
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="pp-empty-state">
                            <i className="bi bi-inbox pp-empty-icon" />
                            <p>{busqueda ? "Sin resultados para tu búsqueda." : "No hay proyectos disponibles para agregar."}</p>
                            <small className="text-muted">Solo se muestran proyectos de equipo (P) que aún no pertenecen a un programa.</small>
                        </div>
                    ) : (
                        <div className="pp-disponibles-list">
                            {filtrados.map(p => {
                                const director = p.DirectorProyecto?.Persona
                                    ? `${p.DirectorProyecto.Persona.nombre} ${p.DirectorProyecto.Persona.apellido || ""}`.trim()
                                    : "Sin director";
                                return (
                                    <div key={p.id} className="pp-disponible-item" onClick={() => handleSeleccionar(p)}>
                                        <div className="pp-disponible-info">
                                            <span className="pp-disponible-nombre">{p.nombre}</span>
                                            <span className="pp-disponible-meta">
                                                <i className="bi bi-person me-1" />{director}
                                                {p.Empresa?.nombre && <><span className="pp-dot">·</span><i className="bi bi-building me-1" />{p.Empresa.nombre}</>}
                                            </span>
                                        </div>
                                        <div className="pp-disponible-right">
                                            <EstadoPill estado={p.estado} />
                                            <i className="bi bi-plus-circle-fill pp-add-icon" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="outline-secondary" size="sm" onClick={handleClose}>Cerrar</Button>
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                show={confirmando}
                title="¿Agregar proyecto?"
                body={<>¿Estás seguro de agregar <strong>{seleccionado?.nombre}</strong> a este programa?</>}
                onConfirm={handleConfirmar}
                onCancel={() => { setConfirmando(false); setSeleccionado(null); }}
                variant="primary"
            />
        </>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

function ProgramaProyectos({
    dispatch,
    programaId,
    proyectosPrograma,
    proyectosDisponibles,
    isLoading,
    cerrado,
}) {
    const [showAgregar, setShowAgregar] = useState(false);
    const [proyectoAEliminar, setProyectoAEliminar] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [busquedaTabla, setBusquedaTabla] = useState("");

    // Cargar proyectos del programa al montar
    useEffect(() => {
        if (programaId) {
            dispatch(programaActions.getProyectosPrograma(programaId));
        }
    }, [programaId, dispatch]);

    // Cargar disponibles cuando se abre el modal
    const handleAbrirAgregar = () => {
        dispatch(programaActions.getProyectosDisponibles(programaId));
        setShowAgregar(true);
    };

    const handleAgregar = (proyectoId) => {
        dispatch(programaActions.asignarProyecto(programaId, proyectoId));
        setShowAgregar(false);
    };

    const handleConfirmarEliminar = () => {
        if (proyectoAEliminar) {
            dispatch(programaActions.desasignarProyecto(proyectoAEliminar.id, programaId));
            setProyectoAEliminar(null);
        }
    };

    // Filtros locales
    const proyectosFiltrados = useMemo(() => {
        let lista = proyectosPrograma || [];
        if (filtroEstado !== "todos") lista = lista.filter(p => p.estado === filtroEstado);
        if (busquedaTabla.trim()) {
            const q = busquedaTabla.toLowerCase();
            lista = lista.filter(p =>
                p.nombre.toLowerCase().includes(q) ||
                (p.DirectorProyecto?.Persona?.nombre || "").toLowerCase().includes(q)
            );
        }
        return lista;
    }, [proyectosPrograma, filtroEstado, busquedaTabla]);

    const hayProyectos = proyectosPrograma && proyectosPrograma.length > 0;

    return (
        <div className="pp-container">

            {/* ── Cabecera ── */}
            <div className="pp-header">
                <div className="pp-header-left">
                    <h5 className="pp-title">
                        <i className="bi bi-diagram-3 me-2" />
                        Proyectos del Programa
                    </h5>
                    {hayProyectos && (
                        <span className="pp-count-badge">{proyectosPrograma.length}</span>
                    )}
                </div>
                {!cerrado && (
                    <button className="pp-btn-agregar" onClick={handleAbrirAgregar}>
                        <i className="bi bi-plus-lg me-1" />
                        Agregar proyecto
                    </button>
                )}
            </div>

            {/* ── Resumen métricas ── */}
            {hayProyectos && <ResumenPrograma proyectos={proyectosPrograma} />}

            {/* ── Filtros de tabla ── */}
            {hayProyectos && (
                <div className="pp-filtros">
                    <Form.Control
                        type="text"
                        size="sm"
                        placeholder="Buscar por nombre o director…"
                        value={busquedaTabla}
                        onChange={e => setBusquedaTabla(e.target.value)}
                        className="pp-filtro-input"
                    />
                    <Form.Control
                        as="select"
                        size="sm"
                        value={filtroEstado}
                        onChange={e => setFiltroEstado(e.target.value)}
                        className="pp-filtro-select"
                    >
                        <option value="todos">Todos los estados</option>
                        {Object.entries(ESTADO_META).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </Form.Control>
                </div>
            )}

            {/* ── Tabla de proyectos ── */}
            {isLoading ? (
                <div className="pp-loading">
                    <div className="pp-spinner" />
                    <span>Cargando proyectos…</span>
                </div>
            ) : !hayProyectos ? (
                <div className="pp-empty-state pp-empty-main">
                    <i className="bi bi-collection pp-empty-icon" />
                    <p className="pp-empty-title">Este programa no tiene proyectos asignados aún.</p>
                    {!cerrado && (
                        <p className="pp-empty-sub">
                            Hacé clic en <strong>Agregar proyecto</strong> para incluir proyectos de equipo en este programa.
                        </p>
                    )}
                </div>
            ) : proyectosFiltrados.length === 0 ? (
                <div className="pp-empty-state">
                    <i className="bi bi-search pp-empty-icon" />
                    <p>Sin resultados con los filtros aplicados.</p>
                </div>
            ) : (
                <div className="pp-table-wrap">
                    <table className="pp-table">
                        <thead>
                            <tr>
                                <th>Nombre del proyecto</th>
                                <th>Director</th>
                                <th>Empresa</th>
                                <th>Inicio</th>
                                <th>Estado</th>
                                <th style={{ textAlign: "center" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectosFiltrados.map(p => (
                                <FilaProyecto
                                    key={p.id}
                                    proyecto={p}
                                    onEliminar={setProyectoAEliminar}
                                    cerrado={cerrado}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Modal agregar ── */}
            <AgregarProyectoModal
                show={showAgregar}
                onHide={() => setShowAgregar(false)}
                disponibles={proyectosDisponibles || []}
                isLoading={isLoading}
                onAgregar={handleAgregar}
            />

            {/* ── Confirm eliminar ── */}
            <ConfirmModal
                show={!!proyectoAEliminar}
                title="¿Quitar del programa?"
                body={
                    <>¿Estás seguro de quitar <strong>{proyectoAEliminar?.nombre}</strong> de este programa?
                        El proyecto no será eliminado, solo se desvinculará.</>
                }
                onConfirm={handleConfirmarEliminar}
                onCancel={() => setProyectoAEliminar(null)}
                variant="danger"
            />
        </div>
    );
}

const mapStateToProps = state => ({
    proyectosPrograma: programaSelectors.getProyectosPrograma(state),
    proyectosDisponibles: programaSelectors.getProyectosDisponibles(state),
    isLoading: programaSelectors.getIsLoading(state),
});

export default connect(mapStateToProps)(ProgramaProyectos);