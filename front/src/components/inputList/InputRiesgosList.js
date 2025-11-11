/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from "react";
import { Col, Form, ListGroup, Button, InputGroup, Row } from "react-bootstrap"
import { CriticalBadgeFromText } from "../badge/Badge";
import PlanRespuestaModal from "./PlanRespuestaModal";


const InputRiesgosList = ({ riesgosList = [], setRiesgosList = () => { }, disabled = false, ejecutado, interesados = [], onSummaryChange = () => { } }) => {
    const [riesgosDesc, setRiesgoDesc] = useState("")
    const [riesgoVal, setRiesgoVal] = useState("")
    const [probabilidad, setProbabilidad] = useState("M")
    const [impacto, setImpacto] = useState("M")
    // Estado para el modal
    const [showModal, setShowModal] = useState(false);
    const [selectedRiesgo, setSelectedRiesgo] = useState(null);

    const values = [
        { clave: "H", valor: "Alto", num: 3 },
        { clave: "M", valor: "Medio", num: 2 },
        { clave: "L", valor: "Bajo", num: 1 },
    ]
    const resultMap = {
        'HL': 'M', 'HM': 'H', 'HH': 'H',
        'ML': 'L', 'MM': 'M', 'LL': 'L',
        'LM': 'L', 'LH': 'M', 'MH': 'H' 
    };


    useEffect(() => {
        const key1 = [probabilidad, impacto].sort().join('');
        const value = resultMap[key1];
        setRiesgoVal(value || "");
    }, [probabilidad, impacto])

    const riesgoPromedio = useMemo(() => {
        const list = riesgosList || []; 
        if (list.length === 0) return null;
        const claveToNum = values.reduce((acc, val) => ({ ...acc, [val.clave]: val.num }), {});

        const totalNumValue = list.reduce((sum, item) => {
            const numValue = claveToNum[item.valor] || 0; 
            return sum + numValue;
        }, 0);

        const averageNum = totalNumValue / list.length;

        if (averageNum >= 2.5) return 'H'; 
        if (averageNum >= 1.5) return 'M'; 
        if (averageNum > 0) return 'L';    
        return null;
    }, [riesgosList, values]);

    const handleSubmit = (e) => {
        e.preventDefault()

        const riesgo = {
            descripcion: riesgosDesc,
            valor: riesgoVal,
            probabilidad,
            impacto,
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
        setRiesgoVal("");
        setProbabilidad("M");
        setImpacto("M");
    }

    const enableSubmit = () => {
        return riesgosDesc.length > 0 && riesgoVal.length > 0
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
        if (!ejecutado) return null;

        const responsable = getResponsableName(item.responsable_id);
        const fecha = item.fecha_realizacion
            ? new Date(item.fecha_realizacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'Pendiente';
        const completadoText = item.completado ? 'Cerrado' : 'Abierto';

        return (
            <div className="mt-1 p-1" style={{ borderTop: '1px dotted #ccc', fontSize: '0.8rem', backgroundColor: '#f9f9f9' }}>
                <Row>
                    <Col xs={4}> 
                        Plan: <span className="text-muted text-break" title={item.plan_descripcion}>{item.plan_descripcion || 'Pendiente'}</span>
                    </Col>
                    <Col xs={3}>
                        Fecha: <span className="text-muted">{fecha}</span>
                    </Col>
                    <Col xs={3}>
                        Resp.: <span className="text-muted">{responsable}</span>
                    </Col>
                    <Col xs={2} className="text-end">
                        <span className={`fw-bold ${item.completado ? 'text-success' : 'text-danger'}`}>{completadoText}</span>
                    </Col>
                </Row>
            </div>
        );
    };


    useEffect(() => {
        if (ejecutado) {
            onSummaryChange(riesgoPromedio);
        }
    }, [riesgoPromedio, ejecutado, onSummaryChange]);

    return (
        <div>
            {/* Modal para Plan de Respuesta */}
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

            <Form>
                {/* Formulario de Adición (Sin cambios en diseño) */}
                <Form.Row>
                    <Col xs={5}> {/* Reducimos a 5 para agregar columna */}
                        <Form.Label>Descripcion</Form.Label>
                        {!disabled && <Form.Control
                            autoComplete="off"
                            type="text"
                            value={riesgosDesc}
                            onChange={(e) => { setRiesgoDesc(e.target.value) }}
                        />}
                    </Col>
                    {/* ... (resto de Probabilidad e Impacto) */}
                    <Col xs={2}>
                        <Form.Label>Probabilidad</Form.Label>
                        {!disabled && <Form.Control as="select" size="sm" custom onChange={e => { setProbabilidad(e.target.value) }} value={probabilidad}>
                            {
                                values.map(
                                    (val, index) => (
                                        <option value={val.clave} key={index}>{val.valor.replace(/.$/, 'a')}</option>
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
                                        <option value={val.clave} key={idx}>{val.valor}</option>
                                    )
                                )
                            }
                        </Form.Control>}
                    </Col>
                    <Col xs={1}>
                        <Form.Label>Valor</Form.Label>
                        <InputGroup>
                            {!disabled && <CriticalBadgeFromText value={riesgoVal}></CriticalBadgeFromText>}
                        </InputGroup>
                    </Col>
                    <Col xs={2} className='d-flex align-items-end justify-content-end'>
                        {!disabled && <Button type="submit" disabled={!enableSubmit()} onClick={e => handleSubmit(e)}>Agregar</Button>}
                    </Col>
                </Form.Row>
            </Form>

            <div className={riesgosList?.length > 0 ? "mt-4" : ""}>
                {/* Cabecera de Riesgos */}
                <ListGroup horizontal className="fw-bold d-flex p-0 list-risk-header" style={{ borderBottom: '2px solid #ccc' }}>
                    <ListGroup.Item className="col-5">Descripción</ListGroup.Item>
                    <ListGroup.Item className="col-2 text-center">Prob.</ListGroup.Item>
                    <ListGroup.Item className="col-2 text-center">Impac.</ListGroup.Item>
                    <ListGroup.Item className="col-1 text-center">Valor</ListGroup.Item>
                    {ejecutado && <ListGroup.Item className="col-2 text-center">Plan Respuesta</ListGroup.Item>}
                </ListGroup>

                <ListGroup variant="flush">
                    {(riesgosList || []).map((item, index) => ( // Usamos `|| []` para robustez
                        <ListGroup.Item key={index} className='p-0'>
                            <div className='d-flex align-items-center p-2'>
                                <div className="col-5 text-break">{item.descripcion}</div>
                                <div className="col-2 text-center"><CriticalBadgeFromText value={item.probabilidad} femenize></CriticalBadgeFromText></div>
                                <div className="col-2 text-center"><CriticalBadgeFromText value={item.impacto}></CriticalBadgeFromText></div>
                                <div className="col-1 text-center"><CriticalBadgeFromText value={item.valor} /> </div>

                                {/* Columna de Plan de Respuesta (Punto 2) */}
                                {ejecutado && !disabled && (
                                    <div className="col-2 text-center pr-0">
                                        <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(item)}>
                                            Plan de Respuesta
                                        </Button>
                                    </div>
                                )}

                                {/* Botón Eliminar */}
                                <div className={`col-${ejecutado ? 1 : 2} text-end pr-0`}>
                                    {!disabled && <span className="bi bi-x-lg pull-end" style={{ cursor: 'pointer' }} onClick={() => deleteItemHandle(index)} ></span>}
                                </div>
                            </div>

                            {/* Información sutil del Plan de Respuesta (Punto 3) */}
                            {renderPlanInfo(item)}
                        </ListGroup.Item>
                    ))}

                    {/* Fila de Promedio de Riesgo (Punto 5) */}
                    {ejecutado && (riesgosList || []).length > 0 && (
                        <ListGroup.Item className='d-flex fw-bold p-2 total-risk-row'>
                            <div className="col-9 text-end">RIESGO PROMEDIO:</div>
                            <div className="col-1 text-center">
                                <CriticalBadgeFromText value={riesgoPromedio} />
                            </div>
                            <div className="col-2"></div> {/* Espacio para el botón de Plan de Respuesta */}
                        </ListGroup.Item>
                    )}

                </ListGroup>
            </div>
        </div>
    )
}

export default InputRiesgosList;