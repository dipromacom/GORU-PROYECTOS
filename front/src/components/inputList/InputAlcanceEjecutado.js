// InputAlcanceEjecutado.js (Nuevo componente para estado ejecutado)

import React, { useState, useRef } from 'react';
// Se añade Col y Row para el layout de columnas
import { Button, InputGroup, ListGroup, Form, Row, Col } from 'react-bootstrap';
import "./InputTextList.css";

const InputAlcanceEjecutado = ({ alcanceEntregables, setAlcanceEntregables, editMode }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    // Obtener solo los nombres de los entregables para validación
    const currentListNames = alcanceEntregables.map(item => item.nombre);

    const handleSubmit = (e) => {
        //e.preventDefault();
        //e.stopPropagation();

        if (inputValue.trim() === '' || currentListNames.includes(inputValue.trim())) return;

        // Crear el nuevo entregable en el formato de objeto
        const newEntregable = {
            nombre: inputValue.trim(),
            completado: false,
            fecha_entregable: null
        };

        setAlcanceEntregables([...alcanceEntregables, newEntregable]);
        setInputValue('');
        //inputRef.current.focus()
    };

    const deleteItemHandle = (index) => {
        setAlcanceEntregables(alcanceEntregables.filter((item, i) => i !== index));
    };

    const handleCheckboxChange = (index) => {
        const item = alcanceEntregables[index];
        const newCompletado = !item.completado;

        // 1. Si se va a marcar como COMPLETADO (true), pedimos confirmación
        if (newCompletado) {
            const isConfirmed = window.confirm(
                `¿Está seguro que desea cerrar y dar por finalizado el alcance: "${item.nombre}"?`
            );

            if (!isConfirmed) {
                return; // Si el usuario cancela, no hacemos nada
            }
        }
        
        const now = new Date().toISOString();
        const updatedList = alcanceEntregables.map((item, i) => {
            if (i === index) {
                const newCompletado = !item.completado;
                return {
                    ...item,
                    completado: newCompletado,
                    // Establecer la fecha si se completa, o null si se desmarca
                    fecha_entregable: newCompletado ? now : null
                };
            }
            return item;
        });

        setAlcanceEntregables(updatedList);
    };

    const disableToAppend = (textToAppend) => {
        return currentListNames?.length && currentListNames.includes(textToAppend.trim())
    }

    return (
        <div className="input-text-list">
            {editMode && (<InputGroup className="mb-3">
                <Form.Control
                    autoComplete="off"
                    type="text"
                    placeholder="Nuevo Entregable"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.target.value.length && e.key === 'Enter' && handleSubmit(e)}
                    ref={inputRef}
                />
                <InputGroup.Append>
                    <Button disabled={inputValue.length === 0 || disableToAppend(inputValue)} onClick={handleSubmit}>Agregar</Button>
                </InputGroup.Append>
            </InputGroup>)}

            <div className={alcanceEntregables?.length > 0 ? "mt-2" : ""}>
                {/* Cabecera para el estado ejecutado */}
                <Row className="alcance-header fw-bold">
                    <Col xs={8} md={9} lg={9}>Entregable</Col> {/* 70% del espacio para el nombre */}
                    <Col xs={4} md={3} lg={3} className="text-center">Finalizado</Col> {/* 30% del espacio para el check y eliminar */}
                </Row>

                <ListGroup variant="flush">
                    {alcanceEntregables?.map((item, index) => (
                        <ListGroup.Item key={index} className="ps-0 pe-0">
                            <Row className="alcance-row align-items-center">
                                {/* Columna 70% - Nombre y Eliminar */}
                                <Col xs={8} md={9} lg={9}>
                                    <Row className="align-items-center">
                                        <Col xs={10} className="item-content">
                                            {/* Corrección de asteriscos: Eliminamos ** */}
                                            <span style={{ textDecoration: item.completado ? 'line-through' : 'none', fontWeight: 'bold' }}>
                                                {item.nombre}
                                            </span>
                                        </Col>
                                        <Col xs={2} className="text-end item-actions">
                                            {/* Botón de eliminar */}
                                            {editMode && (
                                                <span
                                                    className="bi bi-x-lg delete-btn text-danger"
                                                    onClick={() => deleteItemHandle(index)}
                                                    title="Eliminar Entregable"
                                                ></span>
                                            )}
                                        </Col>
                                    </Row>
                                </Col>

                                {/* Columna 30% - Checkbox */}
                                <Col xs={4} md={3} lg={3} className="text-center">
                                    <Form.Check
                                        type="checkbox"
                                        checked={item.completado}
                                        disabled={!editMode}
                                        onChange={() => handleCheckboxChange(index)}
                                        inline // Para que el checkbox se centre mejor
                                    />
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default InputAlcanceEjecutado;