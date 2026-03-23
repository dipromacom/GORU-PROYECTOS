import React, { useState } from 'react';
import { Form, Row, Col, ListGroup, Modal, Button } from 'react-bootstrap';
import moment from 'moment';

const InputBeneficiosEjecutado = ({ beneficiosList, setBeneficiosList, editMode, interesados = [] }) => {
    const [showModal, setShowModal] = useState(false);
    const [tempDate, setTempDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeSelection, setActiveSelection] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    const getNombreDueno = (id) =>
        interesados.find(i => String(i.id) === String(id))?.nombre_interesado || null;

    const handleDeleteObjetivo = (index) =>
        setBeneficiosList((beneficiosList || []).filter((_, i) => i !== index));

    const handleDeleteBeneficio = (objIdx, benIdx) => {
        setBeneficiosList((beneficiosList || []).map((obj, i) => {
            if (i !== objIdx) return obj;
            return { ...obj, beneficios: (obj.beneficios || []).filter((_, j) => j !== benIdx) };
        }));
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
        setBeneficiosList((beneficiosList || []).map((obj, i) => {
            if (i !== objIndex) return obj;
            return {
                ...obj,
                beneficios: obj.beneficios.map((b, j) =>
                    j === benIndex ? { ...b, cumplido, fechaCumplimiento: fecha } : b
                ),
            };
        }));
        setShowModal(false);
    };

    const handleConfirmFecha = () => {
        if (activeSelection) {
            updateBeneficioStatus(activeSelection.objIndex, activeSelection.benIndex, true, tempDate);
        }
    };

    return (
        <div>
            {!(beneficiosList || []).length && (
                <p className="text-muted fst-italic small">No hay beneficios definidos.</p>
            )}

            <ListGroup variant="flush">
                {(beneficiosList || []).map((objetivo, i) => {
                    const beneficios = objetivo.beneficios || [];
                    const cumplidos = beneficios.filter(b => b.cumplido).length;
                    const total = beneficios.length;
                    const nombreDueno = getNombreDueno(objetivo.duenoId);
                    const todoCumplido = total > 0 && cumplidos === total;

                    return (
                        <ListGroup.Item key={i} className="px-0 py-2" style={{ borderBottom: '1px solid #dee2e6' }}>
                            {/* Cabecera objetivo */}
                            <div className="d-flex justify-content-between align-items-start px-2 py-2 rounded mb-2"
                                style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                                <div className="d-flex flex-column gap-1">
                                    <strong className="text-success">
                                        <i className="bi bi-bullseye me-2" />{objetivo.objetivoEstrategico}
                                    </strong>
                                    {nombreDueno && (
                                        <small className="text-muted ms-4">
                                            <i className="bi bi-person-fill me-1" />
                                            Dueño: <span className="fw-semibold">{nombreDueno}</span>
                                        </small>
                                    )}
                                    <small className={`ms-4 ${todoCumplido ? 'text-success fw-semibold' : 'text-muted'}`}>
                                        {cumplidos}/{total} beneficio{total !== 1 ? 's' : ''} cumplido{cumplidos !== 1 ? 's' : ''}
                                    </small>
                                </div>
                                {editMode && (
                                    <span className="bi bi-x-lg text-danger small"
                                        style={{ cursor: 'pointer', padding: '2px 4px' }}
                                        onClick={() => handleDeleteObjetivo(i)} />
                                )}
                            </div>

                            {/* Header columnas beneficios */}
                            {beneficios.length > 0 && (
                                <div className="ms-3">
                                    <Row className="fw-bold border-bottom pb-1 mb-1 text-muted" style={{ fontSize: '0.75rem' }}>
                                        <Col xs={5}>BENEFICIO</Col>
                                        <Col xs={3} className="text-center">FECHA LÍMITE</Col>
                                        <Col xs={3} className="text-center">CUMPLIMIENTO</Col>
                                        <Col xs={1} />
                                    </Row>

                                    {beneficios.map((beneficio, j) => {
                                        // Semáforo: vencido y no cumplido = rojo
                                        const vencido = beneficio.deadline && !beneficio.cumplido && beneficio.deadline < today;

                                        return (
                                            <Row key={j} className="align-items-start py-2 px-1"
                                                style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                {/* Descripción */}
                                                <Col xs={5}>
                                                    <span className="small" style={{
                                                        textDecoration: beneficio.cumplido ? 'line-through' : 'none',
                                                        color: beneficio.cumplido ? '#6c757d' : '#212529',
                                                    }}>
                                                        <i className="bi bi-check2 me-1 text-secondary" />
                                                        {beneficio.descripcion}
                                                    </span>
                                                </Col>

                                                {/* Fecha límite con semáforo */}
                                                <Col xs={3} className="text-center">
                                                    {beneficio.deadline ? (
                                                        <small style={{
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.75rem',
                                                            color: beneficio.cumplido ? '#6c757d' : vencido ? '#dc3545' : '#212529',
                                                            fontWeight: vencido ? '700' : 'normal',
                                                        }}>
                                                            {vencido && <i className="bi bi-exclamation-triangle-fill me-1" />}
                                                            {moment(beneficio.deadline).format('DD/MM/YYYY')}
                                                        </small>
                                                    ) : (
                                                        <small className="text-muted fst-italic" style={{ fontSize: '0.72rem' }}>Sin fecha</small>
                                                    )}
                                                </Col>

                                                {/* Fecha de cumplimiento real */}
                                                <Col xs={3} className="text-center">
                                                    {beneficio.cumplido && beneficio.fechaCumplimiento ? (
                                                        <small className="text-success fw-bold" style={{ fontSize: '0.73rem' }}>
                                                            <i className="bi bi-calendar-check me-1" />
                                                            {moment(beneficio.fechaCumplimiento + 'T00:00:00').format('DD/MM/YYYY')}
                                                        </small>
                                                    ) : (
                                                        <span className="text-muted small">—</span>
                                                    )}
                                                </Col>

                                                {/* Checkbox + eliminar */}
                                                <Col xs={1} className="d-flex align-items-center justify-content-end gap-2">
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={beneficio.cumplido || false}
                                                        disabled={!editMode}
                                                        onChange={() => handleCheckboxClick(i, j, beneficio.cumplido)}
                                                        title={beneficio.cumplido ? 'Marcar como pendiente' : 'Marcar como cumplido'}
                                                    />
                                                    {editMode && (
                                                        <span className="bi bi-x-lg text-danger"
                                                            style={{ cursor: 'pointer', fontSize: '0.65rem' }}
                                                            onClick={() => handleDeleteBeneficio(i, j)} />
                                                    )}
                                                </Col>
                                            </Row>
                                        );
                                    })}
                                </div>
                            )}
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>

            {/* Modal fecha de cumplimiento */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="sm">
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: '1rem', fontWeight: 700 }}>
                        <i className="bi bi-calendar-check me-2 text-success" />Registrar Cumplimiento
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="small mb-3">¿Cuándo se cumplió este beneficio?</p>
                    <Form.Group>
                        <Form.Label className="fw-bold small text-uppercase">Fecha de Cumplimiento</Form.Label>
                        <Form.Control type="date" size="sm" max={today}
                            value={tempDate} onChange={e => setTempDate(e.target.value)} />
                        <Form.Text className="text-muted">La fecha no puede ser posterior a hoy.</Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="success" size="sm" onClick={handleConfirmFecha}>Confirmar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InputBeneficiosEjecutado;