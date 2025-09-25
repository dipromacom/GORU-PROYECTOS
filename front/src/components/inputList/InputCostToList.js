import React, { useEffect, useState } from 'react';
import { InputGroup, ListGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form'
import "./InputTexListWithDate.css"
import regexValidator from "../../libs/regexValidator";
import "./InputCostToList.css"


const InputCostToList = ({ costoList = [], setResultCostoList = () => { }, disabled=false }) => {
    const [inputCosts, setInputCosts] = useState(costoList)

    useEffect(() => {
        setInputCosts(costoList)
    }, [costoList, setInputCosts])

    const handleInputChages = ( value,id) => {
        const updatedInputCosts = [...inputCosts]; // create a shallow copy of the state array
        updatedInputCosts[id] = { ...updatedInputCosts[id], costo: value };
        setInputCosts(updatedInputCosts);
        setResultCostoList(updatedInputCosts);
    }

    const calculateTotalCost = () => {
        let total = 0
        inputCosts.forEach((cost) => {
            total += parseFloat(cost.costo ||0)
        });
        return total
    }

    return (
        <div>
            <ListGroup>
                {inputCosts.map((item, index) => (
                    <ListGroup.Item className='d-flex' key={index}>
                        <div className="col-9 text-break">{item.entregable}</div>
                        <div className="col-3 pr-0">
                            <InputGroup>
                                <InputGroup.Prepend>
                                    <InputGroup.Text><strong>$</strong></InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    disabled={disabled}
                                    className='input-cost-list'
                                    key={index}
                                    autoComplete="off"
                                    type="text"
                                    value={item.costo}
                                    onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, value => handleInputChages(value,index))}
                                />
                            </InputGroup>
                        </div>
                    </ListGroup.Item>
                ))}
                {
                    inputCosts.length > 0 && (
                        <ListGroup.Item className='d-flex'>
                            <div className="col-9 text-break">TOTAL</div>
                            <div className="col-3 pr-0">
                                <InputGroup>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text><strong>$</strong></InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control
                                        className='input-cost-list'
                                        autoComplete="off"
                                        type="text"
                                        value={
                                            calculateTotalCost()
                                        }
                                        plaintext
                                        readOnly
                                    />
                                </InputGroup>
                            </div>
                        </ListGroup.Item>)
                }
            </ListGroup>

        </div>
    )
}

export default InputCostToList;