import React from 'react';
import { ListGroup, Form, Row, Col, ProgressBar } from 'react-bootstrap';
import { useEffect, useState, useMemo } from 'react';

const InputCalidadEjecutado = ({ calidadMetricas, setCalidadMetricas, editMode, ejecutado, onSummaryChange = () => { } }) => {

    const totalMetricas = calidadMetricas?.length || 0;
    const completadas = calidadMetricas.filter(m => m.completado).length;
    const porcentajeCompletado = totalMetricas > 0 ? Math.round((completadas / totalMetricas) * 100) : 0;


    useEffect(() => {
            if (ejecutado) {
                onSummaryChange('calidad', porcentajeCompletado);
            }
    }, [porcentajeCompletado, ejecutado, onSummaryChange]);

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
        <div className="input-calidad-ejecutado mt-3">
            <div className="mb-3">
                <Form.Label>Progreso de Calidad: <span className="fw-bold">{porcentajeCompletado}%</span></Form.Label>
                <ProgressBar now={porcentajeCompletado} label={`${porcentajeCompletado}%`} />
            </div>

            <div className={calidadMetricas?.length > 0 ? "mt-2" : ""}>
                {/* Cabecera: 70% Métrica / Entregable / 30% Finalizado */}
                <Row className="calidad-header fw-bold pb-2">
                    <Col xs={8} md={9} lg={9}>Métrica / Entregable</Col>
                    <Col xs={4} md={3} lg={3} className="text-center">Finalizado</Col>
                </Row>

                <ListGroup variant="flush">
                    {calidadMetricas?.map((item, index) => (
                        <ListGroup.Item key={index} className="ps-0 pe-0">
                            <Row className="calidad-row align-items-center">
                                {/* Columna 70% - Métrica y Entregable */}
                                <Col xs={8} md={9} lg={9}>
                                    <div
                                        style={{ textDecoration: item.completado ? 'line-through' : 'none' }}
                                        title={item.metrica}
                                    >
                                        <span className="fw-bold">Entregable: {item.entregable}</span>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                            Métrica: {item.metrica}
                                        </div>
                                    </div>
                                </Col>

                                {/* Columna 30% - Checkbox */}
                                <Col xs={4} md={3} lg={3} className="text-center">
                                    <Form.Check
                                        type="checkbox"
                                        checked={item.completado || false} // Aseguramos que sea false si es undefined
                                        disabled={!editMode}
                                        onChange={() => handleCheckboxChange(index)}
                                        inline
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