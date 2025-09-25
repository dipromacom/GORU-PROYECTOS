import React, { useState,useRef } from 'react';
import { Button, InputGroup, ListGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form'
import "./InputTextList.css"

const InputTextList = ({ list=[], setList,disabled=false}) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        //e.preventDefault();
        //e.stopPropagation();

        if (!list) list =[];
        setList([...list, inputValue.trim()]);
        setInputValue('');
        //inputRef.current.focus()
    };

    const deleteItemHandle =  (index) => {
        setList(list.filter((item, i) => i !== index));
    };

    const disableToAppend = (textToAppend)=>{
        return list?.length && list.includes(textToAppend.trim())
    }

    return (
        <div>
            {  !disabled && (<InputGroup>
                <Form.Control
                    autoComplete="off"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.target.value.length && e.key === 'Enter' && handleSubmit(e)}
                    ref={inputRef}
                />
                <InputGroup.Append>
                    <Button disabled={inputValue.length === 0 || disableToAppend(inputValue) } onClick={handleSubmit}>Agregar</Button>
                </InputGroup.Append>
            </InputGroup>)}
            <div className={list?.length > 0 ?"mt-2":""}>
                <ListGroup>
                    {list?.map((item, index) => (
                        <ListGroup.Item on key={index}>{item} { ! disabled && <span className="bi bi-x-lg pull-end" onClick={()=>deleteItemHandle(index)}></span>}</ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default InputTextList;