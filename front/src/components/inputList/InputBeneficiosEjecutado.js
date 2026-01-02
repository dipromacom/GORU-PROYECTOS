import React, { useState } from 'react';
import { ListGroup, Form, Row, Col, Modal, Button } from 'react-bootstrap';

const InputBeneficiosEjecutado = ({ beneficiosList, setBeneficiosList, editMode }) => {
    // Estados para el Modal
    const [showModal, setShowModal] = useState(false);
    const [tempDate, setTempDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeSelection, setActiveSelection] = useState(null); // { objIndex, benIndex }

    // Fecha máxima (hoy) para el input date
    const today = new Date().toISOString().split('T')[0];

    const handleDeleteObjetivo = (index) => {
        // Aseguramos el fallback array aquí también para robustez (aunque en Ejecución debería estar lleno)
        setBeneficiosList((beneficiosList || []).filter((_, i) => i !== index));
    };

    const handleDeleteBeneficio = (objetivoIndex, beneficioIndex) => {
        const updatedList = (beneficiosList || []).map((objetivo, i) => {
            if (i === objetivoIndex) {
                return {
                    ...objetivo,
                    beneficios: (objetivo.beneficios || []).filter((_, j) => j !== beneficioIndex)
                };
            }
            return objetivo;
        });
        setBeneficiosList(updatedList);
    };

    // Abre el modal o desmarca el beneficio directamente
    const handleCheckboxClick = (objIndex, benIndex, yaCumplido) => {
        if (!yaCumplido) {
            // Si lo va a marcar como cumplido, abrimos modal
            setActiveSelection({ objIndex, benIndex });
            setTempDate(today); // Reset a hoy
            setShowModal(true);
        } else {
            // Si lo va a desmarcar, lo hacemos directamente
            updateBeneficioStatus(objIndex, benIndex, false, null);
        }
    };

    // Función central para actualizar el estado del beneficio
    const updateBeneficioStatus = (objIndex, benIndex, cumplido, fecha) => {
        const updatedList = (beneficiosList || []).map((objetivo, i) => {
            if (i === objIndex) {
                const updatedBen = objetivo.beneficios.map((ben, j) => {
                    if (j === benIndex) {
                        return { ...ben, cumplido, fechaCumplimiento: fecha };
                    }
                    return ben;
                });
                return { ...objetivo, beneficios: updatedBen };
            }
            return objetivo;
        });

        setBeneficiosList(updatedList);
        setShowModal(false);
    };

    const handleConfirmFecha = () => {
        if (activeSelection) {
            updateBeneficioStatus(activeSelection.objIndex, activeSelection.benIndex, true, tempDate);
        }
    };

    const getObjetivoStyle = () => ({
        padding: '8px 10px',
        marginBottom: '12px',
        borderRadius: '5px',
        border: '1px solid #e9ecef',
    });

    // --- Renderizado ---

    return (
        <div className="input-beneficios-ejecutado-container">
            {!(beneficiosList || []).length && (
                <p className="text-muted fst-italic">No hay beneficios definidos.</p>
            )}

            <ListGroup variant="flush">
                {(beneficiosList || []).map((objetivo, i) => (
                    // Usamos el nuevo estilo basado en un div contenedor
                    <div key={i} style={getObjetivoStyle()}>
                        <Row className="align-items-center mb-1">
                            <Col xs={11}>
                                {/* Usamos el color de éxito para destacar el objetivo */}
                                <strong className="text-success">{objetivo.objetivoEstrategico}</strong>
                            </Col>
                            <Col xs={1} className="text-end">
                                {editMode && (
                                    <span className="bi bi-x-lg delete-btn text-danger" onClick={() => handleDeleteObjetivo(i)}></span>
                                )}
                            </Col>
                        </Row>

                        {/* Lista de Beneficios Tangibles */}
                        <ListGroup variant="flush" className="mt-2 ms-3">
                            {(objetivo.beneficios || []).map((beneficio, j) => (
                                <ListGroup.Item key={j} className="py-2 px-0 border-0">
                                    <Row className="align-items-center">
                                        <Col xs={8} md={9}>
                                            <div className="d-flex flex-column">
                                                <span
                                                    className="small"
                                                    style={{
                                                        textDecoration: beneficio.cumplido ? 'line-through' : 'none',
                                                        color: beneficio.cumplido ? '#6c757d' : '#212529'
                                                    }}
                                                >
                                                    • {beneficio.descripcion}
                                                </span>
                                                {/* MOSTRAR FECHA SI ESTÁ CUMPLIDO */}
                                                {beneficio.cumplido && beneficio.fechaCumplimiento && (
                                                    <small className="text-success fw-bold ms-3" style={{ fontSize: '0.75rem' }}>
                                                        <i className="bi bi-calendar-check me-1"></i>
                                                        Cumplido el: {new Date(beneficio.fechaCumplimiento).toLocaleDateString()}
                                                    </small>
                                                )}
                                            </div>
                                        </Col>

                                        <Col xs={4} md={3} className="text-end d-flex align-items-center justify-content-end">
                                            <Form.Check
                                                type="checkbox"
                                                checked={beneficio.cumplido || false}
                                                disabled={!editMode}
                                                onChange={() => handleCheckboxClick(i, j, beneficio.cumplido)}
                                                inline
                                                className="me-3"
                                            />
                                            {editMode && (
                                                <span className="bi bi-x-lg delete-btn text-danger small" onClick={() => handleDeleteBeneficio(i, j)}></span>
                                            )}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                ))}
            </ListGroup>

            {/* MODAL PARA FECHA DE CUMPLIMIENTO */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="bg-success text-white">
                    <Modal.Title>Registrar Cumplimiento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Cuándo se cumplió este beneficio?</p>
                    <Form.Group>
                        <Form.Label className="fw-bold">Fecha de Cumplimiento</Form.Label>
                        <Form.Control
                            type="date"
                            max={today}
                            value={tempDate}
                            onChange={(e) => setTempDate(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            La fecha no puede ser posterior a hoy.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleConfirmFecha}>
                        Confirmar Cumplimiento
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InputBeneficiosEjecutado;