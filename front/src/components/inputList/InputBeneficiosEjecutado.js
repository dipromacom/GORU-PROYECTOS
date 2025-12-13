import React from 'react';
import { ListGroup, Form, Row, Col } from 'react-bootstrap';

const InputBeneficiosEjecutado = ({ beneficiosList, setBeneficiosList, editMode }) => {

    // --- Lógica de Manejo de Estado (Funcionalidad Conservada) ---

    const handleDeleteObjetivo = (index) => {
        // Aseguramos el fallback array aquí también para robustez (aunque en Ejecución debería estar lleno)
        setBeneficiosList((beneficiosList || []).filter((_, i) => i !== index));
    };

    const handleDeleteBeneficio = (objetivoIndex, beneficioIndex) => {
        const listToMap = beneficiosList || []; // Aseguramos el fallback
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

    const handleCheckboxChange = (objetivoIndex, beneficioIndex) => {
        const listToMap = beneficiosList || []; // Aseguramos el fallback
        const updatedList = listToMap.map((objetivo, i) => {
            if (i === objetivoIndex) {
                const updatedBeneficios = (objetivo.beneficios || []).map((beneficio, j) => {
                    if (j === beneficioIndex) {
                        const newCompletado = !beneficio.cumplido;

                        // Opcional: Confirmación de cumplimiento
                        if (newCompletado) {
                            const isConfirmed = window.confirm(
                                `¿Está seguro que desea marcar como CUMPLIDO el beneficio: "${beneficio.descripcion}"?`
                            );
                            if (!isConfirmed) return beneficio; // Retorna el item sin cambios si se cancela
                        }

                        return {
                            ...beneficio,
                            cumplido: newCompletado
                        };
                    }
                    return beneficio;
                });
                return { ...objetivo, beneficios: updatedBeneficios };
            }
            return objetivo;
        });

        setBeneficiosList(updatedList);
    };

    // --- Estilos para el Objetivo (Similar al modo Plan) ---
    const getObjetivoStyle = () => ({
        padding: '8px 10px',
        marginBottom: '12px', // Un poco más de espacio entre objetivos
        borderRadius: '5px',
        border: '1px solid #e9ecef', // Borde gris suave
    });

    // --- Renderizado ---

    return (
        <div className="input-beneficios-ejecutado-container">
            {!(beneficiosList || []).length && (
                <p className="text-muted fst-italic">No hay beneficios definidos. Regrese al modo Planificación para agregarlos.</p>
            )}

            <ListGroup variant="flush">
                {(beneficiosList || []).map((objetivo, i) => (
                    // Usamos el nuevo estilo basado en un div contenedor
                    <div key={i} style={getObjetivoStyle()}>

                        {/* Cabecera del Objetivo (Ahora en una Row para consistencia) */}
                        <Row className="align-items-center mb-1">
                            <Col xs={11}>
                                {/* Usamos el color de éxito para destacar el objetivo */}
                                <strong className="text-success">{objetivo.objetivoEstrategico}</strong>
                            </Col>
                            <Col xs={1} className="text-end">
                                {editMode && (
                                    <span
                                        className="bi bi-x-lg delete-btn text-danger"
                                        onClick={() => handleDeleteObjetivo(i)}
                                        title="Eliminar Objetivo"
                                    ></span>
                                )}
                            </Col>
                        </Row>

                        {/* Lista de Beneficios Tangibles */}
                        <ListGroup variant="flush" className="mt-2 ms-3">
                            {(objetivo.beneficios || []).map((beneficio, j) => (
                                <ListGroup.Item key={j} className="py-1 px-0 border-0">
                                    <Row className="align-items-center">

                                        {/* Descripción del Beneficio */}
                                        <Col xs={9} md={10}>
                                            <span
                                                className="small"
                                                style={{ textDecoration: beneficio.cumplido ? 'line-through' : 'none', color: beneficio.cumplido ? '#6c757d' : '#212529' }}
                                            >
                                                • {beneficio.descripcion}
                                            </span>
                                        </Col>

                                        {/* Checkbox y Eliminar */}
                                        <Col xs={3} md={2} className="text-end d-flex align-items-center justify-content-end">
                                            {/* Checkbox */}
                                            <Form.Check
                                                type="checkbox"
                                                checked={beneficio.cumplido}
                                                disabled={!editMode}
                                                onChange={() => handleCheckboxChange(i, j)}
                                                inline
                                                className="me-3"
                                                title="Marcar como Cumplido"
                                            />
                                            {/* Botón de eliminar Beneficio */}
                                            {editMode && (
                                                <span
                                                    className="bi bi-x-lg delete-btn text-danger small"
                                                    onClick={() => handleDeleteBeneficio(i, j)}
                                                    title="Eliminar Beneficio"
                                                ></span>
                                            )}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                ))}
            </ListGroup>
        </div>
    );
};

export default InputBeneficiosEjecutado;