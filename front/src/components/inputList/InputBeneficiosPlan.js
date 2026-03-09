import React, { useState } from 'react';
import { Button, Form, InputGroup, ListGroup, Row, Col, Dropdown, ButtonGroup } from 'react-bootstrap';
import moment from 'moment';

// ── Dropdown de dueño ─────────────────────────────────────────────────────────
const DuenoDropdown = ({ interesados, value, onChange, disabled }) => {
    const seleccionado = interesados.find(i => String(i.id) === String(value));
    const label = seleccionado?.nombre_interesado || "Asignar dueño";
    return (
        <Dropdown as={ButtonGroup} onSelect={disabled ? null : onChange} className="w-100">
            <Dropdown.Toggle variant="outline-secondary" size="sm" disabled={disabled}
                style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <i className="bi bi-person me-1" />{label}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item eventKey=""><span className="text-muted fst-italic">Sin dueño</span></Dropdown.Item>
                <Dropdown.Divider />
                {interesados.length === 0
                    ? <Dropdown.Item disabled>No hay interesados definidos</Dropdown.Item>
                    : interesados.map(i => (
                        <Dropdown.Item key={i.id} eventKey={String(i.id)}>{i.nombre_interesado}</Dropdown.Item>
                    ))
                }
            </Dropdown.Menu>
        </Dropdown>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────
const InputBeneficiosPlan = ({ beneficiosList, setBeneficiosList, disabled, interesados = [] }) => {
    const [newObjetivo, setNewObjetivo] = useState('');
    const [newDuenoId, setNewDuenoId] = useState('');
    const [newBeneficio, setNewBeneficio] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const [selectedObjetivoIndex, setSelectedObjetivoIndex] = useState(null);

    const handleAddObjetivo = () => {
        if (!newObjetivo.trim()) return;
        setBeneficiosList([...(beneficiosList || []), {
            objetivoEstrategico: newObjetivo.trim(),
            duenoId: newDuenoId || null,
            beneficios: [],
        }]);
        setNewObjetivo(''); setNewDuenoId('');
    };

    const handleDeleteObjetivo = (index) => {
        setBeneficiosList((beneficiosList || []).filter((_, i) => i !== index));
        if (index === selectedObjetivoIndex) setSelectedObjetivoIndex(null);
        else if (index < selectedObjetivoIndex) setSelectedObjetivoIndex(selectedObjetivoIndex - 1);
    };

    const handleAddBeneficio = () => {
        if (selectedObjetivoIndex === null || !newBeneficio.trim()) return;
        setBeneficiosList((beneficiosList || []).map((obj, i) => {
            if (i !== selectedObjetivoIndex) return obj;
            return {
                ...obj,
                beneficios: [...(obj.beneficios || []), {
                    descripcion: newBeneficio.trim(),
                    deadline: newDeadline || null,
                    cumplido: false,
                    fechaCumplimiento: null,
                }],
            };
        }));
        setNewBeneficio(''); setNewDeadline('');
    };

    const handleDeleteBeneficio = (objIdx, benIdx) => {
        setBeneficiosList((beneficiosList || []).map((obj, i) => {
            if (i !== objIdx) return obj;
            return { ...obj, beneficios: (obj.beneficios || []).filter((_, j) => j !== benIdx) };
        }));
    };

    const handleDeadlineChange = (objIdx, benIdx, value) => {
        setBeneficiosList((beneficiosList || []).map((obj, i) => {
            if (i !== objIdx) return obj;
            return {
                ...obj,
                beneficios: obj.beneficios.map((b, j) =>
                    j === benIdx ? { ...b, deadline: value || null } : b
                ),
            };
        }));
    };

    const getNombreDueno = (id) =>
        interesados.find(i => String(i.id) === String(id))?.nombre_interesado || null;

    const disableBeneficioInput = selectedObjetivoIndex === null || disabled;

    return (
        <div>
            {/* ── Paso 1 ── */}
            <Form.Label className="fw-bold small text-uppercase">1. Crear Objetivo Estratégico</Form.Label>
            <Row className="mb-3 g-2 align-items-end">
                <Col md={8}>
                    <Form.Control disabled={disabled} size="sm" type="text"
                        placeholder="Ej: Mejorar Eficiencia Operacional"
                        value={newObjetivo}
                        onChange={e => setNewObjetivo(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAddObjetivo()} />
                </Col>
                <Col md={2}>
                    <DuenoDropdown interesados={interesados} value={newDuenoId}
                        onChange={setNewDuenoId} disabled={disabled} />
                </Col>
                <Col md={2}>
                    <Button size="sm" className="w-100"
                        disabled={disabled || !newObjetivo.trim()} onClick={handleAddObjetivo}>
                        <i className="bi bi-plus-lg me-1" />Agregar Objetivo
                    </Button>
                </Col>
            </Row>

            {/* ── Paso 2 ── */}
            <Form.Label className="fw-bold small text-uppercase">
                2. Añadir Beneficio Medible
                {selectedObjetivoIndex !== null && (
                    <span className="text-success fw-normal ms-2 text-lowercase">
                        — en: {(beneficiosList || [])[selectedObjetivoIndex]?.objetivoEstrategico}
                    </span>
                )}
            </Form.Label>
            <Row className="mb-1 g-2 align-items-end">
                <Col md={8}>
                    <Form.Control disabled={disableBeneficioInput} size="sm" type="text"
                        placeholder={selectedObjetivoIndex !== null
                            ? "Ej: Reducción del 15% de costos"
                            : "Seleccioná un objetivo de la lista primero"}
                        value={newBeneficio}
                        onChange={e => setNewBeneficio(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAddBeneficio()} />
                </Col>
                <Col md={2}>
                    <Form.Control disabled={disableBeneficioInput} size="sm" type="date"
                        value={newDeadline} onChange={e => setNewDeadline(e.target.value)}
                        title="Fecha límite para este beneficio" />
                </Col>
                <Col md={2}>
                    <Button size="sm" className="w-100"
                        disabled={disableBeneficioInput || !newBeneficio.trim()} onClick={handleAddBeneficio}>
                        <i className="bi bi-plus-lg me-1" />Agregar
                    </Button>
                </Col>
            </Row>
            {selectedObjetivoIndex === null && (
                <Form.Text className="text-danger d-block mb-3">
                    Seleccioná un Objetivo de la lista para poder agregar beneficios.
                </Form.Text>
            )}

            {/* ── Paso 3: Listado ── */}
            <Form.Label className="fw-bold small text-uppercase mt-3">3. Objetivos y sus Beneficios</Form.Label>
            {!(beneficiosList || []).length ? (
                <p className="text-muted fst-italic small">Aún no hay objetivos. Usá la sección de arriba para empezar.</p>
            ) : (
                <ListGroup variant="flush">
                    {(beneficiosList || []).map((objetivo, i) => {
                        const isSelected = i === selectedObjetivoIndex;
                        const nombreDueno = getNombreDueno(objetivo.duenoId);
                        return (
                            <ListGroup.Item key={i} className="px-0 py-2" style={{ borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                                onClick={() => setSelectedObjetivoIndex(i)}>
                                <div className="d-flex justify-content-between align-items-start px-2 py-2 rounded"
                                    style={{
                                        backgroundColor: isSelected ? '#e6ffe6' : '#f8f9fa',
                                        border: isSelected ? '1px solid #00c000' : '1px solid #e9ecef',
                                        transition: 'background-color 0.15s',
                                    }}>
                                    <div className="d-flex flex-column gap-1">
                                        <strong className={isSelected ? 'text-success' : 'text-dark'}>
                                            <i className="bi bi-bullseye me-2" />{objetivo.objetivoEstrategico}
                                        </strong>
                                        {nombreDueno && (
                                            <small className="text-muted ms-4">
                                                <i className="bi bi-person-fill me-1" />
                                                Dueño: <span className="fw-semibold">{nombreDueno}</span>
                                            </small>
                                        )}
                                        <small className="text-muted ms-4">
                                            {(objetivo.beneficios || []).length} beneficio{(objetivo.beneficios || []).length !== 1 ? 's' : ''}
                                        </small>
                                    </div>
                                    {!disabled && (
                                        <span className="bi bi-x-lg text-danger small"
                                            style={{ cursor: 'pointer', padding: '2px 4px' }}
                                            onClick={e => { e.stopPropagation(); handleDeleteObjetivo(i); }} />
                                    )}
                                </div>

                                {(objetivo.beneficios || []).length > 0 && (
                                    <div className="ms-3 mt-1">
                                        <Row className="fw-bold border-bottom pb-1 mb-1 text-muted" style={{ fontSize: '0.75rem' }}>
                                            <Col xs={6}>BENEFICIO</Col>
                                            <Col xs={4} className="text-center">FECHA LÍMITE</Col>
                                            <Col xs={2} />
                                        </Row>
                                        {(objetivo.beneficios || []).map((beneficio, j) => (
                                            <Row key={j} className="align-items-center py-1 px-1"
                                                style={{ borderBottom: '1px solid #f0f0f0' }}
                                                onClick={e => e.stopPropagation()}>
                                                <Col xs={6}>
                                                    <span className="text-muted small">
                                                        <i className="bi bi-check2 me-1 text-secondary" />
                                                        {beneficio.descripcion}
                                                    </span>
                                                </Col>
                                                <Col xs={4} className="text-center">
                                                    {!disabled ? (
                                                        <Form.Control size="sm" type="date"
                                                            value={beneficio.deadline || ''}
                                                            onChange={e => handleDeadlineChange(i, j, e.target.value)}
                                                            style={{ fontSize: '0.75rem', padding: '1px 4px' }}
                                                            onClick={e => e.stopPropagation()} />
                                                    ) : (
                                                        <small style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6c757d' }}>
                                                            {beneficio.deadline ? moment(beneficio.deadline).format('DD/MM/YYYY') : <span className="fst-italic">Sin fecha</span>}
                                                        </small>
                                                    )}
                                                </Col>
                                                <Col xs={2} className="text-end">
                                                    {!disabled && (
                                                        <span className="bi bi-x-lg text-danger"
                                                            style={{ cursor: 'pointer', fontSize: '0.7rem' }}
                                                            onClick={() => handleDeleteBeneficio(i, j)} />
                                                    )}
                                                </Col>
                                            </Row>
                                        ))}
                                    </div>
                                )}
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            )}
        </div>
    );
};

export default InputBeneficiosPlan;