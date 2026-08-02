/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from "react";
import { Col, Form, ListGroup, Button, InputGroup, Row, Alert, ProgressBar, Nav, Tab } from "react-bootstrap"
import { CriticalBadgeFromText, CriticalBadgeFromTextValue } from "../badge/Badge";
import PlanRespuestaModal from "./PlanRespuestaModal";
import RiskHeatmapMatrix from "../summaryChart/RiskHeatmapMatrix";


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

        const nextId = `R${(riesgosList?.length || 0) + 1}`;

        const riesgo = {
            id: nextId,
            descripcion: riesgosDesc,
            valor: riesgoVal,
            probabilidad: probNum,
            impacto: impactNum,
            probabilidad_residual: null,
            impacto_residual: null,
            valor_residual: null,
            planes_respuesta: [],
            plan_contingencia: {
                disparador: '',
                descripcion: '',
                costo: 0,
                responsable_id: ''
            },
            plan_descripcion: '',
            fecha_realizacion: '',
            responsable_id: '',
            completado: false,
            estrategia: '',
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
        if (!id) return 'N/A';
        const found = interesados.find(i => Number(i.id) === Number(id));
        return found ? (found.nombre_interesado || found.nombre || 'N/A') : 'N/A';
    };


    const renderPlanInfo = (item) => {
        if (!(ejecutado || cerrado)) return null;

        const planes = Array.isArray(item.planes_respuesta) && item.planes_respuesta.length > 0
            ? item.planes_respuesta
            : (item.plan_descripcion ? [{
                descripcion: item.plan_descripcion,
                costo: item.costo || 0,
                fecha_realizacion: item.fecha_realizacion,
                responsable_id: item.responsable_id,
                completado: item.completado
            }] : []);

        const numPlanes = planes.length;
        const costoTotalPlanes = planes.reduce((sum, p) => sum + (Number(p.costo) || 0), 0);

        const cont = item.plan_contingencia || {};
        const tieneContingencia = Boolean(cont.disparador || cont.descripcion || item.disparador);

        const completadoText = item.completado ? 'Cerrado' : 'Abierto';

        return (
            <div className="mt-1 p-2 border-top bg-light text-muted" style={{ fontSize: '0.8rem' }}>
                <Row className="align-items-center g-2">
                    <Col md={5}>
                        <i className="bi bi-list-task me-1"></i>
                        <strong>Planes Resp.:</strong>{' '}
                        {numPlanes > 0 ? (
                            <span>
                                {numPlanes} plan(es) — <strong className="text-success">${costoTotalPlanes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</strong>
                            </span>
                        ) : (
                            <span className="fst-italic text-secondary">Sin planes</span>
                        )}
                    </Col>
                    <Col md={5}>
                        <i className="bi bi-life-preserver me-1"></i>
                        <strong>Contingencia:</strong>{' '}
                        {tieneContingencia ? (
                            <span className="text-dark">
                                {cont.disparador || item.disparador} {cont.costo ? `($${Number(cont.costo).toLocaleString('es-ES')})` : ''}
                            </span>
                        ) : (
                            <span className="fst-italic text-secondary">Sin configurar</span>
                        )}
                    </Col>
                    <Col md={2} className="text-end">
                        <span className={`fw-bold ${item.completado ? 'text-success' : 'text-danger'}`}>
                            {completadoText}
                        </span>
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
        <div className="riesgos-container shadow-sm border rounded p-4 bg-white mt-4">
            {/* Título con diseño unificado */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 text-dark fw-bold">
                    <i className="bi bi-exclamation-octagon me-2"></i>Gestión de Riesgos
                </h4>
            </div>
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
                        <Form.Label className="small fw-bold text-muted">Descripcion</Form.Label>
                        {!disabled && <Form.Control
                            autoComplete="off"
                            type="text"
                            value={riesgosDesc}
                            onChange={(e) => { setRiesgoDesc(e.target.value) }}
                        />}
                    </Col>
                    <Col xs={2}>
                        <Form.Label className="small fw-bold text-muted">Probabilidad</Form.Label>
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
                        <Form.Label className="small fw-bold text-muted">Impacto</Form.Label>
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
                        <Form.Label className="small fw-bold text-muted">Valor ({riesgoVal})</Form.Label>
                        <InputGroup>
                            {!disabled && <CriticalBadgeFromTextValue value={getBadgeClaveFromValue(riesgoVal)} />}
                        </InputGroup>
                    </Col>
                    <Col xs={2} className='d-flex align-items-end justify-content-end'>
                        {!disabled && <Button type="submit" disabled={!enableSubmit()} onClick={e => handleSubmit(e)}>Agregar</Button>}
                    </Col>
                </Form.Row>
            </Form>

            <div className={riesgosList?.length > 0 ? "mt-4 border rounded p-3 bg-light" : ""}>
                <div className="d-flex fw-bold pb-2 border-bottom mb-2 text-muted small mt-4">
                    <div className="col-4">DESCRIPCIÓN</div>
                    <div className="col-2 text-center">PROB.</div>
                    <div className="col-2 text-center">IMPAC.</div>
                    <div className="col-2 text-center">VALOR</div>
                    {(ejecutado || cerrado) && <div className="col-2 text-center">PLAN RESPUESTA</div>}
                </div>

                <ListGroup variant="flush">
                    {(riesgosList || []).map((item, index) => (
                        <ListGroup.Item key={index} className='p-0'>
                            <div className='d-flex align-items-center p-2'>
                                <div className="col-4 text-break">{item.descripcion} ({item.id})</div>
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
                                {(!ejecutado && !cerrado) && !disabled && (
                                    <div className={`col-${(ejecutado || cerrado) && !disabled ? 1 : 2} text-end pr-0`}>
                                        {!disabled && <span className="bi bi-x-lg pull-end" style={{ cursor: 'pointer' }} onClick={() => deleteItemHandle(index)} ></span>}
                                    </div>
                                )}
                            </div>

                            {renderPlanInfo(item)}
                        </ListGroup.Item>
                    ))}

                    {(ejecutado || cerrado) && !isOldFormatDetected && (riesgosList || []).length > 0 && (
                        <div className="mt-4">
                            <div className="d-flex justify-content-between small fw-bold mb-1 text-uppercase">
                                <span>Nivel de Riesgo Promedio (Exposición):</span>
                                <span className={`text-${getProgressVariant(riesgoPromedio)}`}>{riesgoPromedio}%</span>
                            </div>
                            <ProgressBar
                                now={riesgoPromedio}
                                variant={getProgressVariant(riesgoPromedio)}
                                style={{ height: '20px', borderRadius: '5px' }}
                            />
                            <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '5px' }}>
                                Basado en la matriz Probabilidad x Impacto (Máximo 9 pts).
                            </div>
                        </div>
                    )}

                </ListGroup>
            </div>
            {(ejecutado || cerrado) && (riesgosList || []).length > 0 && !isOldFormatDetected && (
                <div className="mt-5">
                    <Tab.Container defaultActiveKey="inicial">
                        <Nav variant="tabs" className="mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="inicial">
                                    <i className="bi bi-grid-3x3 me-2"></i>
                                    Matriz de Calor de Riesgos
                                </Nav.Link>
                            </Nav.Item>
                            {/* Solo mostrar pestaña residual si hay planes cerrados */}
                            {(riesgosList || []).some(r => r.completado) && (
                                <Nav.Item>
                                    <Nav.Link eventKey="residual">
                                        <i className="bi bi-shield-check me-2"></i>
                                        Matriz de Calor de Riesgos (Residual)
                                    </Nav.Link>
                                </Nav.Item>
                            )}
                        </Nav>

                        <Tab.Content>
                            <Tab.Pane eventKey="inicial">
                                <RiskHeatmapMatrix riesgosList={riesgosList} showResidual={false} />
                            </Tab.Pane>

                            <Tab.Pane eventKey="residual">
                                <RiskHeatmapMatrix riesgosList={riesgosList} showResidual={true} />

                                {/* Información adicional sobre riesgos cerrados */}
                                <div className="alert alert-info mt-3">
                                    <i className="bi bi-info-circle me-2"></i>
                                    <strong>Riesgos con plan completado:</strong> {(riesgosList || []).filter(r => r.completado).length} de {(riesgosList || []).length}
                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </div>
            )}
        </div>
    )
}

export default InputRiesgosList;