import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Row, Col, Card, Button, Form, Table, Spinner, Alert, Modal, Tabs, Tab, ListGroup, InputGroup,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import moment from 'moment';
import { pdf } from '@react-pdf/renderer';
import * as Api from '../../api';
import DocumentFormModal from './DocumentFormModal';
import ScrumDocumentPdf from './ScrumDocumentPdf';
import ScrumPill from './ScrumPill';
import {
    DOCUMENT_TYPES, DOCUMENT_STATES, DOCUMENT_STATE_STYLES, labelFor,
} from './scrumConstants';
import { getAutorName } from './scrumHelpers';

const LIBRARY_KEYS = ['dor', 'dod', 'retro', 'decision', 'evidencia'];

export default function DocsPanel({
    projectId,
    sprints = [],
    epics = [],
    stories = [],
    puedeGestionar,
}) {
    const [documents, setDocuments] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [riesgos, setRiesgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewTab, setViewTab] = useState('todos');
    const [search, setSearch] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterSprint, setFilterSprint] = useState('');
    const [filterEpic, setFilterEpic] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [saving, setSaving] = useState(false);
    const [viewDoc, setViewDoc] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [commentSaving, setCommentSaving] = useState(false);

    const loadDocs = useCallback(() => {
        setLoading(true);
        const params = {};
        if (filterTipo) params.tipo = filterTipo;
        if (filterSprint) params.sprint_id = filterSprint;
        if (filterEpic) params.epic_id = filterEpic;
        Api.getScrumDocuments(projectId, params)
            .then((res) => {
                setDocuments(res.data.documents || []);
                setError(null);
            })
            .catch((e) => setError(e.response?.data?.message || 'Error al cargar documentos'))
            .finally(() => setLoading(false));
    }, [projectId, filterTipo, filterSprint, filterEpic]);

    useEffect(() => { loadDocs(); }, [loadDocs]);

    useEffect(() => {
        Api.getSolicitudesProyecto(projectId)
            .then((res) => setSolicitudes(Array.isArray(res.data?.data) ? res.data.data : []))
            .catch(() => setSolicitudes([]));
        Api.getProyectoByID(projectId)
            .then((res) => {
                const p = res.data?.data || {};
                setRiesgos(Array.isArray(p.riesgos) ? p.riesgos : []);
            })
            .catch(() => setRiesgos([]));
    }, [projectId]);

    const stats = useMemo(() => ({
        total: documents.length,
        retrospectivas: documents.filter((d) => d.tipo === 'retro').length,
        decisiones: documents.filter((d) => d.tipo === 'decision').length,
        evidencias: documents.filter((d) => d.tipo === 'evidencia').length,
    }), [documents]);

    const libraryCounts = useMemo(() => {
        const counts = {};
        LIBRARY_KEYS.forEach((k) => { counts[k] = documents.filter((d) => d.tipo === k).length; });
        return counts;
    }, [documents]);

    const filtered = useMemo(() => {
        let list = documents;
        if (viewTab === 'sprint') list = list.filter((d) => d.sprint_id);
        if (viewTab === 'epica') list = list.filter((d) => d.epic_id);
        if (viewTab === 'retro') list = list.filter((d) => d.tipo === 'retro');
        if (viewTab === 'decision') list = list.filter((d) => d.tipo === 'decision');
        if (viewTab === 'evidencia') list = list.filter((d) => d.tipo === 'evidencia');

        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((d) =>
            (d.titulo || '').toLowerCase().includes(q)
            || (d.descripcion || '').toLowerCase().includes(q)
            || labelFor(DOCUMENT_TYPES, d.tipo).toLowerCase().includes(q));
    }, [documents, search, viewTab]);

    const recentUpdates = useMemo(() =>
        [...documents].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5),
        [documents]);

    const getRelacionLabel = (doc) => {
        if (doc.Sprint) return `Sprint ${doc.Sprint.codigo || doc.Sprint.nombre}`;
        if (doc.Epic) return `Épica ${doc.Epic.codigo}`;
        if (doc.Story) return `Historia ${doc.Story.codigo}`;
        if (doc.SolicitudCambio) return `Cambio #${doc.SolicitudCambio.id}: ${doc.SolicitudCambio.nombre_cambio}`;
        if (doc.riesgo_ref) return `Riesgo: ${doc.riesgo_ref}`;
        if (doc.relacion_ref) return doc.relacion_ref;
        return 'Proyecto';
    };

    const refreshEditingDoc = async (docId) => {
        const res = await Api.getScrumDocument(projectId, docId);
        setEditingDoc(res.data.document);
        if (viewDoc?.id === docId) setViewDoc(res.data.document);
        loadDocs();
        return res.data.document;
    };

    const handleSave = async (payload, isEdit) => {
        setSaving(true);
        try {
            if (isEdit) {
                await Api.updateScrumDocument(projectId, editingDoc.id, payload);
                toast.success('Documento actualizado');
                await refreshEditingDoc(editingDoc.id);
            } else {
                const res = await Api.createScrumDocument(projectId, payload);
                toast.success('Documento creado. Podés adjuntar archivos en la pestaña Adjuntos.');
                setEditingDoc(res.data.document);
            }
            if (isEdit) {
                setShowForm(false);
                setEditingDoc(null);
            }
            loadDocs();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (doc) => {
        if (!window.confirm(`¿Eliminar "${doc.titulo}"?`)) return;
        try {
            await Api.deleteScrumDocument(projectId, doc.id);
            toast.success('Documento eliminado');
            if (viewDoc?.id === doc.id) setViewDoc(null);
            loadDocs();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al eliminar');
        }
    };

    const openEdit = async (doc) => {
        try {
            const res = await Api.getScrumDocument(projectId, doc.id);
            setEditingDoc(res.data.document);
            setShowForm(true);
        } catch (e) {
            toast.error('No se pudo cargar el documento');
        }
    };

    const handleUploadAttachment = async (filePayload) => {
        if (!editingDoc?.id) return;
        try {
            await Api.addScrumDocumentAttachment(projectId, editingDoc.id, filePayload);
            toast.success('Archivo adjuntado');
            await refreshEditingDoc(editingDoc.id);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al subir archivo');
        }
    };

    const handleRemoveAttachment = async (fileId) => {
        if (!editingDoc?.id) return;
        try {
            await Api.removeScrumDocumentAttachment(projectId, editingDoc.id, fileId);
            toast.success('Archivo eliminado');
            await refreshEditingDoc(editingDoc.id);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al eliminar archivo');
        }
    };

    const handleRestoreVersion = async (version) => {
        if (!editingDoc?.id || !window.confirm(`¿Restaurar la versión ${version}?`)) return;
        try {
            await Api.restoreScrumDocumentVersion(projectId, editingDoc.id, version);
            toast.success('Versión restaurada');
            await refreshEditingDoc(editingDoc.id);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al restaurar versión');
        }
    };

    const downloadAttachment = async (doc, fileId) => {
        try {
            const res = await Api.downloadScrumDocumentAttachment(projectId, doc.id, fileId);
            const fileMeta = (doc.archivos || []).find((f) => f.id === fileId);
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileMeta?.nombre || 'archivo';
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            toast.error('No se pudo descargar el archivo');
        }
    };

    const exportPdf = async (doc) => {
        try {
            const blob = await pdf(
                <ScrumDocumentPdf
                    doc={doc}
                    tipoLabel={labelFor(DOCUMENT_TYPES, doc.tipo)}
                    estadoLabel={labelFor(DOCUMENT_STATES, doc.estado)}
                    autor={getAutorName(doc)}
                    relacion={getRelacionLabel(doc)}
                />,
            ).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${doc.titulo.replace(/\s+/g, '_')}_v${doc.version}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            toast.error('Error al generar PDF');
        }
    };

    const handleAddComment = async () => {
        if (!viewDoc?.id || !commentText.trim()) return;
        setCommentSaving(true);
        try {
            const res = await Api.addScrumDocumentComment(projectId, viewDoc.id, commentText.trim());
            setViewDoc(res.data.document);
            setCommentText('');
            loadDocs();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error al comentar');
        } finally {
            setCommentSaving(false);
        }
    };

    if (loading && documents.length === 0) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="g-3 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center h-100">
                        <Card.Body>
                            <div className="text-muted small">Total documentos</div>
                            <div className="fs-3 fw-bold text-primary">{stats.total}</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center h-100">
                        <Card.Body>
                            <div className="text-muted small">Retrospectivas</div>
                            <div className="fs-3 fw-bold">{stats.retrospectivas}</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center h-100">
                        <Card.Body>
                            <div className="text-muted small">Decisiones</div>
                            <div className="fs-3 fw-bold">{stats.decisiones}</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center h-100">
                        <Card.Body>
                            <div className="text-muted small">Evidencias</div>
                            <div className="fs-3 fw-bold text-success">{stats.evidencias}</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-3">
                <Col lg={9}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <strong className="small">Repositorio de documentos</strong>
                            {puedeGestionar && (
                                <Button size="sm" variant="primary" onClick={() => { setEditingDoc(null); setShowForm(true); }}>
                                    <i className="bi bi-plus-lg me-1" /> Nuevo documento
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body>
                            <Tabs activeKey={viewTab} onSelect={(k) => setViewTab(k || 'todos')} className="mb-3 small">
                                <Tab eventKey="todos" title="Todos" />
                                <Tab eventKey="sprint" title="Por sprint" />
                                <Tab eventKey="epica" title="Por épica" />
                                <Tab eventKey="retro" title="Retrospectivas" />
                                <Tab eventKey="decision" title="Decisiones" />
                                <Tab eventKey="evidencia" title="Evidencias" />
                            </Tabs>

                            <Row className="g-2 mb-3">
                                <Col md={3}>
                                    <Form.Control
                                        size="sm"
                                        placeholder="Buscar..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Control
                                        as="select"
                                        size="sm"
                                        value={filterTipo}
                                        onChange={(e) => setFilterTipo(e.target.value)}
                                    >
                                        <option value="">Todos los tipos</option>
                                        {DOCUMENT_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </Form.Control>
                                </Col>
                                <Col md={3}>
                                    <Form.Control
                                        as="select"
                                        size="sm"
                                        value={filterSprint}
                                        onChange={(e) => setFilterSprint(e.target.value)}
                                    >
                                        <option value="">Todos los sprints</option>
                                        {sprints.map((s) => (
                                            <option key={s.id} value={s.id}>{s.codigo} — {s.nombre}</option>
                                        ))}
                                    </Form.Control>
                                </Col>
                                <Col md={3}>
                                    <Form.Control
                                        as="select"
                                        size="sm"
                                        value={filterEpic}
                                        onChange={(e) => setFilterEpic(e.target.value)}
                                    >
                                        <option value="">Todas las épicas</option>
                                        {epics.map((e) => (
                                            <option key={e.id} value={e.id}>{e.codigo} — {e.nombre}</option>
                                        ))}
                                    </Form.Control>
                                </Col>
                            </Row>

                            <Table responsive size="sm" className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Título</th>
                                        <th>Tipo</th>
                                        <th>Relación</th>
                                        <th>Versión</th>
                                        <th>Autor</th>
                                        <th>Estado</th>
                                        <th>Actualizado</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={8} className="text-center text-muted py-4">Sin documentos</td></tr>
                                    )}
                                    {filtered.map((doc) => (
                                        <tr key={doc.id}>
                                            <td>
                                                <Button variant="link" className="p-0 text-start" onClick={() => setViewDoc(doc)}>
                                                    {doc.titulo}
                                                </Button>
                                                {(doc.archivos || []).length > 0 && (
                                                    <i className="bi bi-paperclip ms-1 text-muted small" title="Tiene adjuntos" />
                                                )}
                                            </td>
                                            <td className="small">{labelFor(DOCUMENT_TYPES, doc.tipo)}</td>
                                            <td className="small">{getRelacionLabel(doc)}</td>
                                            <td><code>{doc.version}</code></td>
                                            <td className="small">{getAutorName(doc)}</td>
                                            <td>
                                                <ScrumPill
                                                    label={labelFor(DOCUMENT_STATES, doc.estado)}
                                                    style={DOCUMENT_STATE_STYLES[doc.estado] || DOCUMENT_STATE_STYLES.borrador}
                                                />
                                            </td>
                                            <td className="small text-muted">{moment(doc.updatedAt).format('DD/MM/YY')}</td>
                                            <td className="text-nowrap">
                                                <Button variant="link" size="sm" className="p-0 me-2" title="PDF" onClick={() => exportPdf(doc)}>
                                                    <i className="bi bi-file-earmark-pdf" />
                                                </Button>
                                                {puedeGestionar && (
                                                    <>
                                                        <Button variant="link" size="sm" className="p-0 me-2" onClick={() => openEdit(doc)}>
                                                            <i className="bi bi-pencil" />
                                                        </Button>
                                                        <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => handleDelete(doc)}>
                                                            <i className="bi bi-trash" />
                                                        </Button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3}>
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Header className="bg-white fw-semibold small">Biblioteca rápida</Card.Header>
                        <Card.Body className="small p-0">
                            <ul className="list-group list-group-flush">
                                {LIBRARY_KEYS.map((key) => {
                                    const tipo = DOCUMENT_TYPES.find((t) => t.value === key);
                                    return (
                                        <li
                                            key={key}
                                            className="list-group-item d-flex justify-content-between align-items-center py-2"
                                            role="button"
                                            onClick={() => { setFilterTipo(key); setViewTab('todos'); }}
                                        >
                                            {tipo?.label || key}
                                            <span className="badge bg-light text-dark">{libraryCounts[key] || 0}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white fw-semibold small">Últimas actualizaciones</Card.Header>
                        <Card.Body className="small">
                            {recentUpdates.length === 0 ? (
                                <p className="text-muted mb-0">Sin actividad reciente.</p>
                            ) : (
                                recentUpdates.map((doc) => (
                                    <div key={doc.id} className="mb-2 pb-2 border-bottom">
                                        <Button variant="link" className="p-0 small fw-semibold" onClick={() => setViewDoc(doc)}>
                                            {doc.titulo}
                                        </Button>
                                        <div className="text-muted">
                                            {labelFor(DOCUMENT_TYPES, doc.tipo)} · v{doc.version}
                                            <br />
                                            {moment(doc.updatedAt).fromNow()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <DocumentFormModal
                show={showForm}
                onHide={() => { setShowForm(false); setEditingDoc(null); }}
                document={editingDoc}
                sprints={sprints}
                epics={epics}
                stories={stories}
                solicitudes={solicitudes}
                riesgos={riesgos}
                onSave={handleSave}
                onUploadAttachment={editingDoc?.id ? handleUploadAttachment : null}
                onRemoveAttachment={editingDoc?.id ? handleRemoveAttachment : null}
                onRestoreVersion={editingDoc?.id ? handleRestoreVersion : null}
                saving={saving}
                readOnly={!puedeGestionar}
            />

            <Modal show={Boolean(viewDoc)} onHide={() => { setViewDoc(null); setCommentText(''); }} size="lg" centered>
                {viewDoc && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title className="fs-6">{viewDoc.titulo}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="small text-muted mb-3">
                                {labelFor(DOCUMENT_TYPES, viewDoc.tipo)} · v{viewDoc.version} · {getAutorName(viewDoc)}
                                · {moment(viewDoc.updatedAt).format('DD/MM/YYYY HH:mm')}
                                · {getRelacionLabel(viewDoc)}
                            </div>
                            {viewDoc.descripcion && <p className="small">{viewDoc.descripcion}</p>}
                            <pre className="small bg-light p-3 rounded mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                                {viewDoc.contenido || '(Sin contenido)'}
                            </pre>

                            {(viewDoc.archivos || []).length > 0 && (
                                <div className="mb-3">
                                    <strong className="small">Archivos adjuntos</strong>
                                    <ListGroup className="mt-1">
                                        {(viewDoc.archivos || []).map((f) => (
                                            <ListGroup.Item key={f.id} className="d-flex justify-content-between align-items-center py-2 small">
                                                <span><i className="bi bi-paperclip me-1" />{f.nombre}</span>
                                                <Button size="sm" variant="outline-secondary" onClick={() => downloadAttachment(viewDoc, f.id)}>
                                                    Descargar
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            )}

                            <div>
                                <strong className="small">Comentarios ({(viewDoc.comentarios || []).length})</strong>
                                <ListGroup className="mt-2 mb-2">
                                    {(viewDoc.comentarios || []).length === 0 && (
                                        <ListGroup.Item className="small text-muted py-2">Sin comentarios.</ListGroup.Item>
                                    )}
                                    {(viewDoc.comentarios || []).map((c) => (
                                        <ListGroup.Item key={c.id} className="small py-2">
                                            <div>{c.texto}</div>
                                            <div className="text-muted">{moment(c.fecha).format('DD/MM/YYYY HH:mm')}</div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                                {puedeGestionar && (
                                    <InputGroup size="sm">
                                        <Form.Control
                                            placeholder="Agregar comentario..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                        />
                                        <Button variant="primary" disabled={commentSaving} onClick={handleAddComment}>
                                            {commentSaving ? '...' : 'Enviar'}
                                        </Button>
                                    </InputGroup>
                                )}
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-danger" size="sm" onClick={() => exportPdf(viewDoc)}>
                                <i className="bi bi-file-earmark-pdf me-1" /> Exportar PDF
                            </Button>
                            {puedeGestionar && (
                                <Button variant="outline-primary" size="sm" onClick={() => openEdit(viewDoc)}>
                                    <i className="bi bi-pencil me-1" /> Editar
                                </Button>
                            )}
                            <Button variant="secondary" size="sm" onClick={() => setViewDoc(null)}>Cerrar</Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </div>
    );
}
