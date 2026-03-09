import React, { useState } from 'react';
import { Form, Row, Col, ListGroup, Modal, Button } from 'react-bootstrap';

const InputBeneficiosEjecutado = ({ beneficiosList, setBeneficiosList, editMode, interesados = [] }) => {
    const [showModal, setShowModal] = useState(false);
    const [tempDate, setTempDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeSelection, setActiveSelection] = useState(null); // { objIndex, benIndex }

    const today = new Date().toISOString().split('T')[0];

    // ── Helpers ───────────────────────────────────────────────────────────────

    const getNombreDueno = (duenoId) => {
        if (!duenoId) return null;
        return interesados.find(i => String(i.id) === String(duenoId))?.nombre_interesado || null;
    };

    const handleDeleteObjetivo = (index) => {
        setBeneficiosList((beneficiosList || []).filter((_, i) => i !== index));
    };

    const handleDeleteBeneficio = (objIdx, benIdx) => {
        const updated = (beneficiosList || []).map((obj, i) => {
            if (i !== objIdx) return obj;
            return { ...obj, beneficios: (obj.beneficios || []).filter((_, j) => j !== benIdx) };
        });
        setBeneficiosList(updated);
    };

    const handleCheckboxClick = (objIndex, benIndex, yaCumplido) => {
        if (yaCumplido) {
            updateBeneficioStatus(objIndex, benIndex, false, null);
        } else {
            setActiveSelection({ objIndex, benIndex });
            setTempDate(today);
            setShowModal(true);
        }
    };

    const updateBeneficioStatus = (objIndex, benIndex, cumplido, fecha) => {
        const updated = (beneficiosList || []).map((obj, i) => {
            if (i !== objIndex) return obj;
            return {
                ...obj,
                beneficios: obj.beneficios.map((b, j) =>
                    j === benIndex ? { ...b, cumplido, fechaCumplimiento: fecha } : b
                ),
            };
        });
        setBeneficiosList(updated);
        setShowModal(false);
    };

    const handleConfirmFecha = () => {
        if (activeSelection) {
            updateBeneficioStatus(activeSelection.objIndex, activeSelection.benIndex, true, tempDate);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div>
            {!(beneficiosList || []).length && (
                <p className="text-muted fst-italic small">No hay beneficios definidos.</p>
            )}

            <ListGroup variant="flush">
                {(beneficiosList || []).map((objetivo, i) => {
                    const cumplidos = (objetivo.beneficios || []).filter(b => b.cumplido).length;
                    const total = (objetivo.beneficios || []).length;
                    const nombreDueno = getNombreDueno(objetivo.duenoId);

                    return (
                        <ListGroup.Item key={i} className="px-0 py-2" style={{ borderBottom: '1px solid #dee2e6' }}>

                            {/* Cabecera del objetivo — mismo look que planificación */}
                            <div
                                className="d-flex justify-content-between align-items-start px-2 py-2 rounded mb-2"
                                style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}
                            >
                                <div className="d-flex flex-column gap-1">
                                    <strong className="text-success">
                                        <i className="bi bi-bullseye me-2" />
                                        {objetivo.objetivoEstrategico}
                                    </strong>
                                    {nombreDueno && (
                                        <small className="text-muted ms-4">
                                            <i className="bi bi-person-fill me-1" />
                                            Dueño: <span className="fw-semibold">{nombreDueno}</span>
                                        </small>
                                    )}
                                    <small className="text-muted ms-4">
                                        <span className={cumplidos === total && total > 0 ? 'text-success fw-semibold' : ''}>
                                            {cumplidos}/{total} beneficio{total !== 1 ? 's' : ''} cumplido{cumplidos !== 1 ? 's' : ''}
                                        </span>
                                    </small>
                                </div>
                                {editMode && (
                                    <span
                                        className="bi bi-x-lg text-danger small"
                                        style={{ cursor: 'pointer', padding: '2px 4px' }}
                                        onClick={() => handleDeleteObjetivo(i)}
                                        title="Eliminar objetivo"
                                    />
                                )}
                            </div>

                            {/* Beneficios del objetivo */}
                            <div className="ms-3">
                                {(objetivo.beneficios || []).map((beneficio, j) => (
                                    <div
                                        key={j}
                                        className="d-flex justify-content-between align-items-start py-2 px-2"
                                        style={{ borderBottom: '1px solid #f0f0f0' }}
                                    >
                                        {/* Texto + fecha */}
                                        <div className="d-flex flex-column gap-1 flex-grow-1">
                                            <span
                                                className="small"
                                                style={{
                                                    textDecoration: beneficio.cumplido ? 'line-through' : 'none',
                                                    color: beneficio.cumplido ? '#6c757d' : '#212529',
                                                }}
                                            >
                                                <i className="bi bi-check2 me-1 text-secondary" />
                                                {beneficio.descripcion}
                                            </span>
                                            {beneficio.cumplido && beneficio.fechaCumplimiento && (
                                                <small className="text-success fw-bold ms-3" style={{ fontSize: '0.73rem' }}>
                                                    <i className="bi bi-calendar-check me-1" />
                                                    Cumplido el: {new Date(beneficio.fechaCumplimiento + 'T00:00:00').toLocaleDateString('es-ES')}
                                                </small>
                                            )}
                                        </div>

                                        {/* Checkbox + eliminar */}
                                        <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0">
                                            <Form.Check
                                                type="checkbox"
                                                checked={beneficio.cumplido || false}
                                                disabled={!editMode}
                                                onChange={() => handleCheckboxClick(i, j, beneficio.cumplido)}
                                                title={beneficio.cumplido ? 'Marcar como pendiente' : 'Marcar como cumplido'}
                                            />
                                            {editMode && (
                                                <span
                                                    className="bi bi-x-lg text-danger"
                                                    style={{ cursor: 'pointer', fontSize: '0.7rem' }}
                                                    onClick={() => handleDeleteBeneficio(i, j)}
                                                    title="Eliminar beneficio"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>

            {/* ── Modal fecha de cumplimiento ── */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="sm">
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: '1rem', fontWeight: 700 }}>
                        <i className="bi bi-calendar-check me-2 text-success" />
                        Registrar Cumplimiento
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="small mb-3">¿Cuándo se cumplió este beneficio?</p>
                    <Form.Group>
                        <Form.Label className="fw-bold small text-uppercase">Fecha de Cumplimiento</Form.Label>
                        <Form.Control
                            type="date"
                            max={today}
                            value={tempDate}
                            onChange={e => setTempDate(e.target.value)}
                            size="sm"
                        />
                        <Form.Text className="text-muted">
                            La fecha no puede ser posterior a hoy.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="success" size="sm" onClick={handleConfirmFecha}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InputBeneficiosEjecutado;