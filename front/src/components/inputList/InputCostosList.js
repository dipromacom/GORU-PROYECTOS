import React, { useMemo, useEffect, useState } from "react";
import { Form, Row, Col, ProgressBar, Badge } from "react-bootstrap";
import InputCostToList from "./InputCostToList";
import { InputGroup } from 'react-bootstrap'
import SCurveChart from "../summaryChart/SCurveChart";
import moment from "moment";

const InputCostosList = ({
    costoEntregable = [],
    setCostoEntregable,
    costoReservaContingencia,
    setCostoReservaContingencia,
    costoReservaContingenciaReal,
    setCostoReservaContingenciaReal,
    costoReservaGestion,
    setCostoReservaGestion,
    costoReservaGestionReal,
    setCostoReservaGestionReal,
    regexValidator,
    editMode,
    ejecutado,
    cerrado,
    onSummaryChange = () => { },
    onPerformanceChange = () => { },
}) => {
    const [focusedField, setFocusedField] = useState(null);

    const safeCostoEntregable = Array.isArray(costoEntregable) ? costoEntregable : [];

    const unformatToNumber = (value) => {
        if (!value || value === "") return "0";
        let str = value.toString().trim();
        if (str.includes(',')) return str.replace(/\./g, '').replace(',', '.');
        return str;
    };

    // --- LÓGICA DE PRESUPUESTO CORREGIDA ---
    const totalCostoEntregablesEstimado = useMemo(() =>
        safeCostoEntregable.reduce((total, item) => total + parseFloat(unformatToNumber(item?.costo) || 0), 0)
        , [safeCostoEntregable]);

    const totalCostoEntregablesReal = useMemo(() =>
        safeCostoEntregable.reduce((total, item) => total + parseFloat(unformatToNumber(item?.costoReal) || 0), 0)
        , [safeCostoEntregable]);

    const presupuestoEstimadoTotal = useMemo(() =>
        totalCostoEntregablesEstimado + parseFloat(unformatToNumber(costoReservaContingencia) || 0) + parseFloat(unformatToNumber(costoReservaGestion) || 0)
        , [totalCostoEntregablesEstimado, costoReservaContingencia, costoReservaGestion]);

    const presupuestoRealTotal = useMemo(() =>
        totalCostoEntregablesReal + parseFloat(unformatToNumber(costoReservaContingenciaReal) || 0) + parseFloat(unformatToNumber(costoReservaGestionReal) || 0)
        , [totalCostoEntregablesReal, costoReservaContingenciaReal, costoReservaGestionReal]);

    const porcentajeDesviacion = useMemo(() => {
        if (presupuestoEstimadoTotal === 0) return 0;
        return ((presupuestoRealTotal / presupuestoEstimadoTotal) * 100).toFixed(2);
    }, [presupuestoRealTotal, presupuestoEstimadoTotal]);

    // --- LÓGICA DE DESEMPEÑO CORREGIDA ---
    const performanceData = useMemo(() => {
        if (safeCostoEntregable.length === 0) return 1.00; // Valor neutro si no hay tareas

        const hoy = moment().startOf('day');

        // 1. Valor Planeado (PV)
        const tareasQueDebianEstarCerradas = safeCostoEntregable.filter(item => {
            if (!item?.deadline) return false;
            const deadline = moment(item.deadline).startOf('day');
            return deadline.isSameOrBefore(hoy);
        }).length;

        // 2. Valor Ganado (EV)
        const tareasCerradasATiempo = safeCostoEntregable.filter(item => {
            if (!item?.completado || !item?.fecha_cerrado || !item?.deadline) return false;

            const deadline = moment(item.deadline).startOf('day');
            const fechaCierre = moment(item.fecha_cerrado).startOf('day');

            return fechaCierre.isSameOrBefore(deadline);
        }).length;

        // 3. Cálculo del Índice (Máximo 2)
        if (tareasQueDebianEstarCerradas === 0) {
            // Si no hay tareas vencidas pero ya cerró alguna futura, el desempeño es alto
            return tareasCerradasATiempo > 0 ? 2.00 : 1.00;
        }

        const spi = tareasCerradasATiempo / tareasQueDebianEstarCerradas;
        return Number(Math.min(spi, 2.00).toFixed(2));
    }, [safeCostoEntregable]);

    useEffect(() => {
        if (ejecutado || cerrado) {
            onSummaryChange('costoDesviacion', porcentajeDesviacion);
            onPerformanceChange('costos', performanceData);
        }
    }, [porcentajeDesviacion, performanceData, ejecutado, cerrado]);

    const formatToEcuador = (number) => {
        const val = unformatToNumber(number);
        const parsed = parseFloat(val);
        if (isNaN(parsed)) return '0,00';
        return new Intl.NumberFormat('es-EC', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(parsed);
    };

    const renderReservaInput = (label, estimado, setEstimado, real, setReal, idPrefix) => (
        <Row className="mb-3 align-items-end">
            <Col xs={(ejecutado || cerrado) ? 6 : 12}>
                <Form.Group className="mb-0">
                    <Form.Label className="small fw-bold text-muted">{label} (Estimado)</Form.Label>
                    <InputGroup size="sm">
                        <InputGroup.Prepend><InputGroup.Text>$</InputGroup.Text></InputGroup.Prepend>
                        <Form.Control
                            disabled={!editMode || ejecutado || cerrado}
                            value={focusedField === `${idPrefix}-est` ? estimado : formatToEcuador(estimado)}
                            onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, setEstimado)}
                            onFocus={() => setFocusedField(`${idPrefix}-est`)}
                            onBlur={() => setFocusedField(null)}
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            {(ejecutado || cerrado) && (
                <Col xs={6}>
                    <Form.Group className="mb-0">
                        <Form.Label className="small fw-bold text-muted">{label} (Real)</Form.Label>
                        <InputGroup size="sm">
                            <InputGroup.Prepend><InputGroup.Text>$</InputGroup.Text></InputGroup.Prepend>
                            <Form.Control
                                disabled={!editMode || cerrado}
                                value={focusedField === `${idPrefix}-real` ? real : formatToEcuador(real)}
                                onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, setReal)}
                                onFocus={() => setFocusedField(`${idPrefix}-real`)}
                                onBlur={() => setFocusedField(null)}
                            />
                        </InputGroup>
                    </Form.Group>
                </Col>
            )}
        </Row>
    );

    return (
        <div className="costos-container shadow-sm border rounded p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="m-0 fw-bold">
                    <i className="bi bi-cash-stack me-2"></i>
                    Gestión de Costos
                </h4>
                {(ejecutado || cerrado) && (
                    <Badge variant={parseFloat(porcentajeDesviacion) <= 100 ? "success" : "danger"} className="p-2">
                        {parseFloat(porcentajeDesviacion) <= 100 ? "Presupuesto OK" : "Sobre Costo"}
                    </Badge>
                )}
            </div>

            {/* BARRAS DE PROGRESO (Estilo Hitos) */}
            {(ejecutado || cerrado) && (
                <div className="mb-4">
                    <Row>
                        <Col md={6} className="mb-3 mb-md-0">
                            <div className="d-flex justify-content-between small fw-bold mb-1 text-uppercase">
                                <span>presupuesto real vs. estimado</span>
                                <span className={parseFloat(porcentajeDesviacion) <= 100 ? "text-success" : "text-danger"}>
                                    {porcentajeDesviacion}%
                                </span>
                            </div>
                            <ProgressBar
                                now={Math.min(parseFloat(porcentajeDesviacion), 100)}
                                variant={parseFloat(porcentajeDesviacion) <= 100 ? "success" : "danger"}
                                style={{ height: '20px' }}
                            />
                        </Col>
                        <Col md={6}>
                            <div className="d-flex justify-content-between small fw-bold mb-1 text-uppercase">
                                <span>Índice de Desempeño</span>
                                <span className={performanceData >= 1 ? "text-success" : "text-danger"}>
                                    {performanceData.toFixed(2)}
                                </span>
                            </div>
                            <ProgressBar
                                now={performanceData * 100}
                                variant={performanceData >= 1 ? "success" : "warning"}
                                style={{ height: '20px'}}
                            />
                        </Col>
                        
                    </Row>
                </div>
            )}

            <Form.Group>
                <InputCostToList
                    costoList={safeCostoEntregable}
                    setResultCostoList={setCostoEntregable}
                    disabled={!editMode}
                    ejecutado={ejecutado}
                    cerrado={cerrado}
                    regexValidator={regexValidator}
                />
            </Form.Group>

            <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold text-muted mb-3">Reservas</h6>
                {renderReservaInput("Reserva de Contingencia", costoReservaContingencia, setCostoReservaContingencia, costoReservaContingenciaReal, setCostoReservaContingenciaReal, 'contingencia')}
                {renderReservaInput("Reserva de Gestión", costoReservaGestion, setCostoReservaGestion, costoReservaGestionReal, setCostoReservaGestionReal, 'gestion')}
            </div>

            <hr />

            <Row className="bg-dark text-white p-3 rounded mx-0">
                <Col xs={(ejecutado || cerrado) ? 6 : 12}>
                    <div className="small opacity-75">TOTAL ESTIMADO (Línea Base)</div>
                    <div className="h5 mb-0">${formatToEcuador(presupuestoEstimadoTotal.toFixed(2))}</div>
                </Col>
                {(ejecutado || cerrado) && (
                    <Col xs={6} className="border-left">
                        <div className="small opacity-75">TOTAL REAL EJECUTADO</div>
                        <div className="h5 mb-0">${formatToEcuador(presupuestoRealTotal.toFixed(2))}</div>
                    </Col>
                )}
            </Row>

            {/* CURVA S DE COSTOS */}
            {(ejecutado || cerrado) && safeCostoEntregable.length > 0 && (
                <div className="mt-5 border-top pt-4">
                    <SCurveChart
                        title="Curva S: Control de Costos (PV vs EV)"
                        dataPoints={safeCostoEntregable}
                        dateField="deadline"
                        realDateField="fecha_cerrado"
                    />
                </div>
            )}
        </div>
    );
};

export default InputCostosList;