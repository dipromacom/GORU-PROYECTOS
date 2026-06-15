import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import LoaderButton from '../loaderButton/LoaderButton';
import { emptySprint } from './scrumConstants';
import { getUsuarioLabel, normalizeUsuariosProyecto } from './scrumHelpers';

export default function SprintFormModal({
    show,
    onHide,
    sprint,
    usuarios,
    onSave,
    saving,
    readOnly,
}) {
    const [form, setForm] = useState(emptySprint());
    const usuariosLista = useMemo(() => normalizeUsuariosProyecto(usuarios), [usuarios]);

    useEffect(() => {
        if (sprint) {
            setForm({
                ...emptySprint(),
                ...sprint,
                scrum_master_id: sprint.scrum_master_id || '',
                product_owner_id: sprint.product_owner_id || '',
                fecha_inicio: sprint.fecha_inicio ? sprint.fecha_inicio.substring(0, 10) : '',
                fecha_fin: sprint.fecha_fin ? sprint.fecha_fin.substring(0, 10) : '',
                capacidad_puntos: sprint.capacidad_puntos ?? 40,
            });
        } else {
            setForm(emptySprint());
        }
    }, [sprint, show]);

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            capacidad_puntos: parseInt(form.capacidad_puntos, 10) || 0,
            scrum_master_id: form.scrum_master_id ? parseInt(form.scrum_master_id, 10) : null,
            product_owner_id: form.product_owner_id ? parseInt(form.product_owner_id, 10) : null,
            fecha_inicio: form.fecha_inicio || null,
            fecha_fin: form.fecha_fin || null,
        });
    };

    const locked = readOnly || (sprint && sprint.estado !== 'planificado');

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{sprint ? `Editar ${sprint.codigo || sprint.nombre}` : 'Nuevo sprint'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={8}>
                            <Form.Group>
                                <Form.Label>Nombre del sprint *</Form.Label>
                                <Form.Control
                                    required
                                    disabled={locked}
                                    value={form.nombre}
                                    onChange={(e) => set('nombre', e.target.value)}
                                    placeholder="Sprint 1"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Capacidad (puntos)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={0}
                                    disabled={locked}
                                    value={form.capacidad_puntos}
                                    onChange={(e) => set('capacidad_puntos', e.target.value)}
                                />
                                <Form.Text className="text-muted" style={{ fontSize: 11 }}>
                                    Sugerencia: <em>miembros × días hábiles × horas/día ÷ horas por punto (ej. 4×10×6÷6=40)</em>
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label>Objetivo del sprint</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            disabled={readOnly}
                            value={form.objetivo}
                            onChange={(e) => set('objetivo', e.target.value)}
                            placeholder="¿Qué queremos lograr en este sprint?"
                        />
                    </Form.Group>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Fecha inicio</Form.Label>
                                <Form.Control
                                    type="date"
                                    disabled={locked}
                                    value={form.fecha_inicio}
                                    onChange={(e) => set('fecha_inicio', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Fecha fin</Form.Label>
                                <Form.Control
                                    type="date"
                                    disabled={locked}
                                    value={form.fecha_fin}
                                    onChange={(e) => set('fecha_fin', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Product Owner</Form.Label>
                                <Form.Control
                                    as="select"
                                    disabled={locked}
                                    value={form.product_owner_id}
                                    onChange={(e) => set('product_owner_id', e.target.value)}
                                >
                                    <option value="">—</option>
                                    {usuariosLista.map((u) => (
                                        <option key={u.usuario_id} value={u.usuario_id}>{getUsuarioLabel(u)}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Scrum Master</Form.Label>
                                <Form.Control
                                    as="select"
                                    disabled={locked}
                                    value={form.scrum_master_id}
                                    onChange={(e) => set('scrum_master_id', e.target.value)}
                                >
                                    <option value="">—</option>
                                    {usuariosLista.map((u) => (
                                        <option key={u.usuario_id} value={u.usuario_id}>{getUsuarioLabel(u)}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    {!readOnly && (
                        <LoaderButton type="submit" className="btn-primary" isLoading={saving}>
                            Guardar
                        </LoaderButton>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
