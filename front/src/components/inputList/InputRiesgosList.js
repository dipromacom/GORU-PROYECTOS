/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Col, Form, ListGroup, Button, InputGroup } from "react-bootstrap"
import { CriticalBadgeFromText } from "../badge/Badge";


const InputRiesgosList = ({ riesgosList = [], setRiesgosList = () => { } , disabled = false}) => {
    const [riesgosDesc, setRiesgoDesc] = useState("")
    const [riesgoVal, setRiesgoVal] = useState("")
    const [probabilidad, setProbabilidad] = useState("M")
    const [impacto, setImpacto] = useState("M")
    const values = [
        {clave: "H", valor: "Alto"},
        {clave: "M", valor: "Medio"},
        {clave: "L", valor: "Bajo"},
    ]
    const resultMap = {
        'HL': 'M',
        'HM': 'H',
        'HH': 'H', 
        'ML': 'L',
        'MM': 'M',
        'LL': 'L'   
      };

    useEffect(()=>{
        const key1 = [probabilidad, impacto].sort().join('');
        const key2 = [probabilidad, impacto].reverse().join('');
        const value = resultMap[key1] || resultMap[key2];
        //const key = [probabilidad,impacto].sort().join('')
        setRiesgoVal(value)
    },[probabilidad,impacto])

    const handleSubmit=(e)=>{
        e.preventDefault()
        const riesgo = {descripcion: riesgosDesc, valor: riesgoVal, probabilidad, impacto }

        if (!riesgosList) riesgosList = []
        const newList = [...riesgosList, riesgo]
        setRiesgosList(newList)
        resetFields()
    }

    const resetFields = ()=>{
        setRiesgoDesc("");
        setRiesgoVal("");
        setProbabilidad("M");
        setImpacto("M");
    } 

    const enableSubmit = ()=>{
        return riesgosDesc.length > 0 && riesgoVal.length > 0  && probabilidad.length > 0 && impacto.length > 0
    }

    const deleteItemHandle = (index) => {
        setRiesgosList(riesgosList.filter((item, i) => i !== index));
    };

    return (
        <div>
            <Form>
                <Form.Row>
                    <Col xs={6}>
                        <Form.Label>Descripcion</Form.Label>
                        { !disabled && <Form.Control
                            autoComplete="off"
                            type="text"
                            value={riesgosDesc}
                            onChange={(e) => {
                                e.preventDefault();
                                setRiesgoDesc(e.target.value)
                            }}
                        />}
                    </Col>
                    <Col xs={2}>
                        <Form.Label>Probabilidad</Form.Label>
                        { !disabled && <Form.Control as="select" size="sm" placeholder="probabilidad" custom onChange={e => {setProbabilidad(e.target.value)} } value={probabilidad}>
                            {
                                values.map(
                                     (val,index) => (
                                        <option value={val.clave} key={index}>{val.valor.replace(/.$/, 'a')}</option>
                                     )   
                                )
                            }
                        </Form.Control>}
                    </Col>
                    <Col xs={2}>
                        <Form.Label>Impacto</Form.Label>
                        { !disabled && <Form.Control as="select" size="sm" placeholder="impacto" custom onChange={e => {setImpacto(e.target.value)} } value={impacto}>
                          {
                                values.map(
                                     (val,idx) => (
                                        <option value={val.clave} key={idx}>{val.valor}</option>
                                     )   
                                )
                            }
                        </Form.Control>}
                    </Col>
                    <Col xs={1}>
                        <Form.Label>Valor</Form.Label>
                        <InputGroup>
                        {/* <InputGroup.Prepend>
                            <InputGroup.Text></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            autoComplete="off"
                            type="text"
                            value={riesgoVal}
                            onChange={e => regexValidator(e, /^([0-9]|[1-9][0-9]|100)$/g, value => setRiesgoVal(value))}
                        /> */}
                        { !disabled && <CriticalBadgeFromText value={riesgoVal}></CriticalBadgeFromText> }
                        </InputGroup>
                    </Col>
                    <Col className='d-flex align-items-end justify-content-end'>
                        { !disabled && <Button type="submit" disabled={!enableSubmit()} onClick={e => handleSubmit(e) }>Agregar</Button> }
                    </Col>
                </Form.Row>
            </Form>

            <div className={riesgosList?.length > 0 ? "mt-2" : ""}>
                <ListGroup>
                    {riesgosList?.map((item, index) => (
                        <ListGroup.Item on key={index} className='d-flex'>
                            <div className="col-6 text-break">{item.descripcion}</div>
                            <div className="col-2"><CriticalBadgeFromText value={item.probabilidad} femenize></CriticalBadgeFromText></div>
                            <div className="col-2"><CriticalBadgeFromText value={item.impacto}></CriticalBadgeFromText></div>
                            <div className="col-1"><CriticalBadgeFromText value={item.valor}/> </div>
                            <div className="col-1 pr-0">
                                { !disabled && <span className="bi bi-x-lg pull-end" onClick={() => deleteItemHandle(index)} ></span>}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    )
}

export default InputRiesgosList;
