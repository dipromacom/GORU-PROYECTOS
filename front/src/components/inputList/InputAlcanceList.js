import React from "react";
import { Form, ProgressBar, Badge, Row, Col } from "react-bootstrap";
import InputTextList from "./InputTextList";
import InputAlcanceEjecutado from "./InputAlcanceEjecutado";
import { useEffect } from 'react';

const isNewFormat = (alcanceEntregables) =>
    Array.isArray(alcanceEntregables) &&
    alcanceEntregables.length > 0 &&
    typeof alcanceEntregables[0] === 'object' &&
    alcanceEntregables[0] !== null &&
    alcanceEntregables[0].hasOwnProperty('nombre');

const transformToNewFormat = (alcanceEntregables) => {
    return alcanceEntregables.map(item => {
        if (typeof item === 'string') {
            return {
                nombre: item,
                completado: false,
                fecha_entregable: null,
                deadline: new Date().toISOString().split('T')[0]
            };
        }
        return item;
    });
};

const InputAlcanceList = ({ alcanceEntregables, setAlcanceEntregables, editMode, ejecutado, cerrado, onSummaryChange = () => { }, esPrograma, onPerformanceChange = () => { } }) => {

    const totalAlcances = alcanceEntregables?.length || 0;
    const completados = (isNewFormat(alcanceEntregables) ? alcanceEntregables.filter(a => a.completado).length : 0);
    const porcentajeCompletado = totalAlcances > 0 ? Math.round((completados / totalAlcances) * 100) : 0;

    const calculatePerformance = () => {
        if (!alcanceEntregables || alcanceEntregables.length === 0) return 0;
        const today = new Date().toISOString().split('T')[0];

        const successful = alcanceEntregables.filter(a => {
            if (!a.completado || !a.fecha_entregable || !a.deadline) return false;
            return a.fecha_entregable <= a.deadline;
        }).length;

        const shouldBeDone = alcanceEntregables.filter(a => a.deadline && a.deadline <= today).length;

        if (shouldBeDone === 0) return successful > 0 ? 1.0 : 0;
        return Number((successful / shouldBeDone).toFixed(2));
    };

    const performanceIndex = calculatePerformance();

    // REPORTE DE DESEMPEÑO TOTAL AL PADRE
    useEffect(() => {
        if (ejecutado || cerrado) {
            onSummaryChange('alcance', porcentajeCompletado);
            onSummaryChange('alcanceDesempeno', performanceIndex);
            // Prop solicitado para el cálculo total
            onPerformanceChange('alcance', performanceIndex);
        }
    }, [porcentajeCompletado, performanceIndex, ejecutado, cerrado]);

    // TRANSFORMAR SIEMPRE (Incluso en planificación para habilitar el Deadline)
    useEffect(() => {
        if (alcanceEntregables?.length > 0 && !isNewFormat(alcanceEntregables)) {
            setAlcanceEntregables(transformToNewFormat(alcanceEntregables));
        }
    }, [alcanceEntregables, setAlcanceEntregables]);

    if (!(alcanceEntregables?.length > 0 || editMode)) return null;

    return (
        <div className="alcance-container border rounded p-4 bg-white shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="m-0 fw-bold">
                    <i className="bi bi-list-check me-2"></i>
                    Alcance del {esPrograma ? "Componente" : "Proyecto"}
                </h4>
            </div>

            {/* BARRAS: Solo se muestran en Ejecución o Cerrado */}
            {(ejecutado || cerrado) && (
                <Row className="mb-4">
                    <Col md={6} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className="fw-bold mb-1 small text-uppercase">Progreso de Entregables</Form.Label>
                            <span className="fw-bold text-primary small">{porcentajeCompletado}%</span>
                        </div>
                        <ProgressBar now={porcentajeCompletado} style={{ height: '20px' }} />
                    </Col>
                    <Col md={6} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className="fw-bold mb-1 small text-uppercase">Índice de Desempeño</Form.Label>
                            <span className={`fw-bold text-${performanceIndex >= 1 ? "success" : performanceIndex >= 0.8 ? "warning" : "danger"} small`}>
                                {performanceIndex.toFixed(2)}
                            </span>
                        </div>
                        <ProgressBar
                            now={Math.min(performanceIndex * 100, 100)}
                            variant={performanceIndex >= 1 ? "success" : performanceIndex >= 0.8 ? "warning" : "danger"}
                            style={{ height: '20px' }}
                        />
                    </Col>
                </Row>
            )}

            {/* LISTADO: Siempre usamos el Ejecutado si ya es formato objeto para ver el Deadline */}
            {isNewFormat(alcanceEntregables) ? (
                <InputAlcanceEjecutado
                    alcanceEntregables={alcanceEntregables}
                    setAlcanceEntregables={setAlcanceEntregables}
                    editMode={editMode}
                    ejecutado={ejecutado}
                />
            ) : (
                <InputTextList
                    disabled={!editMode}
                    list={alcanceEntregables}
                    setList={setAlcanceEntregables}
                />
            )}
        </div>
    );
};

export default InputAlcanceList;