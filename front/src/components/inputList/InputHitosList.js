import React, { useEffect, useMemo } from "react";
import { Form, Row, Col, ProgressBar } from "react-bootstrap";
import InputTextListWithDate from "../inputList/InputTexListWithDate";
import InputHitosEjecutado from "./InputHitosEjecutado";
import SCurveChart from "../summaryChart/SCurveChart";

const InputHitosList = ({
    tiempoDuracion,
    setTiempoDuracion,
    tiempoFechasCriticas,
    setTiempoFechasCriticas,
    editMode,
    showDuration,
    ejecutado,
    cerrado,
    onSummaryChange = () => { },
    onPerformanceChange = () => { }
}) => {

    // 🔹 Transformación de formato antiguo a nuevo
    const transformedFechasCriticas = useMemo(() => {
        if (tiempoFechasCriticas && tiempoFechasCriticas.length > 0) {
            // 🔹 Cambio clave: Solo transformar si ABSOLUTAMENTE NADIE tiene la propiedad 'completado'
            const yaTieneFormatoNuevo = tiempoFechasCriticas.some(item => item.hasOwnProperty('completado'));

            if (!yaTieneFormatoNuevo) {
                return tiempoFechasCriticas.map(item => ({
                    ...item,
                    completado: false,
                    fecha_hito: null
                }));
            }
        }
        return tiempoFechasCriticas;
    }, [tiempoFechasCriticas]); 

    // 1. Cálculo de Progreso Físico
    const totalHitos = transformedFechasCriticas?.length || 0;
    const completados = transformedFechasCriticas?.filter(h => h.completado).length || 0;
    const porcentajeCompletado = totalHitos > 0 ? Math.round((completados / totalHitos) * 100) : 0;

    // 2. Cálculo de Índice de Desempeño
    const calculatePerformance = () => {
        if (!transformedFechasCriticas || totalHitos === 0) return 1.0;
        const today = new Date().toISOString().split('T')[0];

        // EV: Hitos cerrados antes o igual a su fecha programada
        const successful = transformedFechasCriticas.filter(h => {
            if (!h.completado || !h.fecha_hito || !h.date) return false;
            const deadlineStr = typeof h.date === 'string' ? h.date.split('T')[0] : new Date(h.date).toISOString().split('T')[0];
            return h.fecha_hito <= deadlineStr;
        }).length;

        // PV: Hitos que según el calendario ya deberían estar cerrados
        const shouldBeDone = transformedFechasCriticas.filter(h => {
            if (!h.date) return false;
            const dateStr = typeof h.date === 'string' ? h.date : new Date(h.date).toISOString();
            return dateStr.split('T')[0] <= today;
        }).length;

        // --- LÓGICA CORREGIDA ---
        if (shouldBeDone === 0) {
            // Si adelantaste hitos de meses futuros, tu SPI es 2.0
            return successful > 0 ? 2.0 : 1.0;
        }

        const calc = Number((successful / shouldBeDone).toFixed(2));
        return Math.min(calc, 2.0);
    };

    const performanceIndex = calculatePerformance();

    // 🔹 Reporte de indicadores al padre
    useEffect(() => {
        if (ejecutado || cerrado) {
            onSummaryChange('hitos', porcentajeCompletado);
            onSummaryChange('hitosDesempeno', performanceIndex);
            onPerformanceChange('hitos', performanceIndex);
        }
    }, [porcentajeCompletado, performanceIndex, ejecutado, cerrado]);

    // Sincronizar transformación inicial si es necesario
    useEffect(() => {
        if (tiempoFechasCriticas?.length > 0 && !tiempoFechasCriticas[0].hasOwnProperty('completado')) {
            setTiempoFechasCriticas(transformedFechasCriticas);
        }
    }, [tiempoFechasCriticas, setTiempoFechasCriticas, transformedFechasCriticas]);

    return (
        <div className="alcance-container border rounded p-4 bg-white shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="m-0 fw-bold">
                    <i className="bi bi-calendar-check me-2"></i>
                    Fechas Críticas (Hitos)
                </h4>
            </div>

            {(ejecutado || cerrado) && (
                <Row className="mb-4">
                    <Col md={6} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className="fw-bold mb-1 small text-uppercase">Progreso de Hitos</Form.Label>
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

            <Form.Group controlId="fechas-criticas">
                {(ejecutado || cerrado) && tiempoFechasCriticas?.length > 0 ? (
                    <InputHitosEjecutado
                        tiempoFechasCriticas={tiempoFechasCriticas}
                        setTiempoFechasCriticas={setTiempoFechasCriticas}
                        editMode={editMode}
                        ejecutado={ejecutado}
                        cerrado={cerrado}
                    />
                ) : (
                    <InputTextListWithDate
                        disabled={!editMode}
                        list={tiempoFechasCriticas}
                        setList={setTiempoFechasCriticas}
                        duration={tiempoDuracion}
                    />
                )}
            </Form.Group>

            {(ejecutado || cerrado) && tiempoFechasCriticas?.length > 0 && (
                <div className="mt-5 border-top pt-4">
                    <SCurveChart
                        title="Curva S: Control de Hitos (PV vs EV)"
                        dataPoints={tiempoFechasCriticas.map(h => ({
                            date: h.date,          // Fecha programada
                            realDate: h.fecha_hito, // Fecha real de cierre 🔹 NUEVO
                            completado: h.completado
                        }))}
                    />
                    <p className="text-center text-muted small mt-2">
                        Compara la progresión temporal de hitos planificados vs. ejecutados.
                    </p>
                </div>
            )}
        </div>
    );
};

export default InputHitosList;