import React from 'react';
import { ListGroup, Form, Row, Col, ProgressBar } from 'react-bootstrap';
import { useEffect, useState, useMemo } from 'react';

const InputCalidadEjecutado = ({ calidadMetricas, setCalidadMetricas, editMode, ejecutado, cerrado, onSummaryChange = () => { } }) => {

    const totalMetricas = calidadMetricas?.length || 0;
    const completadas = calidadMetricas.filter(m => m.completado).length;
    const porcentajeCompletado = totalMetricas > 0 ? Math.round((completadas / totalMetricas) * 100) : 0;


    useEffect(() => {
            if (ejecutado || cerrado) {
                onSummaryChange('calidad', porcentajeCompletado);
            }
    }, [porcentajeCompletado, ejecutado, cerrado, onSummaryChange]);

    const handleCheckboxChange = (index) => {
        const item = calidadMetricas[index];
        const newCompletado = !item.completado;

        // Alerta de confirmación al marcar como completado
        if (newCompletado) {
            const isConfirmed = window.confirm(
                `¿Está seguro que desea cerrar y dar por finalizada la Métrica de Calidad para el entregable "${item.entregable}"?`
            );

            if (!isConfirmed) {
                return; // Si el usuario cancela, no hacemos nada
            }
        }

        const updatedList = calidadMetricas.map((current_item, i) => {
            if (i === index) {
                return {
                    ...current_item,
                    completado: newCompletado,
                };
            }
            return current_item;
        });

        setCalidadMetricas(updatedList);
    };

    return (
        <div className="input-calidad-ejecutado">
            {/* Barra de progreso unificada */}
            <div className="mb-4 p-2">
                <div className="d-flex justify-content-between small fw-bold mb-1 text-uppercase">
                    <span>Progreso de Calidad:</span>
                    <span className="text-success">{porcentajeCompletado}%</span>
                </div>
                <ProgressBar
                    now={porcentajeCompletado}
                    variant="success"
                    style={{ height: '20px', borderRadius: '5px' }}
                />
            </div>

            <div>
                {/* Cabecera estilizada como en Costos/Hitos */}
                <div className="d-flex fw-bold pb-2 border-bottom mb-2 text-muted small">
                    <div className="col-9">MÉTRICA / ENTREGABLE</div>
                    <div className="col-3 text-center">VALIDADO</div>
                </div>

                <ListGroup variant="flush">
                    {calidadMetricas?.map((item, index) => (
                        <ListGroup.Item key={index} className="px-4 py-2 bg-transparent">
                            <Row className="align-items-center no-gutters">
                                <Col xs={9}>
                                    <div className="text-dark fw-bold" style={{ textDecoration: item.completado ? 'line-through' : 'none', opacity: item.completado ? 0.6 : 1 }}>
                                        {item.entregable}
                                    </div>
                                    <div className="text-muted small">
                                        <i className="fas fa-microscope mr-1"></i> {item.metrica}
                                    </div>
                                </Col>

                                <Col xs={3} className="text-center">
                                    <Form.Check
                                        type="checkbox"
                                        checked={item.completado || false}
                                        disabled={!editMode || cerrado}
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default InputCalidadEjecutado;