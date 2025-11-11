// InputTextList.js (Para estados creado, iniciado, planificado)

import React, { useState, useRef } from 'react';
import { Button, InputGroup, ListGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form'
import "./InputTextList.css"

const InputTextList = ({ list = [], setList, disabled = false }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    // En los estados no-ejecutados, list es un array de strings
    const currentListNames = Array.isArray(list) && list.length > 0 && typeof list[0] === 'string'
        ? list
        : Array.isArray(list) && list.length > 0 && typeof list[0] === 'object' && list[0].hasOwnProperty('nombre')
            ? list.map(item => item.nombre) // Obtenemos solo los nombres si es array de objetos (ejecutado)
            : [];

    const handleSubmit = (e) => {
        //e.preventDefault();
        //e.stopPropagation();

        if (!currentListNames) currentListNames = [];
        // En este componente siempre agregamos un string, ya que solo se usa en estados no-ejecutados.
        setList([...currentListNames, inputValue.trim()]);
        setInputValue('');
        //inputRef.current.focus()
    };

    const deleteItemHandle = (index) => {
        setList(currentListNames.filter((item, i) => i !== index));
    };

    const disableToAppend = (textToAppend) => {
        return currentListNames?.length && currentListNames.includes(textToAppend.trim())
    }

    return (
        <div>
            {!disabled && (<InputGroup>
                <Form.Control
                    autoComplete="off"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.target.value.length && e.key === 'Enter' && handleSubmit(e)}
                    ref={inputRef}
                />
                <InputGroup.Append>
                    <Button disabled={inputValue.length === 0 || disableToAppend(inputValue)} onClick={handleSubmit}>Agregar</Button>
                </InputGroup.Append>
            </InputGroup>)}
            <div className={currentListNames?.length > 0 ? "mt-2" : ""}>
                <ListGroup>
                    {currentListNames?.map((item, index) => (
                        <ListGroup.Item on key={index}>{item} {!disabled && <span className="bi bi-x-lg pull-end" onClick={() => deleteItemHandle(index)}></span>}</ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default InputTextList;