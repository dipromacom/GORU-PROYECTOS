import React, { useState } from 'react';
import { Alert, Button, Col, ListGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form'
import { SingleDatePicker } from 'react-dates';
import "./InputTexListWithDate.css"
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const InputTextListWithDate = ({ list, setList, duration = 0, disabled=false }) => {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [focus, setFocus] = useState(false)
    const [showAlert, setShowAlert] = useState(false)

    // NUEVA FUNCIÓN: Manejar edición de fecha en un hito existente
    const handleEditDate = (index, newDate) => {
        const updatedList = list.map((item, i) =>
            i === index ? { ...item, date: newDate } : item
        );
        setList(updatedList);
    };

    /*const totalDuration = (date) => {
        if (list?.length > 0) {
            const firstDateInList = list[0].date
            const duration = moment(date).diff(firstDateInList, 'days')
            return duration
        } else {
            return 0
        }

    }*/


    const handleSubmit = (e) => {
        e.preventDefault()
        /*
        if (totalDuration(date) <= duration) {
            if (!list) list =[];
            let listTemp = [...list, { description, date, completado: false }]
            setList(listTemp.sort((a, b) => {
                return new Date(a.date) - new Date(b.date)
            }));
        } else {
            setShowAlert(true)
            setTimeout(() => {
                setShowAlert(false)
            }, 5000)
        }
        */
        // Nueva lógica sin restricción de duración
        if (!list) list = [];
        let listTemp = [...list, { description, date, completado: false }]
        setList(listTemp.sort((a, b) => {
            return new Date(a.date) - new Date(b.date)
        }));
        setDescription('');
        setDate('')
    };

    const deleteItemHandle = (index) => {
        setList(list.filter((item, i) => i !== index));
    };

    return (
        <div>
            {/* Formulario de agregar (se mantiene igual) */}
            <Form>
                {!disabled && (
                    <Form.Row>
                        <Col xs={6}>
                            <Form.Control
                                placeholder='Descripción'
                                autoComplete="off"
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Col>
                        <Col className="input-text-list" xs={5}>
                            <SingleDatePicker
                                placeholder='Fecha'
                                block={true}
                                date={date}
                                onDateChange={date => setDate(date)}
                                focused={focus}
                                onFocusChange={({ focused }) => setFocus(focused)}
                                id={`new-hito-${uuidv4()}`}
                            />
                        </Col>
                        <Col className='d-flex flex-row-reverse'>
                            <Button type="submit" disabled={description.length === 0 || !moment(date).isValid()} onClick={handleSubmit}>Agregar</Button>
                        </Col>
                    </Form.Row>
                )}
            </Form>

            <div className={list?.length > 0 ? "mt-3" : ""}>
                <ListGroup>
                    {list?.map((item, index) => (
                        <ListGroup.Item key={index} className='d-flex align-items-center py-2'>
                            <div className="col-7 text-break fw-bold">{item.description}</div>
                            <div className="col-5 d-flex align-items-center justify-content-end">
                                {!disabled ? (
                                    // CAMBIO: Input editable para la fecha
                                    <Form.Control
                                        type="date"
                                        size="sm"
                                        style={{ width: '150px' }}
                                        value={item.date ? moment(item.date).format('YYYY-MM-DD') : ''}
                                        onChange={(e) => handleEditDate(index, e.target.value)}
                                    />
                                ) : (
                                    <span className="small">
                                        <i className='bi bi-calendar me-2'></i>
                                        {item.date ? moment(item.date).locale('es').format('LL') : 'Sin fecha'}
                                    </span>
                                )}

                                {!disabled && (
                                    <i
                                        className="bi bi-trash text-danger ms-3 cursor-pointer"
                                        onClick={() => deleteItemHandle(index)}
                                    ></i>
                                )}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default InputTextListWithDate;