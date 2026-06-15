import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import LoaderButton from '../loaderButton/LoaderButton';
import { emptyEpic, EPIC_STATES, PRIORITIES, BUSINESS_VALUES } from './scrumConstants';
import { getUsuarioLabel, normalizeUsuariosProyecto } from './scrumHelpers';

export default function EpicFormModal({
    show,
    onHide,
    epic,
    usuarios,
    onSave,
    saving,
    readOnly,
}) {
    const [form, setForm] = useState(emptyEpic());
    const usuariosLista = useMemo(() => normalizeUsuariosProyecto(usuarios), [usuarios]);

    useEffect(() => {
        if (epic) {
            setForm({
                ...emptyEpic(),
                ...epic,
                responsable_id: epic.responsable_id || '',
                fecha_objetivo: epic.fecha_objetivo ? epic.fecha_objetivo.substring(0, 10) : '',
            });
        } else {
            setForm(emptyEpic());
        }
    }, [epic, show]);

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            responsable_id: form.responsable_id ? parseInt(form.responsable_id, 10) : null,
            fecha_objetivo: form.fecha_objetivo || null,
        });
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{epic ? `Editar ${epic.codigo || 'épica'}` : 'Nueva épica'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={8}>
                            <Form.Group>
                                <Form.Label>Nombre *</Form.Label>
                                <Form.Control
                                    required
                                    disabled={readOnly}
                                    value={form.nombre}
                                    onChange={(e) => set('nombre', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Estado</Form.Label>
                                <Form.Control
                                    as="select"
                                    disabled={readOnly}
                                    value={form.estado}
                                    onChange={(e) => set('estado', e.target.value)}
                                >
                                    {EPIC_STATES.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            disabled={readOnly}
                            value={form.descripcion}
                            onChange={(e) => set('descripcion', e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Objetivo estratégico</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            disabled={readOnly}
                            value={form.objetivo_estrategico}
                            onChange={(e) => set('objetivo_estrategico', e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Beneficio esperado</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            disabled={readOnly}
                            value={form.beneficio_esperado}
                            onChange={(e) => set('beneficio_esperado', e.target.value)}
                        />
                    </Form.Group>
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Prioridad</Form.Label>
                                <Form.Control
                                    as="select"
                                    disabled={readOnly}
                                    value={form.prioridad}
                                    onChange={(e) => set('prioridad', e.target.value)}
                                >
                                    <option value="">—</option>
                                    {PRIORITIES.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Valor de negocio</Form.Label>
                                <Form.Control
                                    as="select"
                                    disabled={readOnly}
                                    value={form.valor_negocio}
                                    onChange={(e) => set('valor_negocio', e.target.value)}
                                >
                                    <option value="">—</option>
                                    {BUSINESS_VALUES.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Fecha objetivo</Form.Label>
                                <Form.Control
                                    type="date"
                                    disabled={readOnly}
                                    value={form.fecha_objetivo}
                                    onChange={(e) => set('fecha_objetivo', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Responsable</Form.Label>
                                <Form.Control
                                    as="select"
                                    disabled={readOnly}
                                    value={form.responsable_id}
                                    onChange={(e) => set('responsable_id', e.target.value)}
                                >
                                    <option value="">—</option>
                                    {usuariosLista.map((u) => (
                                        <option key={u.usuario_id} value={u.usuario_id}>
                                            {getUsuarioLabel(u)}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Entregable vinculado (híbrido)</Form.Label>
                                <Form.Control
                                    disabled={readOnly}
                                    value={form.entregable_ref}
                                    onChange={(e) => set('entregable_ref', e.target.value)}
                                    placeholder="Referencia a entregable del alcance"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Comentado por solicitud del usuario (se maneja centralizado en módulo de riesgos)
                    <Form.Group>
                        <Form.Label>Riesgos asociados</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            disabled={readOnly}
                            value={form.riesgos_asociados}
                            onChange={(e) => set('riesgos_asociados', e.target.value)}
                        />
                    </Form.Group>
                    */}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    {!readOnly && (
                        <LoaderButton type="submit" className="btn-primary" isLoading={saving}>
                            Guardar épica
                        </LoaderButton>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
