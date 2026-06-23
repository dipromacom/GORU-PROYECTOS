import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Tabs, Tab, ListGroup, Badge } from 'react-bootstrap';
import {
    DOCUMENT_TYPES, DOCUMENT_STATES, DOCUMENT_RELATION_TYPES, emptyDocument, labelFor,
} from './scrumConstants';

export default function DocumentFormModal({
    show,
    onHide,
    document: doc,
    sprints = [],
    epics = [],
    stories = [],
    solicitudes = [],
    riesgos = [],
    onSave,
    onUploadAttachment,
    onRemoveAttachment,
    onRestoreVersion,
    saving,
    readOnly,
}) {
    const [form, setForm] = useState(emptyDocument());
    const isEdit = Boolean(doc?.id);

    useEffect(() => {
        if (show) {
            setForm(doc ? { ...emptyDocument(), ...doc } : emptyDocument());
        }
    }, [show, doc]);

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
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = String(reader.result).split(',')[1];
            onUploadAttachment({
                nombre: file.name,
                mime: file.type,
                data: base64,
            });
            e.target.value = '';
        };
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
                                        {DOCUMENT_TYPES.map((t) => (
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
                                    {DOCUMENT_RELATION_TYPES.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
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
                                {!readOnly && onUploadAttachment && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Subir archivo (máx. 5 MB)</Form.Label>
                                        <Form.Control type="file" onChange={handleFileChange} disabled={readOnly} />
                                    </Form.Group>
                                )}
                                {(doc?.archivos || []).length === 0 ? (
                                    <p className="text-muted small mb-0">Sin archivos adjuntos.</p>
                                ) : (
                                    <ListGroup>
                                        {(doc.archivos || []).map((f) => (
                                            <ListGroup.Item key={f.id} className="d-flex justify-content-between align-items-center small">
                                                <span>
                                                    <i className="bi bi-paperclip me-1" />
                                                    {f.nombre}
                                                    <Badge variant="light" className="ms-2 text-muted">
                                                        {Math.round((f.size || 0) / 1024)} KB
                                                    </Badge>
                                                </span>
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
