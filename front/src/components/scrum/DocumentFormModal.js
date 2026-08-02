import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Form, Button, Tabs, Tab, ListGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import * as Api from '../../api';
import {
    DOCUMENT_TYPES, DOCUMENT_STATES, DOCUMENT_RELATION_TYPES, emptyDocument, labelFor,
} from './scrumConstants';

const AGILE_DOC_TYPES = ['dor', 'dod', 'planning', 'daily', 'review', 'retro'];

export default function DocumentFormModal({
    show,
    onHide,
    document: doc,
    sprints = [],
    epics = [],
    stories = [],
    solicitudes = [],
    riesgos = [],
    esPredictivo = false,
    onSave,
    onUploadAttachment,
    onRemoveAttachment,
    onRestoreVersion,
    saving,
    readOnly,
}) {
    const [form, setForm] = useState(emptyDocument());
    const [googleDrive, setGoogleDrive] = useState({ connected: false, email: null, loading: false });
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const isEdit = Boolean(doc?.id);

    const checkGoogleDriveStatus = useCallback(async () => {
        try {
            setGoogleDrive((prev) => ({ ...prev, loading: true }));
            const res = await Api.getGoogleAuthStatus();
            if (res.data?.success) {
                setGoogleDrive({
                    connected: res.data.connected,
                    email: res.data.email,
                    loading: false,
                });
            }
        } catch (e) {
            setGoogleDrive((prev) => ({ ...prev, loading: false }));
        }
    }, []);

    useEffect(() => {
        if (show) {
            setForm(doc ? { ...emptyDocument(), ...doc } : emptyDocument());
            checkGoogleDriveStatus();
        }
    }, [show, doc, checkGoogleDriveStatus]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'GOOGLE_DRIVE_CONNECTED') {
                checkGoogleDriveStatus();
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [checkGoogleDriveStatus]);

    const handleConnectGoogleDrive = () => {
        const url = Api.getGoogleConnectUrl();
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(url, 'GoogleDriveAuth', `width=${width},height=${height},left=${left},top=${top}`);
        if (popup) {
            const timer = setInterval(() => {
                if (popup.closed) {
                    clearInterval(timer);
                    checkGoogleDriveStatus();
                }
            }, 800);
        }
    };

    const handleDisconnectGoogleDrive = async () => {
        if (!window.confirm('¿Desvincular tu cuenta de Google Drive? Los nuevos archivos deberán subirse tras volver a conectar.')) return;
        try {
            await Api.disconnectGoogleDrive();
            setGoogleDrive({ connected: false, email: null, loading: false });
        } catch (e) {
            console.error('Error al desvincular Google Drive', e);
        }
    };

    const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.titulo?.trim()) return;
        onSave({
            ...form,
            sprint_id: form.sprint_id || null,
            epic_id: form.epic_id || null,
            story_id: form.story_id || null,
            solicitud_cambio_id: form.solicitud_cambio_id || null,
            riesgo_ref: form.riesgo_ref || null,
        }, isEdit);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !onUploadAttachment) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo supera el límite de 5 MB');
            e.target.value = '';
            return;
        }
        setUploadingAttachment(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const base64 = String(reader.result).split(',')[1];
                await onUploadAttachment({
                    nombre: file.name,
                    mime: file.type,
                    data: base64,
                });
            } finally {
                setUploadingAttachment(false);
                e.target.value = '';
            }
        };
        reader.onerror = () => setUploadingAttachment(false);
        reader.readAsDataURL(file);
    };

    const historialVersiones = isEdit && Array.isArray(doc?.historial)
        ? [...doc.historial].reverse().filter((h) => h.contenido !== undefined || h.accion === 'creacion')
        : [];

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{isEdit ? 'Editar documento' : 'Nuevo documento'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Tabs defaultActiveKey="general" className="mb-3">
                        <Tab eventKey="general" title="General">
                            <RowFields>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo *</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={form.tipo}
                                        onChange={(e) => setField('tipo', e.target.value)}
                                        disabled={readOnly}
                                    >
                                        {(esPredictivo ? DOCUMENT_TYPES.filter((t) => !AGILE_DOC_TYPES.includes(t.value)) : DOCUMENT_TYPES).map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={form.estado}
                                        onChange={(e) => setField('estado', e.target.value)}
                                        disabled={readOnly}
                                    >
                                        {DOCUMENT_STATES.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </RowFields>
                            <Form.Group className="mb-3">
                                <Form.Label>Título *</Form.Label>
                                <Form.Control
                                    value={form.titulo}
                                    onChange={(e) => setField('titulo', e.target.value)}
                                    disabled={readOnly}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Descripción breve</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={form.descripcion || ''}
                                    onChange={(e) => setField('descripcion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Form.Group>
                        </Tab>
                        <Tab eventKey="relacion" title="Relaciones">
                            <Form.Group className="mb-3">
                                <Form.Label>Relacionado con</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={form.relacion_tipo || 'proyecto'}
                                    onChange={(e) => setField('relacion_tipo', e.target.value)}
                                    disabled={readOnly}
                                >
                                    {DOCUMENT_RELATION_TYPES.filter((r) => !esPredictivo || r.value === 'proyecto').map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            {!esPredictivo && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Sprint</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={form.sprint_id || ''}
                                        onChange={(e) => setField('sprint_id', e.target.value)}
                                        disabled={readOnly}
                                    >
                                        <option value="">— Ninguno —</option>
                                        {sprints.map((s) => (
                                            <option key={s.id} value={s.id}>{s.codigo} — {s.nombre}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            )}
                            {!esPredictivo && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Épica</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={form.epic_id || ''}
                                        onChange={(e) => setField('epic_id', e.target.value)}
                                        disabled={readOnly}
                                    >
                                        <option value="">— Ninguna —</option>
                                        {epics.map((e) => (
                                            <option key={e.id} value={e.id}>{e.codigo} — {e.nombre}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            )}
                            {!esPredictivo && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Historia</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={form.story_id || ''}
                                        onChange={(e) => setField('story_id', e.target.value)}
                                        disabled={readOnly}
                                    >
                                        <option value="">— Ninguna —</option>
                                        {stories.map((s) => (
                                            <option key={s.id} value={s.id}>{s.codigo} — {s.titulo}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            )}
                            <Form.Group className="mb-3">
                                <Form.Label>Solicitud de cambio</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={form.solicitud_cambio_id || ''}
                                    onChange={(e) => setField('solicitud_cambio_id', e.target.value)}
                                    disabled={readOnly}
                                >
                                    <option value="">— Ninguna —</option>
                                    {solicitudes.map((c) => (
                                        <option key={c.id} value={c.id}>#{c.id} — {c.nombre_cambio}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Riesgo del proyecto</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={form.riesgo_ref || ''}
                                    onChange={(e) => setField('riesgo_ref', e.target.value)}
                                    disabled={readOnly}
                                >
                                    <option value="">— Ninguno —</option>
                                    {riesgos.map((r, idx) => (
                                        <option key={idx} value={r.nombre || `riesgo-${idx}`}>
                                            {r.nombre || `Riesgo ${idx + 1}`}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group className="mb-0">
                                <Form.Label>Referencia externa</Form.Label>
                                <Form.Control
                                    value={form.relacion_ref || ''}
                                    onChange={(e) => setField('relacion_ref', e.target.value)}
                                    placeholder="URL, ticket, enlace..."
                                    disabled={readOnly}
                                />
                            </Form.Group>
                        </Tab>
                        <Tab eventKey="contenido" title="Contenido">
                            <Form.Group className="mb-0">
                                <Form.Label>Contenido</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={12}
                                    value={form.contenido || ''}
                                    onChange={(e) => setField('contenido', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Acta, notas, DoR, DoD, retrospectiva..."
                                />
                                {isEdit && doc?.version && (
                                    <Form.Text className="text-muted">
                                        Versión actual: {doc.version}. Al modificar el contenido se crea una nueva versión.
                                    </Form.Text>
                                )}
                            </Form.Group>
                            {historialVersiones.length > 0 && (
                                <div className="mt-3 small">
                                    <strong>Historial de versiones</strong>
                                    <ListGroup className="mt-2">
                                        {historialVersiones.slice(0, 8).map((h, i) => (
                                            <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center py-2">
                                                <span>
                                                    v{h.version} — {h.accion}
                                                    {' · '}
                                                    {new Date(h.fecha).toLocaleString('es-ES')}
                                                </span>
                                                {!readOnly && h.contenido !== undefined && onRestoreVersion && h.version !== doc.version && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline-secondary"
                                                        onClick={() => onRestoreVersion(h.version)}
                                                    >
                                                        Restaurar
                                                    </Button>
                                                )}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            )}
                        </Tab>
                        {isEdit && (
                            <Tab eventKey="adjuntos" title={`Adjuntos (${(doc?.archivos || []).length})`}>
                                <div className="mb-3">
                                    {googleDrive.connected ? (
                                        <Alert variant="success" className="d-flex align-items-center justify-content-between py-2 mb-3">
                                            <div className="small">
                                                <i className="bi bi-google me-2" />
                                                <strong>Google Drive Conectado:</strong> {googleDrive.email || 'Cuenta vinculada'}
                                                <br />
                                                <span className="text-muted">Los nuevos archivos adjuntos se subirán automáticamente a tu Google Drive.</span>
                                            </div>
                                            {!readOnly && (
                                                <Button size="sm" variant="outline-danger" className="ms-2" onClick={handleDisconnectGoogleDrive}>
                                                    Desvincular
                                                </Button>
                                            )}
                                        </Alert>
                                    ) : (
                                        <Alert variant="light" className="border d-flex align-items-center justify-content-between py-2 mb-3">
                                            <div className="small text-muted">
                                                <i className="bi bi-cloud-upload me-2" />
                                                <strong>¿Sin espacio?</strong> Conecta tu cuenta de Google Drive para guardar los adjuntos directamente en tu propio Drive sin límites.
                                            </div>
                                            {!readOnly && (
                                                <Button size="sm" variant="outline-primary" className="ms-2 text-nowrap" onClick={handleConnectGoogleDrive}>
                                                    <i className="bi bi-google me-1" /> Conectar Google Drive
                                                </Button>
                                            )}
                                        </Alert>
                                    )}
                                </div>

                                {!readOnly && onUploadAttachment && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Subir archivo a Google Drive (máx. 5 MB)</Form.Label>
                                        <Form.Control type="file" onChange={handleFileChange} disabled={readOnly || uploadingAttachment || !googleDrive.connected} />
                                        {uploadingAttachment && (
                                            <div className="text-primary small mt-2 d-flex align-items-center">
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Subiendo archivo a tu Google Drive...
                                            </div>
                                        )}
                                        {!googleDrive.connected && (
                                            <Form.Text className="text-danger">
                                                Debes conectar tu cuenta de Google Drive arriba para poder adjuntar archivos.
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                )}
                                {(doc?.archivos || []).length === 0 ? (
                                    <p className="text-muted small mb-0">Sin archivos adjuntos.</p>
                                ) : (
                                    <ListGroup>
                                        {(doc.archivos || []).map((f) => (
                                            <ListGroup.Item key={f.id} className="d-flex justify-content-between align-items-center small">
                                                <span>
                                                    <i className={f.storage === 'google_drive' || f.webViewLink ? 'bi bi-google text-success me-1' : 'bi bi-paperclip me-1'} />
                                                    {f.webViewLink ? (
                                                        <a href={f.webViewLink} target="_blank" rel="noopener noreferrer" className="fw-semibold">
                                                            {f.nombre}
                                                        </a>
                                                    ) : (
                                                        f.nombre
                                                    )}
                                                    <Badge variant="light" className="ms-2 text-muted">
                                                        {Math.round((f.size || 0) / 1024)} KB
                                                    </Badge>
                                                    {f.storage === 'google_drive' && (
                                                        <Badge variant="success" className="ms-1">Google Drive</Badge>
                                                    )}
                                                </span>
                                                <div>
                                                    {f.webViewLink && (
                                                        <a
                                                            href={f.webViewLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-link btn-sm p-0 me-2 text-primary"
                                                            title="Ver en Google Drive"
                                                        >
                                                            <i className="bi bi-box-arrow-up-right" />
                                                        </a>
                                                    )}
                                                    {!readOnly && onRemoveAttachment && (
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0 text-danger"
                                                            onClick={() => onRemoveAttachment(f.id)}
                                                        >
                                                            <i className="bi bi-trash" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Tab>
                        )}
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    {!readOnly && (
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear documento')}
                        </Button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

function RowFields({ children }) {
    return <div className="row">{React.Children.map(children, (c) => <div className="col-md-6">{c}</div>)}</div>;
}