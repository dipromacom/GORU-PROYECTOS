import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Tooltip, OverlayTrigger, Modal, Button, Form, Spinner } from 'react-bootstrap';
import { FaArrowRight, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { CheckTable } from '../checkTable/CheckTable';
import moment from 'moment';
import { selectors } from "../../reducers/project";
import { selectors as sessionSelectors } from '../../reducers/session';
import { Interesado } from "../ProyectoDetailMatriz/Interesado";
import { postCorreoInteresadosProyecto, getCorreoDestinatariosProyecto } from '../../api';
import './ViewInteresados.css';

const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(String(e || '').trim());

const M = {
    TODOS: 'todos',
    UNO: 'uno',
    VARIOS: 'varios',
};

const MAX_DEST = 100;

function parseCorreosTexto(s) {
    if (!s || !String(s).trim()) return [];
    return String(s)
        .split(/[\n,;]+/)
        .map((x) => x.trim())
        .filter(Boolean);
}

function mergeEmailsSeleccionYExtra(seleccionados, textoExtra) {
    const map = new Map();
    for (const e of seleccionados || []) {
        const t = String(e || '').trim();
        if (!emailValido(t)) continue;
        map.set(t.toLowerCase(), t);
    }
    for (const e of parseCorreosTexto(textoExtra)) {
        const t = String(e || '').trim();
        if (!emailValido(t)) continue;
        map.set(t.toLowerCase(), t);
    }
    return [...map.values()].slice(0, MAX_DEST);
}

/** Interesados ya cargados en la vista (no depende solo del GET). */
function personasDesdeInteresadosProp(rows) {
    const out = [];
    const seen = new Set();
    for (const row of rows || []) {
        const em = String(row.email || '').trim();
        if (!emailValido(em)) continue;
        const k = em.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({
            email: em,
            nombre: row.nombre_interesado || em.split('@')[0],
            origen: 'interesado',
        });
    }
    return out;
}

/** Combina respuesta del API con interesados del padre (si el GET falla o devuelve vacío). */
function fusionarPersonasCorreo(apiList, desdeProp) {
    const map = new Map();
    for (const p of apiList || []) {
        if (!p?.email || !emailValido(p.email)) continue;
        const em = String(p.email).trim();
        map.set(em.toLowerCase(), {
            email: em,
            nombre: p.nombre || em.split('@')[0],
            origen: p.origen === 'equipo' ? 'equipo' : 'interesado',
        });
    }
    for (const p of desdeProp || []) {
        const k = p.email.toLowerCase();
        if (map.has(k)) continue;
        map.set(k, p);
    }
    return [...map.values()];
}

function etiquetaResumen(modo, emailUno, countVarios) {
    if (modo === M.TODOS) return 'Todo el proyecto (equipo e interesados, un correo por dirección)';
    if (modo === M.UNO) return emailUno ? `Un destinatario: ${emailUno}` : 'Un destinatario';
    if (modo === M.VARIOS) return `Varios destinatarios (${countVarios} correo(s))`;
    return '';
}

export const ViewInteresados = ({
    interesados,
    toDo,
    usuario,
    markAsDoneCallback,
    cerrado,
    esPrograma,
    projectId,
    puedeEnviarCorreoInteresados,
}) => {
    const [filteredData, setFilteredData] = useState([]);
    const [verInteresado, setVerInteresado] = useState(null);
    const [correoModal, setCorreoModal] = useState({
        open: false,
        destinatariosModo: M.TODOS,
    });
    const [asunto, setAsunto] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [sendOk, setSendOk] = useState('');
    const [listaCorreoAviso, setListaCorreoAviso] = useState('');

    const [personasCorreo, setPersonasCorreo] = useState([]);
    const [cargandoPersonas, setCargandoPersonas] = useState(false);
    /** '' | email del listado | '__otro__' (escribir manual) */
    const [unoSelectValue, setUnoSelectValue] = useState('');
    const [emailUno, setEmailUno] = useState('');
    const [seleccionadosVarios, setSeleccionadosVarios] = useState([]);
    const [correosParaExtra, setCorreosParaExtra] = useState('');

    const emailsVariosMerged = useMemo(
        () => mergeEmailsSeleccionYExtra(seleccionadosVarios, correosParaExtra),
        [seleccionadosVarios, correosParaExtra],
    );

    const cargarPersonasCorreo = useCallback(async () => {
        if (!puedeEnviarCorreoInteresados) return;
        const desdeProp = personasDesdeInteresadosProp(interesados);
        const pid = Number(projectId);
        if (!Number.isFinite(pid) || pid <= 0) {
            setPersonasCorreo(desdeProp);
            return;
        }
        setCargandoPersonas(true);
        try {
            const res = await getCorreoDestinatariosProyecto(pid);
            const list = res.data?.data;
            const apiList = Array.isArray(list) ? list : [];
            setPersonasCorreo(fusionarPersonasCorreo(apiList, desdeProp));
        } catch {
            setPersonasCorreo(desdeProp);
        } finally {
            setCargandoPersonas(false);
        }
    }, [projectId, puedeEnviarCorreoInteresados, interesados]);

    useEffect(() => {
        if (!correoModal.open || !puedeEnviarCorreoInteresados) return;
        cargarPersonasCorreo();
    }, [correoModal.open, puedeEnviarCorreoInteresados, cargarPersonasCorreo]);

    const resetCamposCorreo = useCallback(() => {
        setAsunto('');
        setMensaje('');
        setUnoSelectValue('');
        setEmailUno('');
        setSeleccionadosVarios([]);
        setCorreosParaExtra('');
        setSendError('');
        setSendOk('');
    }, []);

    const abrirCorreoGeneral = useCallback(() => {
        setListaCorreoAviso('');
        resetCamposCorreo();
        setCorreoModal({ open: true, destinatariosModo: M.TODOS });
    }, [resetCamposCorreo]);

    const abrirCorreoUnInteresado = useCallback((row) => {
        if (!puedeEnviarCorreoInteresados) return;
        if (!emailValido(row.email)) {
            setListaCorreoAviso('Este interesado no tiene un correo válido.');
            return;
        }
        setListaCorreoAviso('');
        resetCamposCorreo();
        const em = String(row.email).trim();
        setEmailUno(em);
        setUnoSelectValue(emailValido(em) ? em : '__otro__');
        setCorreoModal({ open: true, destinatariosModo: M.UNO });
    }, [puedeEnviarCorreoInteresados, resetCamposCorreo]);

    const cerrarModalCorreo = useCallback(() => {
        setCorreoModal((m) => ({ ...m, open: false }));
        setSending(false);
        setSendError('');
        setSendOk('');
    }, []);

    const toggleSeleccionVario = useCallback((email) => {
        const em = String(email).trim();
        const k = em.toLowerCase();
        setSeleccionadosVarios((prev) => {
            const set = new Set(prev.map((x) => x.toLowerCase()));
            if (set.has(k)) {
                return prev.filter((x) => x.toLowerCase() !== k);
            }
            return [...prev, em];
        });
    }, []);

    const enviarCorreo = useCallback(async () => {
        if (!projectId) return;
        const { destinatariosModo } = correoModal;

        if (destinatariosModo === M.UNO && !emailValido(emailUno)) {
            setSendError('Escriba un correo válido para el destinatario.');
            return;
        }
        if (destinatariosModo === M.VARIOS) {
            if (emailsVariosMerged.length < 2) {
                setSendError('Seleccione o escriba al menos dos correos distintos (casillas y/o campo Para).');
                return;
            }
            if (emailsVariosMerged.length > MAX_DEST) {
                setSendError(`Máximo ${MAX_DEST} destinatarios por envío.`);
                return;
            }
        }

        setSending(true);
        setSendError('');
        setSendOk('');
        try {
            const payload = {
                asunto: asunto.trim(),
                mensaje: mensaje.trim(),
                destinatariosModo,
            };
            if (destinatariosModo === M.UNO) {
                payload.destinatariosEmails = [String(emailUno).trim()];
            } else if (destinatariosModo === M.VARIOS) {
                payload.destinatariosEmails = emailsVariosMerged;
            }

            const res = await postCorreoInteresadosProyecto(projectId, payload);
            const body = res.data;
            if (!body.success) {
                setSendError(body.message || 'No se pudo enviar el correo.');
                return;
            }
            const { sent, total, errors } = body.data || {};
            if (errors && errors.length > 0) {
                setSendOk(`Enviados ${sent} de ${total}. Algunos fallaron; revise la configuración de correo (SES).`);
            } else {
                setSendOk(`Se enviaron ${sent} correo(s) correctamente.`);
            }
            setTimeout(() => {
                cerrarModalCorreo();
            }, 1800);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Error al enviar.';
            setSendError(msg);
        } finally {
            setSending(false);
        }
    }, [projectId, asunto, mensaje, correoModal, emailUno, emailsVariosMerged, cerrarModalCorreo]);

    const formCorreoValido = useMemo(() => {
        const { destinatariosModo } = correoModal;
        if (!asunto.trim() || !mensaje.trim()) return false;
        if (destinatariosModo === M.UNO) return emailValido(emailUno);
        if (destinatariosModo === M.VARIOS) return emailsVariosMerged.length >= 2 && emailsVariosMerged.length <= MAX_DEST;
        return true;
    }, [correoModal, asunto, mensaje, emailUno, emailsVariosMerged]);

    const columns = useMemo(
        () => [
            { Header: 'Nombre del Interesado', accessor: 'nombre_interesado' },
            { Header: 'Rol', accessor: 'rol' },
            { Header: 'Cargo', accessor: 'cargo' },
            {
                Header: esPrograma ? 'Componente' : 'Compañía',
                accessor: 'compania_clasificacion'
            },
            { Header: 'Correo', accessor: 'email' },
            { Header: 'Evaluación', accessor: 'valoracion' },
            {
                Header: 'Acciones',
                accessor: 'acciones',
                Cell: ({ row }) => (
                    !cerrado ? (
                        <div className="d-flex align-items-center flex-wrap" style={{ gap: '6px' }}>
                            <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Fecha de registro: {moment(row.original.fecha_creacion).format('LLL')}</Tooltip>}
                            >
                                <button
                                    type="button"
                                    className="btn d-flex align-items-center"
                                    style={{ margin: '0 4px 0 0' }}
                                    onClick={() => setVerInteresado(row.original)}
                                >
                                    <FaArrowRight size={16} />
                                </button>
                            </OverlayTrigger>
                            {puedeEnviarCorreoInteresados && (
                                <OverlayTrigger placement="top" overlay={<Tooltip>Enviar correo a esta persona</Tooltip>}>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary d-flex align-items-center p-2"
                                        onClick={() => abrirCorreoUnInteresado(row.original)}
                                        disabled={!emailValido(row.original.email)}
                                    >
                                        <FaEnvelope size={14} />
                                    </button>
                                </OverlayTrigger>
                            )}
                        </div>
                    ) : (
                        <span style={{ padding: '0 10px', display: 'inline-block' }}></span>
                    )
                ),
            },
        ],
        [cerrado, esPrograma, puedeEnviarCorreoInteresados, abrirCorreoUnInteresado]
    );

    useEffect(() => {
        if (!interesados || interesados.length === 0) {
            setFilteredData([]);
            return;
        }

        const data = interesados.map(interesado => ({
            id: interesado.id,
            nombre_interesado: interesado.nombre_interesado ?? '',
            rol: interesado.rol ?? '',
            cargo: interesado.cargo ?? '-',
            compania_clasificacion: interesado.compania_clasificacion ?? '',
            email: interesado.email ?? '',
            valoracion: interesado.EvaluacionInteresado?.[0]?.valoracion ?? '0',
            fecha_creacion: interesado.fecha_creacion ?? '',
        }));

        setFilteredData(data);
    }, [interesados]);

    const onChangeModo = (e) => {
        const v = e.target.value;
        setCorreoModal((m) => ({ ...m, destinatariosModo: v }));
        if (v === M.TODOS) {
            setUnoSelectValue('');
            setEmailUno('');
            setSeleccionadosVarios([]);
            setCorreosParaExtra('');
        }
        if (v === M.UNO) {
            setUnoSelectValue('');
            setEmailUno('');
        }
    };

    const onChangeUnoSelect = (e) => {
        const v = e.target.value;
        setUnoSelectValue(v);
        if (v === '__otro__') {
            setEmailUno('');
        } else if (v) {
            setEmailUno(v);
        } else {
            setEmailUno('');
        }
    };

    useEffect(() => {
        if (!correoModal.open || correoModal.destinatariosModo !== M.UNO) return;
        if (unoSelectValue) return;
        if (personasCorreo[0]) {
            const first = personasCorreo[0].email;
            setUnoSelectValue(first);
            setEmailUno(first);
        } else {
            setUnoSelectValue('__otro__');
        }
    }, [correoModal.open, correoModal.destinatariosModo, personasCorreo, unoSelectValue]);

    const unoMuestraCampoManual = unoSelectValue === '__otro__' || unoSelectValue === '';

    const resumen = etiquetaResumen(correoModal.destinatariosModo, emailUno, emailsVariosMerged.length);

    return (
        <div className="proyectos-form">
            {!verInteresado ? (
                <>
                    {listaCorreoAviso && (
                        <div className="alert alert-warning py-2 small mb-2" role="alert">
                            {listaCorreoAviso}
                        </div>
                    )}
                    {puedeEnviarCorreoInteresados && !cerrado && projectId && (
                        <div className="mb-3 d-flex flex-wrap align-items-center" style={{ gap: '12px' }}>
                            <Button variant="outline-primary" size="sm" onClick={abrirCorreoGeneral} type="button">
                                <FaEnvelope className="me-2" />
                                Enviar correo…
                            </Button>
                            {usuario?.username && (
                                <small className="text-muted">
                                    Remitente: <strong>{usuario.username}</strong>
                                </small>
                            )}
                        </div>
                    )}
                    <CheckTable columns={columns} data={filteredData} />
                    {filteredData.length === 0 && (
                        <div className="center pull-down">
                            <p>No hay interesados por el momento</p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <button type="button" className="btn btn-secondary mb-3" onClick={() => setVerInteresado(null)}>
                        <FaArrowLeft size={16} /> Volver a la lista
                    </button>

                    <Interesado Interesadoid={verInteresado.id} toDo={toDo} markAsDoneCallback={markAsDoneCallback} esPrograma={esPrograma} />
                </>
            )}

            <Modal show={correoModal.open} onHide={cerrarModalCorreo} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Enviar correo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Destinatarios</Form.Label>
                        <Form.Control
                            as="select"
                            value={correoModal.destinatariosModo}
                            onChange={onChangeModo}
                            disabled={sending}
                        >
                            <option value={M.TODOS}>Todo el proyecto (equipo e interesados)</option>
                            <option value={M.UNO}>Una persona (un correo)</option>
                            <option value={M.VARIOS}>Varias personas (elegir y/o escribir correos)</option>
                        </Form.Control>
                    </Form.Group>

                    {correoModal.destinatariosModo === M.UNO && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Persona del proyecto</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={unoSelectValue}
                                    onChange={onChangeUnoSelect}
                                    disabled={sending || cargandoPersonas}
                                >
                                    <option value="">— Seleccione —</option>
                                    {personasCorreo.map((p) => (
                                        <option key={p.email} value={p.email}>
                                            {p.nombre} — {p.email} ({p.origen === 'equipo' ? 'Equipo' : 'Interesado'})
                                        </option>
                                    ))}
                                    <option value="__otro__">Otro correo (escribir manualmente)</option>
                                </Form.Control>
                                <Form.Text className="text-muted">
                                    Elija alguien del proyecto o use “Otro correo” para una dirección que no esté en la lista.
                                </Form.Text>
                            </Form.Group>
                            {unoMuestraCampoManual && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Correo</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={emailUno}
                                        onChange={(e) => setEmailUno(e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                        disabled={sending}
                                        autoComplete="off"
                                    />
                                </Form.Group>
                            )}
                        </>
                    )}

                    {correoModal.destinatariosModo === M.VARIOS && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Personas del proyecto</Form.Label>
                                {cargandoPersonas ? (
                                    <Spinner animation="border" size="sm" className="d-block" />
                                ) : (
                                    <div
                                        className="border rounded p-2 bg-light"
                                        style={{ maxHeight: '220px', overflowY: 'auto' }}
                                    >
                                        {personasCorreo.length === 0 ? (
                                            <span className="text-muted small">No hay contactos cargados; use el campo Para.</span>
                                        ) : (
                                            personasCorreo.map((p) => {
                                                const marcado = seleccionadosVarios.some((x) => x.toLowerCase() === p.email.toLowerCase());
                                                const tag = p.origen === 'equipo' ? 'Equipo' : 'Interesado';
                                                return (
                                                    <Form.Check
                                                        key={p.email}
                                                        type="checkbox"
                                                        id={`cv-${p.email}`}
                                                        className="small py-1"
                                                        checked={marcado}
                                                        onChange={() => toggleSeleccionVario(p.email)}
                                                        disabled={sending}
                                                        label={`${p.nombre} — ${p.email} (${tag})`}
                                                    />
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Para (correos adicionales)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={correosParaExtra}
                                    onChange={(e) => setCorreosParaExtra(e.target.value)}
                                    placeholder="Uno por línea, o separados por coma o punto y coma"
                                    disabled={sending}
                                />
                                <Form.Text className="text-muted">
                                    Añada aquí correos que no estén en la lista (clientes externos, copias, etc.).
                                </Form.Text>
                            </Form.Group>
                            <p className="small text-muted mb-0">
                                Se enviarán <strong>{emailsVariosMerged.length}</strong> correo(s) distinto(s)
                                {emailsVariosMerged.length > MAX_DEST && ` (máximo ${MAX_DEST})`}.
                            </p>
                        </>
                    )}

                    <p className="text-muted small mb-2 mt-2">Resumen: {resumen}</p>
                    {usuario?.username && (
                        <p className="small mb-3">
                            Remitente (From): <strong>{usuario.username}</strong>
                            {usuario.Persona && (usuario.Persona.nombre || usuario.Persona.apellido) && (
                                <> — {`${usuario.Persona.nombre || ''} ${usuario.Persona.apellido || ''}`.trim()}</>
                            )}
                        </p>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>Asunto</Form.Label>
                        <Form.Control
                            value={asunto}
                            onChange={(e) => setAsunto(e.target.value)}
                            maxLength={500}
                            disabled={sending}
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Mensaje</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            disabled={sending}
                        />
                    </Form.Group>
                    {sendError && <div className="alert alert-danger py-2 small mb-0">{sendError}</div>}
                    {sendOk && <div className="alert alert-success py-2 small mb-0">{sendOk}</div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrarModalCorreo} disabled={sending} type="button">
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={enviarCorreo}
                        disabled={sending || !formCorreoValido}
                        type="button"
                    >
                        {sending ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Enviando…
                            </>
                        ) : (
                            'Enviar'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const mapStateToProps = (state) => ({
    isLoading: selectors.getIsLoading(state),
    showNotification: selectors.getShowNotification(state),
    interesadosFromStore: selectors.getInteresadoList(state),
    usuario: sessionSelectors.getUser(state),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    interesados: ownProps.interesados != null ? ownProps.interesados : stateProps.interesadosFromStore,
    isLoading: stateProps.isLoading,
    showNotification: stateProps.showNotification,
    usuario: stateProps.usuario,
});

export default connect(mapStateToProps, null, mergeProps)(ViewInteresados);
