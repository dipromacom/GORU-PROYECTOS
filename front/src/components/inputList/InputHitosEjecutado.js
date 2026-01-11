import React from 'react';
import { ListGroup, Form, Row, Col, ProgressBar } from 'react-bootstrap';
import moment from 'moment';
import { useEffect, useState, useMemo } from 'react';

const InputHitosEjecutado = ({ tiempoFechasCriticas, setTiempoFechasCriticas, editMode, ejecutado, cerrado, onSummaryChange = () => { } }) => {

    // 1. Cálculo de Progreso
    const totalHitos = tiempoFechasCriticas?.length || 0;
    const completados = tiempoFechasCriticas.filter(h => h.completado).length;
    const porcentajeCompletado = totalHitos > 0 ? Math.round((completados / totalHitos) * 100) : 0;

    // 2. Manejo del Checkbox con Alerta
    const handleCheckboxChange = (index) => {
        const item = tiempoFechasCriticas[index];
        const newCompletado = !item.completado;

        // Alerta de confirmación al marcar como completado
        if (newCompletado) {
            const isConfirmed = window.confirm(
                `¿Está seguro que desea cerrar y dar por finalizado el Hito: "${item.description}" (${moment(item.date).format('DD/MM/YYYY')})?`
            );

            if (!isConfirmed) {
                return; // Si el usuario cancela, no hacemos nada
            }
        }

        const updatedList = tiempoFechasCriticas.map((current_item, i) => {
            if (i === index) {
                return {
                    ...current_item,
                    completado: newCompletado,
                };
            }
            return current_item;
        });

        setTiempoFechasCriticas(updatedList);
    };

    const deleteItemHandle = (index) => {
        setTiempoFechasCriticas(tiempoFechasCriticas.filter((item, i) => i !== index));
    };

    useEffect(() => {
        if (ejecutado || cerrado) {
            onSummaryChange('hitos', porcentajeCompletado);
        }
    }, [porcentajeCompletado, ejecutado, cerrado, onSummaryChange]);

    return (
        <div className="input-hitos-ejecutado mt-3">
            <div className="mb-3">
                <Form.Label>Progreso de Hitos: <span className="fw-bold">{porcentajeCompletado}%</span></Form.Label><br></br>
                <Form.Label><span className="fw-bold">Fórmula: (entregables_hitos / total_hitos) * 100 </span></Form.Label>
                <ProgressBar now={porcentajeCompletado} label={`${porcentajeCompletado}%`} />
            </div>

            <div className={tiempoFechasCriticas?.length > 0 ? "mt-2" : ""}>
                {/* Cabecera para el estado ejecutado: 70% Hito + Fecha / 30% Finalizado */}
                <Row className="alcance-header fw-bold">
                    <Col xs={8} md={9} lg={9}>Hito / Fecha</Col>
                    <Col xs={4} md={3} lg={3} className="text-center">Finalizado</Col>
                </Row>

                <ListGroup variant="flush">
                    {tiempoFechasCriticas?.map((item, index) => (
                        <ListGroup.Item key={index} className="ps-0 pe-0">
                            <Row className="alcance-row align-items-center">
                                {/* Columna 70% - Hito y Fecha */}
                                <Col xs={8} md={9} lg={9}>
                                    <Row className="align-items-center">
                                        <Col xs={10} className="item-content">
                                            <span
                                                style={{ textDecoration: item.completado ? 'line-through' : 'none', fontWeight: 'bold' }}
                                                title={item.description}
                                            >
                                                {item.description}
                                            </span>
                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                <i className='bi bi-calendar' style={{ paddingRight: "5px" }}></i>
                                                {moment(item.date).locale('es').format('LL')}
                                            </div>
                                        </Col>
                                        <Col xs={2} className="text-end item-actions">
                                            {/* Botón de eliminar (solo en modo edición) */}
                                            {editMode && (
                                                <span
                                                    className="bi bi-x-lg delete-btn text-danger"
                                                    onClick={() => deleteItemHandle(index)}
                                                    title="Eliminar Hito"
                                                ></span>
                                            )}
                                        </Col>
                                    </Row>
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

export default InputHitosEjecutado;