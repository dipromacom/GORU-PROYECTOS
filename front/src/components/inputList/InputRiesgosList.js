/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from "react";
import { Col, Form, ListGroup, Button, InputGroup, Row, Alert, ProgressBar } from "react-bootstrap"
import { CriticalBadgeFromText, CriticalBadgeFromTextValue } from "../badge/Badge";
import PlanRespuestaModal from "./PlanRespuestaModal";


const InputRiesgosList = ({ riesgosList = [], setRiesgosList = () => { }, disabled = false, ejecutado, cerrado, interesados = [], onSummaryChange = () => { } }) => {
    // Definición de estados con valores iniciales para M (Medio = 2)
    const [riesgosDesc, setRiesgoDesc] = useState("")
    const [probabilidad, setProbabilidad] = useState("M") // Clave para el <select>
    const [impacto, setImpacto] = useState("M") // Clave para el <select>
    const [riesgoVal, setRiesgoVal] = useState(4) // Valor inicial M*M = 4 (Cálculo numérico)
    // Estado para el modal
    const [showModal, setShowModal] = useState(false);
    const [selectedRiesgo, setSelectedRiesgo] = useState(null);

    const [isOldFormatDetected, setIsOldFormatDetected] = useState(false);

    const values = [
        { clave: "H", valor: "Alto (3)", num: 3 },
        { clave: "M", valor: "Medio (2)", num: 2 },
        { clave: "L", valor: "Bajo (1)", num: 1 },
    ]
    // Mapeos útiles para la lógica
    const claveToNum = useMemo(() => values.reduce((acc, val) => ({ ...acc, [val.clave]: val.num }), {}), [values]);
    const numToClave = useMemo(() => values.reduce((acc, val) => ({ ...acc, [val.num]: val.clave }), {}), [values]);


    const getBadgeClaveFromValue = (numValue) => {
        if (typeof numValue === 'string') return numValue; // Para retrocompatibilidad temporal
        if (numValue >= 7) return 'H'; // 7, 8, 9 -> Alto
        if (numValue >= 4) return 'M'; // 4, 5, 6 -> Medio
        return 'L'; // 1, 2, 3 -> Bajo
    };

    const getClaveForDisplay = (numValue) => {
        // Si el valor es una clave (H, M, L) lo devuelve, si no, lo busca por número.
        if (typeof numValue === 'string') return numValue;
        return numToClave[numValue] || 'L';
    };

    useEffect(() => {
        const probNum = claveToNum[probabilidad] || 0;
        const impactNum = claveToNum[impacto] || 0;
        // Cálculo: probabilidad * impacto (Valor numérico 1-9)
        const newRiesgoVal = probNum * impactNum;
        setRiesgoVal(newRiesgoVal);
    }, [probabilidad, impacto, claveToNum])


    useEffect(() => {
        const list = riesgosList || [];
        // El formato antiguo tenía 'valor' como string ('H', 'M', 'L')
        const oldFormatFound = list.some(item => typeof item.valor === 'string' && ['H', 'M', 'L'].includes(item.valor));

        setIsOldFormatDetected(oldFormatFound);
        if (oldFormatFound) {
            console.error("Se detectó un formato de riesgo antiguo. Por favor, borre y recree los riesgos.");
        }
    }, [riesgosList]);


    const riesgoPromedio = useMemo(() => {
        const list = riesgosList || [];
        // Si hay formato antiguo o la lista está vacía, no se puede calcular.
        if (list.length === 0 || isOldFormatDetected) return null;

        const maxRiesgo = 9;

        const totalNumValue = list.reduce((sum, item) => {
            // Se asume que item.valor es un número (1-9)
            const numValue = (typeof item.valor === 'number' && item.valor > 0) ? item.valor : 0;
            return sum + numValue;
        }, 0);

        const averageNum = totalNumValue / list.length;

        // Conversión a porcentaje: (Valor promedio / Máximo (9)) * 100
        const porcentaje = Math.round((averageNum / maxRiesgo) * 100);

        // Redondeamos y devolvemos el string con el porcentaje
        return porcentaje;
    }, [riesgosList, isOldFormatDetected]);

    const getProgressVariant = (percentage) => {
        // Definimos los umbrales de riesgo en base al porcentaje (0-100)
        if (percentage >= 67) return 'danger'; // 67-100% (Alto) -> Rojo
        if (percentage >= 34) return 'warning'; // 34-66% (Medio) -> Amarillo
        return 'success'; // 0-33% (Bajo) -> Verde
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const probNum = claveToNum[probabilidad] || 0;
        const impactNum = claveToNum[impacto] || 0;

        const riesgo = {
            descripcion: riesgosDesc,
            valor: riesgoVal, // Ahora es el resultado numérico (1-9)
            probabilidad: probNum, // Ahora es el número (1, 2, 3)
            impacto: impactNum, // Ahora es el número (1, 2, 3)
            plan_descripcion: '',
            fecha_realizacion: '',
            responsable_id: '',
            completado: false,
        }

        const newList = [...(riesgosList || []), riesgo]
        setRiesgosList(newList)
        resetFields()
    }

    const resetFields = () => {
        setRiesgoDesc("");
        setProbabilidad("M");
        setImpacto("M");
        setRiesgoVal(4); // Resetear al valor calculado M*M
    }

    const enableSubmit = () => {
        return riesgosDesc.length > 0 && riesgoVal > 0
    }

    const deleteItemHandle = (index) => {
        setRiesgosList(riesgosList.filter((item, i) => i !== index));
    };

    const handleOpenModal = (item) => {
        setSelectedRiesgo(item);
        setShowModal(true);
    };

    const handleSaveRiesgoPlan = (updatedRiesgo) => {
        const updatedList = (riesgosList || []).map(item =>
            item === selectedRiesgo ? updatedRiesgo : item
        );
        setRiesgosList(updatedList);
    };

    const getResponsableName = (id) => {
        return interesados.find(i => i.id === id)?.nombre_interesado || 'N/A';
    };


    const renderPlanInfo = (item) => {
        if (!(ejecutado || cerrado)) return null;

        const responsable = getResponsableName(item.responsable_id);
        const fecha = item.fecha_realizacion
            ? new Date(item.fecha_realizacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'Pendiente';
        const completadoText = item.completado ? 'Cerrado' : 'Abierto';

        return (
            <div className="mt-1 p-1" style={{ borderTop: '1px dotted #ccc', fontSize: '0.8rem', backgroundColor: '#f9f9f9' }}>
                <Row>
                    <Col xs={6}>
                        Plan: <span className="text-muted text-break" title={item.plan_descripcion}>{item.plan_descripcion || 'Pendiente'}</span>
                    </Col>
                    <Col xs={2}>
                        Fecha: <span className="text-muted">{fecha}</span>
                    </Col>
                    <Col xs={3}>
                        Resp.: <span className="text-muted">{responsable}</span>
                    </Col>
                    <Col xs={1} className="text-end">
                        <span className={`fw-bold ${item.completado ? 'text-success' : 'text-danger'}`}>{completadoText}</span>
                    </Col>
                </Row>
            </div>
        );
    };

    useEffect(() => {
        if ((ejecutado || cerrado) && !isOldFormatDetected) {
            onSummaryChange(riesgoPromedio);
        }
    }, [riesgoPromedio, ejecutado, cerrado, onSummaryChange, isOldFormatDetected]);


    return (
        <div>
            {selectedRiesgo && (
                <PlanRespuestaModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    riesgo={selectedRiesgo}
                    handleSave={handleSaveRiesgoPlan}
                    interesados={interesados}
                    disabled={disabled}
                />
            )}
            {isOldFormatDetected && (
                <Alert variant="danger" className="mt-3">
                    <strong>¡Advertencia de Formato de Riesgo!</strong> Se detectaron riesgos en un formato anterior.
                    Por favor, <strong>elimine y vuelva a crear</strong> todos los riesgos para que se aplique la nueva lógica de cálculo (Probabilidad x Impacto) y el Promedio se muestre correctamente.
                </Alert>
            )}

            <Form>
                <Form.Row>
                    <Col xs={5}>
                        <Form.Label>Descripcion</Form.Label>
                        {!disabled && <Form.Control
                            autoComplete="off"
                            type="text"
                            value={riesgosDesc}
                            onChange={(e) => { setRiesgoDesc(e.target.value) }}
                        />}
                    </Col>
                    <Col xs={2}>
                        <Form.Label>Probabilidad</Form.Label>
                        {!disabled && <Form.Control as="select" size="sm" custom onChange={e => { setProbabilidad(e.target.value) }} value={probabilidad}>
                            {
                                values.map(
                                    (val, index) => (
                                        // Se usa val.clave para el estado (H, M, L)
                                        <option value={val.clave} key={index}>{val.valor}</option>
                                    )
                                )
                            }
                        </Form.Control>}
                    </Col>
                    <Col xs={2}>
                        <Form.Label>Impacto</Form.Label>
                        {!disabled && <Form.Control as="select" size="sm" custom onChange={e => { setImpacto(e.target.value) }} value={impacto}>
                            {
                                values.map(
                                    (val, idx) => (
                                        // Se usa val.clave para el estado (H, M, L)
                                        <option value={val.clave} key={idx}>{val.valor}</option>
                                    )
                                )
                            }
                        </Form.Control>}
                    </Col>
                    <Col xs={1}>
                        <Form.Label>Valor ({riesgoVal})</Form.Label>
                        <InputGroup>
                            {!disabled && <CriticalBadgeFromTextValue value={getBadgeClaveFromValue(riesgoVal)} />}
                        </InputGroup>
                    </Col>
                    <Col xs={2} className='d-flex align-items-end justify-content-end'>
                        {!disabled && <Button type="submit" disabled={!enableSubmit()} onClick={e => handleSubmit(e)}>Agregar</Button>}
                    </Col>
                </Form.Row>
            </Form>

            <div className={riesgosList?.length > 0 ? "mt-4" : ""}>
                <ListGroup horizontal className="fw-bold d-flex p-0 list-risk-header" style={{ borderBottom: '2px solid #ccc' }}>
                    <ListGroup.Item className="col-4">Descripción</ListGroup.Item>
                    <ListGroup.Item className="col-2 text-center">Prob.</ListGroup.Item>
                    <ListGroup.Item className="col-2 text-center">Impac.</ListGroup.Item>
                    <ListGroup.Item className="col-2 text-center">Valor</ListGroup.Item>
                    {(ejecutado || cerrado) && <ListGroup.Item className="col-2 text-center">Plan Respuesta</ListGroup.Item>}
                </ListGroup>

                <ListGroup variant="flush">
                    {(riesgosList || []).map((item, index) => (
                        <ListGroup.Item key={index} className='p-0'>
                            <div className='d-flex align-items-center p-2'>
                                <div className="col-4 text-break">{item.descripcion}</div>
                                <div className="col-2 text-center"><CriticalBadgeFromText value={getClaveForDisplay(item.probabilidad)} femenize /></div>
                                <div className="col-2 text-center"><CriticalBadgeFromText value={getClaveForDisplay(item.impacto)} /></div>
                                <div className="col-2 text-center">
                                    <span className="d-flex justify-content-center align-items-center">
                                        ({item.valor}) &nbsp;
                                        <CriticalBadgeFromTextValue value={getBadgeClaveFromValue(item.valor)} number={item.valor} className="ml-1" />
                                    </span>
                                </div>

                                {(ejecutado || cerrado) && !disabled && (
                                    <div className="col-2 text-center pr-0">
                                        <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(item)}>
                                            Plan de Respuesta
                                        </Button>
                                    </div>
                                )}

                                <div className={`col-${(ejecutado || cerrado) && !disabled ? 1 : 2} text-end pr-0`}>
                                    {!disabled && <span className="bi bi-x-lg pull-end" style={{ cursor: 'pointer' }} onClick={() => deleteItemHandle(index)} ></span>}
                                </div>
                            </div>

                            {renderPlanInfo(item)}
                        </ListGroup.Item>
                    ))}

                    {(ejecutado || cerrado) && !isOldFormatDetected && (riesgosList || []).length > 0 && (
                        <ListGroup.Item className='fw-bold p-2 total-risk-row'>
                            <div className="mb-3">
                                <Form.Label>RIESGO PROMEDIO: <span className="fw-bold">{riesgoPromedio}%</span></Form.Label><br></br>
                                <Form.Label><span className="fw-bold">Fórmula: ((Suma_Valores/Riesgos_totales) / 9) * 100</span></Form.Label>
                                <ProgressBar
                                    now={riesgoPromedio}
                                    label={`${riesgoPromedio}%`}
                                    variant={getProgressVariant(riesgoPromedio)} // Usa la función para el color
                                />
                            </div>
                        </ListGroup.Item>
                    )}

                </ListGroup>
            </div>
        </div>
    )
}

export default InputRiesgosList;