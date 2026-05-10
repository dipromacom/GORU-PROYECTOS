/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";
import { FaCommentDots, FaArrowLeft, FaPaperPlane, FaTimes, FaPlus, FaRedo } from "react-icons/fa";

import "./ChatWidget.css";
import { selectors as sessionSelectors } from "../../reducers/session";
import * as api from "../../api";

// =====================================================================
// Constantes de polling adaptativo
// Diseñado para EC2 free tier: poco tráfico, baja latencia percibida.
// =====================================================================
const POLL_BADGE_VISIBLE_MS = 30 * 1000;        // chat cerrado, pestaña visible
const POLL_BADGE_HIDDEN_MS = 90 * 1000;         // chat cerrado, pestaña oculta
const POLL_LIST_OPEN_MS = 15 * 1000;            // panel abierto en lista
const POLL_CONV_ACTIVE_MS = 5 * 1000;           // conversación abierta con actividad reciente
const POLL_CONV_IDLE_MS = 15 * 1000;            // conversación abierta sin actividad
const POLL_CONV_LONG_IDLE_MS = 45 * 1000;       // conversación abierta con mucho tiempo sin actividad
const ACTIVITY_RECIENTE_MS = 60 * 1000;         // mensaje reciente = < 1 min
const ACTIVIDAD_LARGA_INACTIV_MS = 5 * 60 * 1000; // > 5 min = backoff largo

// =====================================================================
// Helpers de presentación
// =====================================================================
const initialsFromName = (nombre, username) => {
    const base = (nombre && nombre.trim()) || username || "?";
    const parts = base.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return base.substring(0, 2).toUpperCase();
};

const formatTime = (iso) => {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        const now = new Date();
        const sameDay =
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        if (sameDay) return `${hh}:${mm}`;
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${hh}:${mm}`;
    } catch (e) {
        return "";
    }
};

const useDocumentVisibility = () => {
    const [visible, setVisible] = useState(
        typeof document !== "undefined" ? document.visibilityState !== "hidden" : true
    );
    useEffect(() => {
        const handler = () => setVisible(document.visibilityState !== "hidden");
        document.addEventListener("visibilitychange", handler);
        return () => document.removeEventListener("visibilitychange", handler);
    }, []);
    return visible;
};

// =====================================================================
// Componente principal
// =====================================================================
function ChatWidget({ user, isAuthenticated }) {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState("list"); // "list" | "nuevo" | "conv"
    const [conversaciones, setConversaciones] = useState([]);
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeConv, setActiveConv] = useState(null); // { conversacion_id, otro }
    const [mensajes, setMensajes] = useState([]);
    const [loadingMensajes, setLoadingMensajes] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [borrador, setBorrador] = useState("");
    const [noLeidosTotal, setNoLeidosTotal] = useState(0);
    const [errorMsg, setErrorMsg] = useState(null);

    const visible = useDocumentVisibility();

    const messagesEndRef = useRef(null);
    const lastMsgTimeRef = useRef(null); // timestamp del último mensaje recibido
    const activeConvRef = useRef(null);

    useEffect(() => {
        activeConvRef.current = activeConv;
    }, [activeConv]);

    // ---------------------------------------------------------------
    // Visibilidad del widget: solo si hay sesión válida
    // ---------------------------------------------------------------
    const shouldShowWidget = !!isAuthenticated && !!user && !!user.id;

    // ---------------------------------------------------------------
    // Polling 1: badge global de no-leídos (siempre que haya sesión)
    // ---------------------------------------------------------------
    const fetchNoLeidos = useCallback(async () => {
        if (!shouldShowWidget) return;
        try {
            const r = await api.getChatNoLeidos();
            const total = (r && r.data && r.data.data && r.data.data.total) || 0;
            setNoLeidosTotal(total);
        } catch (e) {
            // Silencioso. No queremos ensuciar la UI por un blip de red.
        }
    }, [shouldShowWidget]);

    useEffect(() => {
        if (!shouldShowWidget) return undefined;
        fetchNoLeidos();
        const interval = visible ? POLL_BADGE_VISIBLE_MS : POLL_BADGE_HIDDEN_MS;
        const t = setInterval(fetchNoLeidos, interval);
        return () => clearInterval(t);
    }, [shouldShowWidget, fetchNoLeidos, visible]);

    // ---------------------------------------------------------------
    // Polling 2: lista de conversaciones (mientras panel abierto)
    // ---------------------------------------------------------------
    const fetchConversaciones = useCallback(async () => {
        if (!shouldShowWidget) return;
        try {
            const r = await api.getChatConversaciones();
            const data = (r && r.data && r.data.data) || [];
            setConversaciones(data);
            const total = data.reduce((acc, c) => acc + (c.no_leidos || 0), 0);
            setNoLeidosTotal(total);
        } catch (e) {
            // silencioso
        }
    }, [shouldShowWidget]);

    useEffect(() => {
        if (!shouldShowWidget || !open || view !== "list" || !visible) {
            return undefined;
        }
        fetchConversaciones();
        const t = setInterval(fetchConversaciones, POLL_LIST_OPEN_MS);
        return () => clearInterval(t);
    }, [shouldShowWidget, open, view, visible, fetchConversaciones]);

    // ---------------------------------------------------------------
    // Polling 3: mensajes de la conversación activa con backoff adaptativo
    // ---------------------------------------------------------------
    const fetchNuevosMensajes = useCallback(async () => {
        const cur = activeConvRef.current;
        if (!cur || !cur.conversacion_id) return;
        try {
            const desdeId = mensajes.length ? mensajes[mensajes.length - 1].id : 0;
            const r = await api.getChatMensajes(cur.conversacion_id, { desdeId });
            const nuevos = (r && r.data && r.data.data) || [];
            if (nuevos.length > 0) {
                setMensajes((prev) => {
                    // dedup por id
                    const ids = new Set(prev.map((m) => m.id));
                    const merged = prev.concat(nuevos.filter((m) => !ids.has(m.id)));
                    return merged;
                });
                lastMsgTimeRef.current = Date.now();
                // Marcar como leído al último id que ya tenemos en pantalla.
                const lastId = nuevos[nuevos.length - 1].id;
                try {
                    await api.postChatMarcarLeido(cur.conversacion_id, lastId);
                } catch (e) {
                    /* silencioso */
                }
                fetchNoLeidos();
            }
        } catch (e) {
            // silencioso
        }
    }, [mensajes, fetchNoLeidos]);

    useEffect(() => {
        if (!shouldShowWidget || !open || view !== "conv" || !visible || !activeConv) {
            return undefined;
        }

        const computeInterval = () => {
            const lastTs = lastMsgTimeRef.current || 0;
            const elapsed = Date.now() - lastTs;
            if (elapsed < ACTIVITY_RECIENTE_MS) return POLL_CONV_ACTIVE_MS;
            if (elapsed < ACTIVIDAD_LARGA_INACTIV_MS) return POLL_CONV_IDLE_MS;
            return POLL_CONV_LONG_IDLE_MS;
        };

        let cancelled = false;
        let timerId = null;

        const tick = async () => {
            if (cancelled) return;
            await fetchNuevosMensajes();
            if (cancelled) return;
            timerId = setTimeout(tick, computeInterval());
        };

        timerId = setTimeout(tick, computeInterval());
        return () => {
            cancelled = true;
            if (timerId) clearTimeout(timerId);
        };
    }, [shouldShowWidget, open, view, visible, activeConv, fetchNuevosMensajes]);

    // ---------------------------------------------------------------
    // Auto-scroll al final cuando llegan mensajes nuevos
    // ---------------------------------------------------------------
    useEffect(() => {
        if (view === "conv" && messagesEndRef.current) {
            try {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
            } catch (e) {
                messagesEndRef.current.scrollIntoView();
            }
        }
    }, [mensajes, view]);

    // ---------------------------------------------------------------
    // Acciones
    // ---------------------------------------------------------------
    const togglePanel = () => {
        const next = !open;
        setOpen(next);
        if (next) {
            setView("list");
            fetchConversaciones();
        }
    };

    const cerrarPanel = () => {
        setOpen(false);
        setActiveConv(null);
        setMensajes([]);
        setView("list");
    };

    const abrirNuevo = async () => {
        setView("nuevo");
        setSearchQuery("");
        setLoadingUsuarios(true);
        setUsuariosDisponibles([]);
        try {
            const r = await api.getChatUsuariosDisponibles("");
            const data = (r && r.data && r.data.data) || [];
            setUsuariosDisponibles(data);
        } catch (e) {
            setErrorMsg("No se pudieron cargar los usuarios.");
        } finally {
            setLoadingUsuarios(false);
        }
    };

    // Búsqueda con debounce
    useEffect(() => {
        if (view !== "nuevo") return undefined;
        const handle = setTimeout(async () => {
            setLoadingUsuarios(true);
            try {
                const r = await api.getChatUsuariosDisponibles(searchQuery);
                const data = (r && r.data && r.data.data) || [];
                setUsuariosDisponibles(data);
            } catch (e) {
                /* silencioso */
            } finally {
                setLoadingUsuarios(false);
            }
        }, 300);
        return () => clearTimeout(handle);
    }, [searchQuery, view]);

    const abrirConversacionConUsuario = async (otro) => {
        setErrorMsg(null);
        try {
            const r = await api.postChatAbrirConversacion(otro.id);
            const conversacion_id = r && r.data && r.data.data && r.data.data.conversacion_id;
            if (!conversacion_id) {
                setErrorMsg("No se pudo abrir la conversación.");
                return;
            }
            const nueva = { conversacion_id, otro };
            setActiveConv(nueva);
            activeConvRef.current = nueva;
            setMensajes([]);
            setView("conv");
            // Carga inicial completa (sin desdeId)
            setLoadingMensajes(true);
            try {
                const r2 = await api.getChatMensajes(conversacion_id, { limite: 50 });
                const data = (r2 && r2.data && r2.data.data) || [];
                setMensajes(data);
                lastMsgTimeRef.current = Date.now();
                if (data.length > 0) {
                    try {
                        await api.postChatMarcarLeido(conversacion_id, data[data.length - 1].id);
                    } catch (e) {
                        /* silencioso */
                    }
                }
                fetchNoLeidos();
            } finally {
                setLoadingMensajes(false);
            }
        } catch (e) {
            setErrorMsg("No tienes permiso para chatear con este usuario.");
        }
    };

    const abrirConversacionExistente = (conv) => {
        abrirConversacionConUsuario(conv.otro);
    };

    const volverAListado = () => {
        setView("list");
        setActiveConv(null);
        setMensajes([]);
        fetchConversaciones();
    };

    const enviarMensaje = async () => {
        const texto = (borrador || "").trim();
        if (!texto || !activeConv) return;
        if (texto.length > 2000) {
            setErrorMsg("El mensaje no puede superar 2000 caracteres.");
            return;
        }
        setEnviando(true);
        setErrorMsg(null);
        try {
            const r = await api.postChatEnviarMensaje(activeConv.conversacion_id, texto);
            const nuevo = r && r.data && r.data.data;
            if (nuevo) {
                setMensajes((prev) => prev.concat([nuevo]));
                lastMsgTimeRef.current = Date.now();
            }
            setBorrador("");
        } catch (e) {
            const msg =
                (e && e.response && e.response.data && e.response.data.message) ||
                "No se pudo enviar el mensaje.";
            setErrorMsg(msg);
        } finally {
            setEnviando(false);
        }
    };

    const onKeyDownTextArea = (ev) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            enviarMensaje();
        }
    };

    // ---------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------
    const headerTitle = useMemo(() => {
        if (view === "conv" && activeConv) return activeConv.otro.nombre || activeConv.otro.username;
        if (view === "nuevo") return "Nuevo chat";
        return "Mensajes";
    }, [view, activeConv]);

    if (!shouldShowWidget) return null;

    return (
        <>
            {!open && (
                <button
                    type="button"
                    className="chat-widget-fab"
                    onClick={togglePanel}
                    aria-label="Abrir chat"
                    title="Mensajes"
                >
                    <FaCommentDots />
                    {noLeidosTotal > 0 && (
                        <span className="chat-widget-fab-badge">{noLeidosTotal > 99 ? "99+" : noLeidosTotal}</span>
                    )}
                </button>
            )}

            {open && (
                <div className="chat-widget-panel" role="dialog" aria-label="Mensajes">
                    <div className="chat-widget-header">
                        <div className="chat-widget-header-title">
                            {view === "conv" || view === "nuevo" ? (
                                <button
                                    type="button"
                                    className="chat-widget-back"
                                    onClick={view === "conv" ? volverAListado : volverAListado}
                                    aria-label="Volver"
                                    title="Volver"
                                >
                                    <FaArrowLeft />
                                </button>
                            ) : null}
                            <span className="chat-widget-title-text">{headerTitle}</span>
                        </div>
                        <div className="chat-widget-header-actions">
                            {view === "list" && (
                                <button
                                    type="button"
                                    className="chat-widget-icon-btn"
                                    onClick={fetchConversaciones}
                                    title="Actualizar"
                                    aria-label="Actualizar"
                                >
                                    <FaRedo />
                                </button>
                            )}
                            {view === "list" && (
                                <button
                                    type="button"
                                    className="chat-widget-icon-btn"
                                    onClick={abrirNuevo}
                                    title="Nuevo chat"
                                    aria-label="Nuevo chat"
                                >
                                    <FaPlus />
                                </button>
                            )}
                            <button
                                type="button"
                                className="chat-widget-icon-btn"
                                onClick={cerrarPanel}
                                title="Cerrar"
                                aria-label="Cerrar"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {errorMsg && (
                        <div style={{ padding: "6px 10px", background: "#fef2f2", color: "#991b1b", fontSize: 12 }}>
                            {errorMsg}
                        </div>
                    )}

                    {view === "list" && (
                        <div className="chat-widget-list">
                            {conversaciones.length === 0 ? (
                                <div className="chat-widget-empty">
                                    Aún no tienes conversaciones. Pulsa <FaPlus style={{ verticalAlign: "middle" }} /> para iniciar una.
                                </div>
                            ) : (
                                conversaciones.map((c) => (
                                    <div
                                        key={c.conversacion_id}
                                        className={`chat-widget-row${c.no_leidos > 0 ? " unread" : ""}`}
                                        onClick={() => abrirConversacionExistente(c)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="chat-widget-avatar">
                                            {initialsFromName(c.otro.nombre, c.otro.username)}
                                        </div>
                                        <div className="chat-widget-row-main">
                                            <div className="chat-widget-row-name">
                                                <span>{c.otro.nombre || c.otro.username}</span>
                                                <span className="chat-widget-row-time">
                                                    {c.ultimo_mensaje && formatTime(c.ultimo_mensaje.fecha)}
                                                </span>
                                            </div>
                                            <div className="chat-widget-row-preview">
                                                <span className="preview-text">
                                                    {c.ultimo_mensaje
                                                        ? `${c.ultimo_mensaje.es_propio ? "Tú: " : ""}${c.ultimo_mensaje.texto}`
                                                        : "Inicia la conversación"}
                                                </span>
                                                {c.no_leidos > 0 && (
                                                    <span className="chat-widget-row-badge">{c.no_leidos > 99 ? "99+" : c.no_leidos}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {view === "nuevo" && (
                        <>
                            <div className="chat-widget-search">
                                <input
                                    type="text"
                                    placeholder="Buscar usuario..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="chat-widget-list">
                                {loadingUsuarios ? (
                                    <div className="chat-widget-loading">Cargando usuarios...</div>
                                ) : usuariosDisponibles.length === 0 ? (
                                    <div className="chat-widget-empty">
                                        {searchQuery
                                            ? "Sin coincidencias."
                                            : user && user.es_super_admin
                                                ? "No hay usuarios disponibles."
                                                : "No hay otros usuarios en tu empresa."}
                                    </div>
                                ) : (
                                    usuariosDisponibles.map((u) => (
                                        <div
                                            key={u.id}
                                            className="chat-widget-row"
                                            onClick={() => abrirConversacionConUsuario(u)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="chat-widget-avatar">{initialsFromName(u.nombre, u.username)}</div>
                                            <div className="chat-widget-row-main">
                                                <div className="chat-widget-row-name">
                                                    <span>{u.nombre || u.username}</span>
                                                </div>
                                                <div className="chat-widget-row-preview">
                                                    <span className="preview-text">
                                                        {u.empresa_nombre || "Sin empresa"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {view === "conv" && activeConv && (
                        <div className="chat-widget-conv">
                            <div className="chat-widget-messages">
                                {loadingMensajes && mensajes.length === 0 ? (
                                    <div className="chat-widget-loading">Cargando mensajes...</div>
                                ) : mensajes.length === 0 ? (
                                    <div className="chat-widget-empty">Aún no hay mensajes. ¡Saluda!</div>
                                ) : (
                                    mensajes.map((m) => {
                                        const mine = Number(m.usuario_id) === Number(user.id);
                                        return (
                                            <div key={m.id} className={`chat-widget-msg ${mine ? "mine" : "other"}`}>
                                                {m.texto}
                                                <span className="chat-widget-msg-time">{formatTime(m.fecha)}</span>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="chat-widget-input">
                                <textarea
                                    rows={1}
                                    placeholder="Escribe un mensaje..."
                                    value={borrador}
                                    onChange={(e) => setBorrador(e.target.value.slice(0, 2000))}
                                    onKeyDown={onKeyDownTextArea}
                                    disabled={enviando}
                                />
                                <button
                                    type="button"
                                    onClick={enviarMensaje}
                                    disabled={enviando || !borrador.trim()}
                                    aria-label="Enviar mensaje"
                                    title="Enviar"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

const mapStateToProps = (state) => ({
    user: sessionSelectors.getUser(state),
    isAuthenticated: sessionSelectors.getIsAuthenticated(state),
});

export default connect(mapStateToProps)(ChatWidget);
