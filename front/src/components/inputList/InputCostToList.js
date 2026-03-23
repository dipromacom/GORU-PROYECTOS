import React, { useEffect, useState } from 'react';
import { InputGroup, ListGroup, Form, Modal, Button, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import "./InputCostToList.css";

const InputCostToList = ({ costoList = [], setResultCostoList, disabled, ejecutado, cerrado, regexValidator }) => {
    const [focusedKey, setFocusedKey] = useState(null);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [closingDate, setClosingDate] = useState(moment().format('YYYY-MM-DD'));

    const unformatToNumber = (value) => {
        if (!value || value === "") return "0";
        let str = value.toString().trim();
        if (str.includes(',')) return str.replace(/\./g, '').replace(',', '.');
        return str;
    };

    const formatToEcuador = (number) => {
        const val = unformatToNumber(number);
        const parsed = parseFloat(val);
        if (isNaN(parsed)) return '0,00';
        return new Intl.NumberFormat('es-EC', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(parsed);
    };

    const handleCostChanges = (value, id, field) => {
        const updated = [...costoList];
        updated[id] = { ...updated[id], [field]: value };
        setResultCostoList(updated);
    };

    const handleCheckboxChange = (index) => {
        if (costoList[index].completado) {
            const updated = [...costoList];
            updated[index] = { ...updated[index], completado: false, fecha_cerrado: null };
            setResultCostoList(updated);
        } else {
            setSelectedIndex(index);
            setClosingDate(moment().format('YYYY-MM-DD'));
            setShowCloseModal(true);
        }
    };

    const confirmClose = () => {
        const updated = [...costoList];
        updated[selectedIndex] = {
            ...updated[selectedIndex],
            completado: true,
            fecha_cerrado: closingDate
        };
        setResultCostoList(updated);
        setShowCloseModal(false);
    };

    return (
        <div className="input-cost-list-container border rounded p-3 bg-light">
            {/* Header */}
            <div className="d-flex fw-bold pb-2 border-bottom mb-2 text-muted small">
                <div className="col-5">ENTREGABLE {(ejecutado || cerrado) && "/ DEADLINE"}</div>
                <div className={ejecutado || cerrado ? "col-3 text-center" : "col-7 text-center"}>COSTO EST.</div>
                {(ejecutado || cerrado) && <div className="col-3 text-center ml-2">COSTO REAL</div>}
                {ejecutado && <div className="col-1 text-center">FIN</div>}
            </div>

            <ListGroup variant="flush">
                {costoList.map((item, index) => (
                    <ListGroup.Item key={index} className="px-0 py-2 bg-transparent">
                        <Row className="align-items-center no-gutters">
                            <Col xs={5}>
                                <div className="text-dark fw-bold">{item.entregable}</div>
                                {/* 1. Condicional para mostrar deadline solo en ejecución/cierre */}
                                {(ejecutado || cerrado) && (
                                    <div className="text-muted small">
                                        <i className="far fa-calendar-alt mr-1"></i>
                                        Vence: {item.deadline ? moment(item.deadline).format('DD/MM/YYYY') : 'S/D'}
                                        {item.completado && (
                                            <span className="text-success ml-2 font-weight-bold">
                                                ✓ {moment(item.fecha_cerrado).format('DD/MM/YY')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Col>

                            <Col xs={ejecutado || cerrado ? 3 : 6}>
                                <InputGroup className="p-2">
                                    <Form.Control
                                        disabled={disabled || ejecutado || cerrado}
                                        className="text-right"
                                        value={focusedKey === `${index}-costo` ? item.costo : formatToEcuador(item.costo)}
                                        onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, v => handleCostChanges(v, index, 'costo'))}
                                        onFocus={() => setFocusedKey(`${index}-costo`)}
                                        onBlur={() => setFocusedKey(null)}
                                    />
                                </InputGroup>
                            </Col>

                            {(ejecutado || cerrado) && (
                                <Col xs={3}>
                                    <InputGroup className="p-2">
                                        <Form.Control
                                            disabled={disabled || item.completado || cerrado}
                                            className="text-right"
                                            value={focusedKey === `${index}-costoReal` ? item.costoReal : formatToEcuador(item.costoReal)}
                                            onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, v => handleCostChanges(v, index, 'costoReal'))}
                                            onFocus={() => setFocusedKey(`${index}-costoReal`)}
                                            onBlur={() => setFocusedKey(null)}
                                        />
                                    </InputGroup>
                                </Col>
                            )}
                            {(ejecutado || cerrado) && (
                                <Col xs={1} className="d-flex justify-content-center align-items-center">
                                    <Form.Check
                                        type="checkbox"
                                        checked={item.completado || false}
                                        onChange={() => handleCheckboxChange(index)}
                                        disabled={disabled || !ejecutado}
                                    />
                                </Col>
                            )}
                        </Row>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Finalizar Tarea de Costo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="small">¿En qué fecha se completó el entregable: <strong>{costoList[selectedIndex]?.entregable}</strong>?</p>
                    <Form.Group>
                        <Form.Label className="small fw-bold">FECHA DE CIERRE:</Form.Label>
                        <Form.Control
                            type="date"
                            value={closingDate}
                            onChange={(e) => setClosingDate(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => setShowCloseModal(false)}>Cancelar</Button>
                    <Button variant="primary" size="sm" onClick={confirmClose}>Confirmar Cierre</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InputCostToList;