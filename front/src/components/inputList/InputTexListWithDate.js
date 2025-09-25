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


    const totalDuration = (date) => {
        if (list?.length > 0) {
            const firstDateInList = list[0].date
            const duration = moment(date).diff(firstDateInList, 'days')
            return duration
        } else {
            return 0
        }

    }


    const handleSubmit = (e) => {
        e.preventDefault()
        if (totalDuration(date) <= duration) {
            if (!list) list =[];
            let listTemp = [...list, { description, date }]
            setList(listTemp.sort((a, b) => {
                return new Date(a.date) - new Date(b.date)
            }));
        } else {
            setShowAlert(true)
            setTimeout(() => {
                setShowAlert(false)
            }, 5000)
        }
        setDescription('');
        setDate('')
    };

    const deleteItemHandle = (index) => {
        setList(list.filter((item, i) => i !== index));
    };

    return (
        <div>
            <Form>
                { !disabled && (<Form.Row>
                    <Col xs={6}>
                        <Form.Control
                            placeholder='Descripción'
                            autoFocus
                            autoComplete="off"
                            type="text"
                            value={description}
                            onChange={(e) => {
                                e.preventDefault();
                                setDescription(e.target.value)
                            }}
                        />
                    </Col>
                    <Col className="input-text-list" xs={5}>
                        <SingleDatePicker
                            placeholder='Ingrese La fecha'
                            block={true}
                            date={date} // momentPropTypes.momentObj or null
                            onDateChange={date => setDate(date)} // PropTypes.func.isRequired
                            focused={focus} // PropTypes.bool
                            onFocusChange={({ focused }) => { setFocus(focused) }} // PropTypes.func.isRequired
                            id={`component-${uuidv4()}`} // PropTypes.string.isRequired,
                            style={{
                                fontFamily: 'Open Sans, sans-serif',
                            }}
                        />
                    </Col>
                    <Col className='d-flex flex-row-reverse'>
                        <Button type="submit" disabled={description.length === 0 || !moment(date).isValid()} onClick={handleSubmit}>Agregar</Button>
                    </Col>
                </Form.Row>)}
                {
                    showAlert &&
                    <Form.Row>
                        <div className='m-1 d-flex w-100'>
                            <Alert variant='danger' className='flex-fill mb-0'>No se pueden añadir fechas que sobrepasen la duración del proyecto</Alert>
                        </div>
                    </Form.Row>

                }
            </Form>

            <div className={list?.length > 0 ? "mt-2" : ""}>
                <ListGroup>
                    {list?.map((item, index) => (
                        <ListGroup.Item on key={index} className='d-flex'>
                            <div className="col-9 text-break">{item.description}</div>
                            <div className="col-3 pr-0" style={{ borderLeft: '1pt solid rgba(0,0,0,0.2)' }}>
                                <i className='bi bi-calendar' style={
                                    { paddingLeft: "5px", paddingRight: "5px" }
                                }></i>
                                {moment(item.date).locale('es').format('LL')}
                                { !disabled && <span className="bi bi-x-lg pull-end" onClick={() => deleteItemHandle(index)} ></span>}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default InputTextListWithDate;