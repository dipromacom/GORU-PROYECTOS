import React, { useState } from 'react';
import { Button, Form, InputGroup, ListGroup, Row, Col, Card } from 'react-bootstrap';

const InputBeneficiosPlan = ({ beneficiosList, setBeneficiosList, disabled }) => {
    const [newObjetivo, setNewObjetivo] = useState('');
    const [newBeneficio, setNewBeneficio] = useState('');
    const [selectedObjetivoIndex, setSelectedObjetivoIndex] = useState(null);

    // --- Lógica de Manejo de Estado (Funcionalidad Conservada) ---

    const handleAddObjetivo = () => {
        if (newObjetivo.trim() === '') return;

        const newEntry = {
            objetivoEstrategico: newObjetivo.trim(),
            beneficios: []
        };
        // Corrección de "is not iterable" aplicada aquí:
        setBeneficiosList([...(beneficiosList || []), newEntry]);
        setNewObjetivo('');
    };

    const handleDeleteObjetivo = (index) => {
        setBeneficiosList((beneficiosList || []).filter((_, i) => i !== index));

        if (index === selectedObjetivoIndex) {
            setSelectedObjetivoIndex(null);
        } else if (index < selectedObjetivoIndex) {
            setSelectedObjetivoIndex(selectedObjetivoIndex - 1);
        }
    };

    const handleAddBeneficio = () => {
        if (selectedObjetivoIndex === null || newBeneficio.trim() === '') return;

        const listToMap = beneficiosList || [];
        const updatedList = listToMap.map((objetivo, i) => {
            if (i === selectedObjetivoIndex) {
                const newBeneficioItem = {
                    descripcion: newBeneficio.trim(),
                    cumplido: false
                };
                return {
                    ...objetivo,
                    beneficios: [...(objetivo.beneficios || []), newBeneficioItem]
                };
            }
            return objetivo;
        });

        setBeneficiosList(updatedList);
        setNewBeneficio('');
    };

    const handleDeleteBeneficio = (objetivoIndex, beneficioIndex) => {
        const listToMap = beneficiosList || [];
        const updatedList = listToMap.map((objetivo, i) => {
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

    const disableBeneficioInput = selectedObjetivoIndex === null || disabled;

    // --- Estilos para el Objetivo Seleccionado (Punto 2) ---
    const getObjetivoStyle = (i) => ({
        cursor: 'pointer',
        padding: '8px 10px',
        marginBottom: '4px',
        borderRadius: '5px',
        transition: 'background-color 0.2s',
        // Estilo personalizado para el seleccionado (color verde claro/gris)
        backgroundColor: i === selectedObjetivoIndex ? '#e6ffe6' : 'transparent', // Verde claro
        border: i === selectedObjetivoIndex ? '1px solid #00c000' : '1px solid #e9ecef', // Borde verde
    });


    // --- Estructura de Diseño (Punto 1) ---

    return (
        <div className="input-beneficios-plan-container">
            <Row className="mb-4">
                {/* Columna 1: Input para Nuevo Objetivo Estratégico */}
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="fw-bold">1. Crear Objetivo Estratégico</Form.Label>
                        <InputGroup>
                            <Form.Control
                                disabled={disabled}
                                type="text"
                                placeholder="Ej: Mejorar Eficiencia Operacional"
                                value={newObjetivo}
                                onChange={(e) => setNewObjetivo(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddObjetivo()}
                            />
                            <Button
                                disabled={disabled || newObjetivo.trim() === ''}
                                onClick={handleAddObjetivo}
                            >
                                + Objetivo
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </Col>

                {/* Columna 2: Input para Nuevo Beneficio Tangible */}
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="fw-bold">2. Añadir Beneficio Medible</Form.Label>
                        <InputGroup>
                            <Form.Control
                                disabled={disableBeneficioInput}
                                type="text"
                                placeholder={selectedObjetivoIndex !== null ? "Ej: Reducción del 15% de costos" : "Seleccione un Objetivo (paso 3)"}
                                value={newBeneficio}
                                onChange={(e) => setNewBeneficio(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddBeneficio()}
                            />
                            <Button
                                disabled={disableBeneficioInput || newBeneficio.trim() === ''}
                                onClick={handleAddBeneficio}
                            >
                                + Beneficio
                            </Button>
                        </InputGroup>
                        {selectedObjetivoIndex === null && (
                            <Form.Text className="text-danger">
                                Seleccione un Objetivo para poder agregar Beneficios.
                            </Form.Text>
                        )}
                    </Form.Group>
                </Col>
            </Row>

            <Form.Label className="fw-bold">3. Listado de Objetivos y Beneficios:</Form.Label>

            {/* Lista de Objetivos Estratégicos y Beneficios */}
            <Row>
                <Col>
                    {!(beneficiosList || []).length && (
                        <p className="text-muted fst-italic">Aún no hay objetivos definidos. Use la sección "Crear Objetivo" para empezar.</p>
                    )}

                    <ListGroup variant="flush">
                        {(beneficiosList || []).map((objetivo, i) => (
                            // Usamos un div para aplicar el estilo personalizado (Punto 2)
                            <div
                                key={i}
                                style={getObjetivoStyle(i)}
                                onClick={() => setSelectedObjetivoIndex(i)}
                            >
                                <Row className="align-items-center">
                                    <Col xs={11}>
                                        <strong className={i === selectedObjetivoIndex ? 'text-success' : 'text-dark'}>
                                            {objetivo.objetivoEstrategico}
                                        </strong>
                                    </Col>
                                    <Col xs={1} className="text-end">
                                        {!disabled && (
                                            <span
                                                className="bi bi-x-lg delete-btn text-danger"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteObjetivo(i); }}
                                                title="Eliminar Objetivo"
                                            ></span>
                                        )}
                                    </Col>
                                </Row>

                                {/* Lista de Beneficios Tangibles (Anidada) */}
                                <ListGroup variant="flush" className="mt-2 ms-3">
                                    {(objetivo.beneficios || []).map((beneficio, j) => (
                                        <ListGroup.Item key={j} className="d-flex justify-content-between align-items-center p-1 border-0">
                                            <span className="text-muted small">
                                                • {beneficio.descripcion}
                                            </span>
                                            {!disabled && (
                                                <span
                                                    className="bi bi-x-lg delete-btn text-danger small"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteBeneficio(i, j); }}
                                                    title="Eliminar Beneficio"
                                                ></span>
                                            )}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        ))}
                    </ListGroup>
                </Col>
            </Row>
        </div>
    );
};

export default InputBeneficiosPlan;