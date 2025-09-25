import { useState, useEffect, useCallback } from "react";
import { Form, ListGroup } from "react-bootstrap"
/*import { Editor } from 'react-draft-wysiwyg';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";


const InputCriteriosInput = ({criteriosList=[],setCriterioList = () => {} }) => {
    const [inputCriterios, setInputCriterios ] = useState(criteriosList)

    useEffect(() => {
        setInputCriterios(criteriosList)
    }, [criteriosList, setInputCriterios])

    const handleInputChages = useCallback((value, id) => {
        const updatedInputCriterio = [...inputCriterios]; // create a shallow copy of the state array
        updatedInputCriterio[id] = { ...inputCriterios[id], criterio: value };
        setInputCriterios(updatedInputCriterio);
        //setCriterioList(updatedInputCriterio);
        //setInputCriterios(inputCriterios.map((item, i) => (item.criterio = i === id ? value : item.criterio)));
    },[inputCriterios])


    return (
        <Accordion>
            {
                inputCriterios.map((item,index)=>(
                    <Card key={index}>
                        <Accordion.Toggle as={Card.Header} eventKey={item}>{item.entregable}</Accordion.Toggle>
                        <Accordion.Collapse eventKey={item}>
                            <Editor
                                toolbarClassName="toolbarClassName"
                                wrapperClassName="wrapperClassName"
                                editorClassName="editorClassName"
                                editorState={item.metrica}
                                toolbar={
                                    {
                                        image:{
                                            urlEnabled: false,
                                            uploadEnabled: true,
                                        }
                                    }
                                }
                                onChange={e => {handleInputChages(e,index)}}
                            ></Editor>
                        </Accordion.Collapse>
                    </Card>
                ))
            }
        </Accordion>
    )
}*/

const InputCriteriosInput = ({criteriosList=[],setCriterioList = () => {}, disabled=false }) => {
    const [inputCriterios, setInputCriterios ] = useState(criteriosList)

    useEffect(() => {
        setInputCriterios(criteriosList)
    }, [criteriosList])

    const handleInputChages = useCallback((value, id) => {
        const updatedInputCriterio = [...inputCriterios]; // create a shallow copy of the state array
        updatedInputCriterio[id] = { ...inputCriterios[id], metrica: value };
        setInputCriterios(updatedInputCriterio);
        //setCriterioList(updatedInputCriterio);
        //setInputCriterios(inputCriterios.map((item, i) => (item.criterio = i === id ? value : item.criterio)));
    },[inputCriterios])


    const handleBlur = useCallback(() => {
        // Update criteriosList only when the user finishes editing
        setCriterioList(inputCriterios);
    }, [inputCriterios, setCriterioList]);


    /*return (
        inputCriterios.length > 0 &&
        (<Accordion defaultActiveKey={activeKey} onSelect={handleAccordionToggle}>
            {
                inputCriterios.map((item,index)=>(
                    <Card key={index}>
                        <Accordion.Toggle as={Card.Header} eventKey={index}>{item.entregable}</Accordion.Toggle>
                        <Accordion.Collapse eventKey={index}>
                        <Form.Control
                                    autoFocus
                                    autoComplete="off"
                                    type="text"
                                    as='textarea'
                                    value={item.metrica}
                                    onChange={e => handleInputChages(e.target.value,index)}
                                    onBlur={handleBlur}
                        ></Form.Control>
                        </Accordion.Collapse>
                    </Card>
                ))
            }
        </Accordion>)
    )*/
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
