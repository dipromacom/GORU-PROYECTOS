import React, { useMemo, useEffect, useState } from "react"; // Añadido useState
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
    cerrado,
    onSummaryChange = () => { }
}) => {
    // Estado para controlar qué campo tiene el foco y mostrar el formato correcto
    const [focusedField, setFocusedField] = useState(null);

    const unformatToNumber = (value) => {
        if (!value || value === "") return "0";
        let str = value.toString().trim();
        if (str.includes(',')) {
            return str.replace(/\./g, '').replace(',', '.');
        }
        const dots = (str.match(/\./g) || []).length;
        if (dots > 1) {
            return str.replace(/\./g, '');
        }

        return str;
    };

    const totalCostoEntregablesEstimado = useMemo(() =>
        (costoEntregable || []).reduce((total, item) =>
            total + parseFloat(unformatToNumber(item.costo) || 0), 0)
        , [costoEntregable]);

    const totalCostoEntregablesReal = useMemo(() =>
        (costoEntregable || []).reduce((total, item) =>
            total + parseFloat(unformatToNumber(item.costoReal) || 0), 0)
        , [costoEntregable]);

    const presupuestoEstimadoTotal = useMemo(() =>
        totalCostoEntregablesEstimado +
        parseFloat(unformatToNumber(costoReservaContingencia) || 0) +
        parseFloat(unformatToNumber(costoReservaGestion) || 0)
        , [totalCostoEntregablesEstimado, costoReservaContingencia, costoReservaGestion]);

    const presupuestoRealTotal = useMemo(() =>
        totalCostoEntregablesReal +
        parseFloat(unformatToNumber(costoReservaContingenciaReal) || 0) +
        parseFloat(unformatToNumber(costoReservaGestionReal) || 0)
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
        if (ejecutado || cerrado) {
            onSummaryChange('costoDesviacion', porcentajeDesviacion);
        }
    }, [porcentajeDesviacion, ejecutado, cerrado, onSummaryChange]);

    const handleBlurReserva = (value, setter) => {
        // CORRECCIÓN: Al salir, guardamos el número LIMPIO en el estado para el API
        setter(unformatToNumber(value));
        setFocusedField(null);
    }

    const handleFocusReserva = (value, setter, id) => {
        setter(unformatToNumber(value));
        setFocusedField(id);
    }

    const renderReservaInput = (label, estimado, setEstimado, real, setReal, idPrefix) => (
        <Row className="mb-3 align-items-end">
            <Col xs={(ejecutado || cerrado) ? 6 : 12}>
                <Form.Group controlId={`${idPrefix}-estimado`} className="mb-0">
                    <Form.Label>{label} (Estimado)</Form.Label>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text><strong>$</strong></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            disabled={!editMode || (ejecutado || cerrado)}
                            autoComplete="off"
                            type="text"
                            // TRUCO: Si tiene foco muestra el valor real, si no, el formato visual
                            value={focusedField === `${idPrefix}-estimado` ? estimado : formatToEcuador(estimado)}
                            onChange={e =>
                                regexValidator(e, /^\d+(\.\d{0,2})?$/g, setEstimado)
                            }
                            onBlur={(e) => handleBlurReserva(e.target.value, setEstimado)}
                            onFocus={(e) => handleFocusReserva(e.target.value, setEstimado, `${idPrefix}-estimado`)}
                        />
                    </InputGroup>
                </Form.Group>
            </Col>

            {(ejecutado || cerrado) && (
                <Col xs={6}>
                    <Form.Group controlId={`${idPrefix}-real`} className="mb-0">
                        <Form.Label>{label} (Real)</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><strong>$</strong></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                disabled={!editMode}
                                autoComplete="off"
                                type="text"
                                value={focusedField === `${idPrefix}-real` ? real : formatToEcuador(real)}
                                onChange={e =>
                                    regexValidator(e, /^\d+(\.\d{0,2})?$/g, setReal)
                                }
                                onBlur={(e) => handleBlurReserva(e.target.value, setReal)}
                                onFocus={(e) => handleFocusReserva(e.target.value, setReal, `${idPrefix}-real`)}
                            />
                        </InputGroup>
                    </Form.Group>
                </Col>
            )}
        </Row>
    );

    const formatToEcuador = (number) => {
        const val = unformatToNumber(number);
        const parsed = parseFloat(val);
        if (isNaN(parsed)) return '0,00';
        return new Intl.NumberFormat('es-EC', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(parsed);
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
                        setCostoEntregable={setCostoEntregable}
                        ejecutado={ejecutado}
                        cerrado={cerrado}
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
                <Col xs={(ejecutado || cerrado) ? 6 : 12}>
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
                                value={formatToEcuador(presupuestoEstimadoTotal.toFixed(2))}
                                readOnly
                            />
                        </InputGroup>
                    </Form.Group>
                </Col>
                {/* Presupuesto Real Total (Solo en Ejecución) */}
                {(ejecutado || cerrado) && (
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
                                    value={formatToEcuador(presupuestoRealTotal.toFixed(2))}
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