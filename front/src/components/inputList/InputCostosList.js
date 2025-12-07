import React, { useMemo, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import InputCostToList from "./InputCostToList";
import { InputGroup } from 'react-bootstrap'

const InputCostosList = ({
    costoEntregable,
    setCostoEntregable,
    costoReservaContingencia,
    setCostoReservaContingencia,
    costoReservaContingenciaReal,
    setCostoReservaContingenciaReal,
    costoReservaGestion,
    setCostoReservaGestion,
    costoReservaGestionReal,
    setCostoReservaGestionReal,
    presupuesto,
    regexValidator,
    editMode,
    ejecutado,
    onSummaryChange = () => { }
}) => {

    const totalCostoEntregablesEstimado = useMemo(() =>
        (costoEntregable || []).reduce((total, item) => total + parseFloat(item.costo || 0), 0)
        , [costoEntregable]);

    const totalCostoEntregablesReal = useMemo(() =>
        (costoEntregable || []).reduce((total, item) => total + parseFloat(item.costoReal || item.costo || 0), 0)
        , [costoEntregable]);

    const presupuestoEstimadoTotal = useMemo(() =>
        totalCostoEntregablesEstimado +
        parseFloat(costoReservaContingencia || 0) +
        parseFloat(costoReservaGestion || 0)
        , [totalCostoEntregablesEstimado, costoReservaContingencia, costoReservaGestion]);

    const presupuestoRealTotal = useMemo(() =>
        totalCostoEntregablesReal +
        parseFloat(costoReservaContingenciaReal || 0) +
        parseFloat(costoReservaGestionReal || 0)
        , [totalCostoEntregablesReal, costoReservaContingenciaReal, costoReservaGestionReal]);

    const porcentajeDesviacion = useMemo(() => {
        if (presupuestoEstimadoTotal === 0) return 0;
        return ((presupuestoRealTotal / presupuestoEstimadoTotal) * 100).toFixed(2);
    }, [presupuestoRealTotal, presupuestoEstimadoTotal]);

    const desviacionColor = useMemo(() => {
        if (presupuestoRealTotal <= presupuestoEstimadoTotal) return 'text-success';
        return 'text-danger';
    }, [presupuestoRealTotal, presupuestoEstimadoTotal]);

    useEffect(() => {
            if (ejecutado) {
                onSummaryChange('costoDesviacion', porcentajeDesviacion);
            }
    }, [porcentajeDesviacion, ejecutado, onSummaryChange]);

    const renderReservaInput = (label, estimado, setEstimado, real, setReal, idPrefix) => (
        <Row className="mb-3 align-items-end">
            <Col xs={ejecutado ? 6 : 12}>
                <Form.Group controlId={`${idPrefix}-estimado`} className="mb-0">
                    <Form.Label>{label} (Estimado)</Form.Label>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text><strong>$</strong></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            disabled={!editMode || ejecutado} // Deshabilitar en ejecución
                            autoComplete="off"
                            type="text"
                            value={estimado}
                            onChange={e =>
                                regexValidator(e, /^\d+(\.\d{0,2})?$/g, setEstimado)
                            }
                        />
                    </InputGroup>
                </Form.Group>
            </Col>

            {ejecutado && (
                <Col xs={6}>
                    <Form.Group controlId={`${idPrefix}-real`} className="mb-0">
                        <Form.Label>{label} (Real)</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><strong>$</strong></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                disabled={!editMode} // Habilitar solo si está en modo edición
                                autoComplete="off"
                                type="text"
                                value={real}
                                onChange={e =>
                                    regexValidator(e, /^\d+(\.\d{0,2})?$/g, setReal)
                                }
                            />
                        </InputGroup>
                    </Form.Group>
                </Col>
            )}
        </Row>
    );

    const formatCurrency = (number) => {
        if (isNaN(number) || number === null || number === undefined) return '0.00';

        return new Intl.NumberFormat('es-EC', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(parseFloat(number));
    };

    return (
        <div>
            <h3>Costos</h3>

            {costoEntregable?.length > 0 && (
                <Form.Group controlId="costo-entregables">
                    <Form.Label>Costos por Entregables</Form.Label>
                    <InputCostToList
                        disabled={!editMode}
                        costoList={costoEntregable}
                        setResultCostoList={setCostoEntregable}
                        ejecutado={ejecutado}
                    />
                </Form.Group>
            )}

            {/* Reserva de Contingencia */}
            {renderReservaInput(
                "Reserva de Contingencia",
                costoReservaContingencia,
                setCostoReservaContingencia,
                costoReservaContingenciaReal,
                setCostoReservaContingenciaReal,
                'reserva-contingencia'
            )}

            {/* Reserva de Gestión */}
            {renderReservaInput(
                "Reserva de Gestión",
                costoReservaGestion,
                setCostoReservaGestion,
                costoReservaGestionReal,
                setCostoReservaGestionReal,
                'reserva-gestion'
            )}

            <hr className="my-4" />
            <Row className="mb-3 align-items-end">
                <Col xs={ejecutado ? 6 : 12}>
                    {/* Presupuesto Total Estimado */}
                    <Form.Group controlId="presupuesto-total-estimado" className="mb-0">
                        <Form.Label>Presupuesto Total Estimado (Línea Base)</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><strong>$</strong></InputGroup.Text>
                            </InputGroup.Prepend>
                            {/* El valor del campo presupuesto debe coincidir con el cálculo: presupuestoEstimadoTotal */}
                            <Form.Control
                                disabled
                                type="text"
                                value={formatCurrency(presupuestoEstimadoTotal.toFixed(2))}
                                readOnly
                            />
                        </InputGroup>
                    </Form.Group>
                </Col>
                {/* Presupuesto Real Total (Solo en Ejecución) */}
                {ejecutado && (
                    <Col xs={6}>
                        <Form.Group controlId="presupuesto-total-real" className="mb-0">
                            <Form.Label>
                                Presupuesto Total Real (vs. Estimado: <span className={desviacionColor}>{porcentajeDesviacion}%</span>)
                            </Form.Label>
                            <Form.Label><span className="fw-bold"> &nbsp; Fórmula: (Real / Estimado) * 100 </span></Form.Label>
                            <InputGroup>
                                <InputGroup.Prepend>
                                    <InputGroup.Text><strong>$</strong></InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    disabled
                                    type="text"
                                    value={formatCurrency(presupuestoRealTotal.toFixed(2))}
                                    readOnly
                                />
                            </InputGroup>
                        </Form.Group>  
                    </Col>
                )}
            </Row>    
        </div>
    );
};

export default InputCostosList;