import { useState, useEffect, useCallback } from "react";
import { Form, ListGroup } from "react-bootstrap"

const InputCriteriosInput = ({criteriosList=[],setCriterioList = () => {}, disabled=false }) => {
    const [inputCriterios, setInputCriterios ] = useState(criteriosList)

    useEffect(() => {
        setInputCriterios(criteriosList)
    }, [criteriosList])

    const handleInputChages = useCallback((value, id) => {
        const updatedInputCriterio = [...inputCriterios]; // create a shallow copy of the state array
        updatedInputCriterio[id] = { ...inputCriterios[id], metrica: value };
        setInputCriterios(updatedInputCriterio);
    },[inputCriterios])


    const handleBlur = useCallback(() => {
        const finalCriteriosList = inputCriterios.map(item => ({
            ...item,
            completado: item.hasOwnProperty('completado') ? item.completado : false
        }));

        setCriterioList(finalCriteriosList);
    }, [inputCriterios, setCriterioList]);

   return (
    <div>
        <ListGroup>
        {
                inputCriterios.map((item,index)=>(
                    <ListGroup.Item key={index}>
                        <div>{item.entregable}</div>
                        <Form.Control
                                    disabled={disabled}
                                    autoComplete="off"
                                    type="text"
                                    as='textarea'
                                    value={item.metrica}
                                    onChange={e => handleInputChages(e.target.value,index)}
                                    onBlur={handleBlur}
                        ></Form.Control>
                    </ListGroup.Item>

                ))}
        </ListGroup>
    </div>
   )
}

export default InputCriteriosInput;
