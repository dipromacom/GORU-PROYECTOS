import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Tooltip, OverlayTrigger, Modal, Button, Form, Spinner } from 'react-bootstrap';
import { FaArrowRight, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { CheckTable } from '../checkTable/CheckTable';
import moment from 'moment';
import { selectors } from "../../reducers/project";
import { selectors as sessionSelectors } from '../../reducers/session';
import { Interesado } from "../ProyectoDetailMatriz/Interesado";
import { postCorreoInteresadosProyecto, getUsuariosProyecto, getUsuarioById } from '../../api';
import './ViewInteresados.css';

const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(String(e || '').trim());

const M = {
    TODOS: 'todos',
    COLAB_TODOS: 'colaboradores_todos',
    COLAB_UNO: 'colaborador',
    INT_TODOS: 'interesados_todos',
    INT_UNO: 'interesado',
};

function colabIdValido(v) {
    const n = Number(v);
    return v !== '' && !Number.isNaN(n) && n > 0;
}

function formCorreoValido(m) {
    if (m.destinatariosModo === M.INT_UNO) {
        return m.interesadoId != null && !Number.isNaN(Number(m.interesadoId));
    }
    if (m.destinatariosModo === M.COLAB_UNO) {
        return colabIdValido(m.colaboradorUsuarioId);
    }
    return true;
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
    puedeEnviarCorreoColaboradores,
    usuarioCreadorId,
}) => {
    const [filteredData, setFilteredData] = useState([]);
    const [verInteresado, setVerInteresado] = useState(null);
    const [correoModal, setCorreoModal] = useState({
        open: false,
        destinatariosModo: M.INT_TODOS,
        interesadoId: null,
        colaboradorUsuarioId: '',
    });
    const [asunto, setAsunto] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [sendOk, setSendOk] = useState('');
    const [listaCorreoAviso, setListaCorreoAviso] = useState('');
    const [colaboradoresOpciones, setColaboradoresOpciones] = useState([]);
    const [cargandoColaboradores, setCargandoColaboradores] = useState(false);

    const puedeAlgunoCorreo = puedeEnviarCorreoInteresados || puedeEnviarCorreoColaboradores;

    const defaultModoCorreo = useCallback(() => {
        if (puedeEnviarCorreoInteresados && puedeEnviarCorreoColaboradores) return M.TODOS;
        if (puedeEnviarCorreoInteresados) return M.INT_TODOS;
        return M.COLAB_TODOS;
    }, [puedeEnviarCorreoInteresados, puedeEnviarCorreoColaboradores]);

    const etiquetaModo = useCallback((modo, interId, colabId) => {
        switch (modo) {
            case M.TODOS: return 'Todos los colaboradores e interesados (correo único por dirección)';
            case M.COLAB_TODOS: return 'Todos los colaboradores del proyecto';
            case M.COLAB_UNO: {
                const o = colaboradoresOpciones.find((c) => String(c.usuario_id) === String(colabId));
                return o ? o.label : 'Un colaborador';
            }
            case M.INT_TODOS: return 'Todos los interesados con correo válido';
            case M.INT_UNO: {
                const row = filteredData.find((r) => r.id === interId);
                return row ? `${row.nombre_interesado || 'Interesado'} (${row.email})` : 'Un interesado';
            }
            default: return '';
        }
    }, [colaboradoresOpciones, filteredData]);

    const cargarColaboradores = useCallback(async () => {
        if (!projectId || !puedeEnviarCorreoColaboradores) return;
        setCargandoColaboradores(true);
        try {
            const res = await getUsuariosProyecto(projectId);
            const raw = res.data?.data || [];
            const list = raw.map((up) => ({
                usuario_id: up.usuario_id,
                email: up.Usuario?.username || '',
                label: `${up.Usuario?.username || ''}${up.RolProyecto?.nombre ? ` — ${up.RolProyecto.nombre}` : ''}`,
            })).filter((x) => emailValido(x.email));

            const ids = new Set(list.map((x) => Number(x.usuario_id)));
            const creadorNum = usuarioCreadorId != null ? Number(usuarioCreadorId) : null;
            if (creadorNum != null && !Number.isNaN(creadorNum) && !ids.has(creadorNum)) {
                try {
                    const ur = await getUsuarioById(creadorNum);
                    const u = ur.data?.data;
                    if (u?.username && emailValido(u.username)) {
                        list.unshift({
                            usuario_id: creadorNum,
                            email: u.username,
                            label: `${u.username} — Creador del proyecto`,
                        });
                    }
                } catch {
                    /* ignorar */
                }
            }
            setColaboradoresOpciones(list);
        } catch {
            setColaboradoresOpciones([]);
        } finally {
            setCargandoColaboradores(false);
        }
    }, [projectId, puedeEnviarCorreoColaboradores, usuarioCreadorId]);

    useEffect(() => {
        if (!correoModal.open || !puedeEnviarCorreoColaboradores) return;
        cargarColaboradores();
    }, [correoModal.open, puedeEnviarCorreoColaboradores, cargarColaboradores]);

    useEffect(() => {
        if (!correoModal.open || correoModal.destinatariosModo !== M.COLAB_UNO) return;
        if (colabIdValido(correoModal.colaboradorUsuarioId)) return;
        if (colaboradoresOpciones.length === 0) return;
        setCorreoModal((m) => ({ ...m, colaboradorUsuarioId: String(colaboradoresOpciones[0].usuario_id) }));
    }, [correoModal.open, correoModal.destinatariosModo, correoModal.colaboradorUsuarioId, colaboradoresOpciones]);

    const abrirCorreoGeneral = useCallback(() => {
        setListaCorreoAviso('');
        setSendError('');
        setSendOk('');
        setAsunto('');
        setMensaje('');
        setCorreoModal({
            open: true,
            destinatariosModo: defaultModoCorreo(),
            interesadoId: null,
            colaboradorUsuarioId: '',
        });
    }, [defaultModoCorreo]);

    const abrirCorreoInteresado = useCallback((row) => {
        if (!puedeEnviarCorreoInteresados) return;
        if (!emailValido(row.email)) {
            setListaCorreoAviso('Este interesado no tiene un correo válido.');
            return;
        }
        setListaCorreoAviso('');
        setSendError('');
        setSendOk('');
        setAsunto('');
        setMensaje('');
        setCorreoModal({
            open: true,
            destinatariosModo: M.INT_UNO,
            interesadoId: row.id,
            colaboradorUsuarioId: '',
        });
    }, [puedeEnviarCorreoInteresados]);

    const cerrarModalCorreo = useCallback(() => {
        setCorreoModal((m) => ({ ...m, open: false }));
        setSending(false);
        setSendError('');
        setSendOk('');
    }, []);

    const enviarCorreo = useCallback(async () => {
        if (!projectId) return;
        const { destinatariosModo, interesadoId, colaboradorUsuarioId } = correoModal;

        if (destinatariosModo === M.INT_UNO && (interesadoId == null || Number.isNaN(Number(interesadoId)))) {
            setSendError('Seleccione un interesado.');
            return;
        }
        if (destinatariosModo === M.COLAB_UNO && !colabIdValido(colaboradorUsuarioId)) {
            setSendError('Seleccione un colaborador.');
            return;
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
            if (destinatariosModo === M.INT_UNO) {
                payload.interesadoIds = [Number(interesadoId)];
            }
            if (destinatariosModo === M.COLAB_UNO) {
                payload.colaboradorUsuarioIds = [Number(colaboradorUsuarioId)];
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
    }, [projectId, asunto, mensaje, correoModal, cerrarModalCorreo]);

    const interesadosConEmail = useMemo(
        () => (filteredData || []).filter((r) => emailValido(r.email)),
        [filteredData],
    );

    useEffect(() => {
        if (!correoModal.open || correoModal.destinatariosModo !== M.INT_UNO) return;
        if (correoModal.interesadoId != null) return;
        if (interesadosConEmail.length === 0) return;
        setCorreoModal((m) => ({ ...m, interesadoId: interesadosConEmail[0].id }));
    }, [correoModal.open, correoModal.destinatariosModo, correoModal.interesadoId, interesadosConEmail]);

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
                                <OverlayTrigger placement="top" overlay={<Tooltip>Enviar correo a este interesado</Tooltip>}>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary d-flex align-items-center p-2"
                                        onClick={() => abrirCorreoInteresado(row.original)}
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
        [cerrado, esPrograma, puedeEnviarCorreoInteresados, abrirCorreoInteresado]
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
        setCorreoModal((m) => ({
            ...m,
            destinatariosModo: v,
            interesadoId: v === M.INT_UNO ? m.interesadoId : null,
            colaboradorUsuarioId: v === M.COLAB_UNO ? m.colaboradorUsuarioId : '',
        }));
    };

    const destLabel = etiquetaModo(
        correoModal.destinatariosModo,
        correoModal.interesadoId,
        correoModal.colaboradorUsuarioId,
    );

    return (
        <div className="proyectos-form">
            {!verInteresado ? (
                <>
                    {listaCorreoAviso && (
                        <div className="alert alert-warning py-2 small mb-2" role="alert">
                            {listaCorreoAviso}
                        </div>
                    )}
                    {puedeAlgunoCorreo && !cerrado && projectId && (
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
                            {puedeEnviarCorreoInteresados && puedeEnviarCorreoColaboradores && (
                                <option value={M.TODOS}>Todos (colaboradores + interesados, sin duplicar correos)</option>
                            )}
                            {puedeEnviarCorreoColaboradores && (
                                <>
                                    <option value={M.COLAB_TODOS}>Solo colaboradores del proyecto</option>
                                    <option value={M.COLAB_UNO}>Un colaborador</option>
                                </>
                            )}
                            {puedeEnviarCorreoInteresados && (
                                <>
                                    <option value={M.INT_TODOS}>Solo interesados (todos con email válido)</option>
                                    <option value={M.INT_UNO}>Un interesado</option>
                                </>
                            )}
                        </Form.Control>
                    </Form.Group>

                    {correoModal.destinatariosModo === M.COLAB_UNO && puedeEnviarCorreoColaboradores && (
                        <Form.Group className="mb-3">
                            <Form.Label>Colaborador</Form.Label>
                            {cargandoColaboradores ? (
                                <Spinner animation="border" size="sm" className="d-block" />
                            ) : (
                                <Form.Control
                                    as="select"
                                    value={correoModal.colaboradorUsuarioId}
                                    onChange={(e) => setCorreoModal((m) => ({ ...m, colaboradorUsuarioId: e.target.value }))}
                                    disabled={sending || colaboradoresOpciones.length === 0}
                                >
                                    <option value="">— Seleccione —</option>
                                    {colaboradoresOpciones.map((c) => (
                                        <option key={c.usuario_id} value={String(c.usuario_id)}>{c.label}</option>
                                    ))}
                                </Form.Control>
                            )}
                        </Form.Group>
                    )}

                    {correoModal.destinatariosModo === M.INT_UNO && puedeEnviarCorreoInteresados && (
                        <Form.Group className="mb-3">
                            <Form.Label>Interesado</Form.Label>
                            <Form.Control
                                as="select"
                                value={correoModal.interesadoId != null ? String(correoModal.interesadoId) : ''}
                                onChange={(e) => setCorreoModal((m) => ({ ...m, interesadoId: e.target.value ? Number(e.target.value) : null }))}
                                disabled={sending || interesadosConEmail.length === 0}
                            >
                                <option value="">— Seleccione —</option>
                                {interesadosConEmail.map((r) => (
                                    <option key={r.id} value={String(r.id)}>{r.nombre_interesado} ({r.email})</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    )}

                    <p className="text-muted small mb-2">Resumen: {destLabel}</p>
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
                        disabled={sending || !asunto.trim() || !mensaje.trim() || !formCorreoValido(correoModal)}
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
