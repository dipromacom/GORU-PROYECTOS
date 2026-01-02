import React, { useEffect, useState, useMemo } from 'react';
import { InputGroup, ListGroup, Col, Row } from 'react-bootstrap';
import Form from 'react-bootstrap/Form'
import "./InputTexListWithDate.css"
import regexValidator from "../../libs/regexValidator";
import "./InputCostToList.css"


const InputCostToList = ({ costoList = [], setResultCostoList = () => { }, disabled = false, ejecutado }) => {
    const [inputCosts, setInputCosts] = useState(costoList)
    const [focusedKey, setFocusedKey] = useState(null); // Para trackear foco por índice y campo

    const unformatToNumber = (value) => {
        if (!value || value === "") return "0";
        let str = value.toString().trim();
        if (str.includes(',')) {
            return str.replace(/\./g, '').replace(',', '.');
        }
        const dots = (str.match(/\./g) || []).length;
        if (dots > 1) return str.replace(/\./g, '');
        return str;
    };

    useEffect(() => {
        if (ejecutado && costoList.length > 0) {
            const transformedList = costoList.map(item => ({
                ...item,
                //costoReal: item.costoReal || (item.costo || '0'),
                costoReal: item.costoReal || '0',
            }));
            setInputCosts(transformedList);
        } else {
            setInputCosts(costoList);
        }
    }, [costoList, ejecutado])

    const handleCostChanges = (value, id, field) => {
        const updatedInputCosts = [...inputCosts];
        updatedInputCosts[id] = { ...updatedInputCosts[id], [field]: value };
        setInputCosts(updatedInputCosts);
        setResultCostoList(updatedInputCosts);
    }

    const handleBlur = (value, index, field) => {
        // CORRECCIÓN: Al salir guardamos el número limpio en el estado
        handleCostChanges(unformatToNumber(value), index, field);
        setFocusedKey(null);
    }

    const handleFocus = (value, index, field) => {
        handleCostChanges(unformatToNumber(value), index, field);
        setFocusedKey(`${index}-${field}`);
    }

    const calculateTotalCost = (field = 'costo') => {
        let total = 0;
        inputCosts.forEach((cost) => {
            const val = parseFloat(unformatToNumber(cost[field]) || 0);
            total += val;
        });
        return total;
    };

    // Cálculo total estimado
    const totalCostoEstimado = useMemo(() => calculateTotalCost('costo'), [inputCosts]);
    // Cálculo total real
    const totalCostoReal = useMemo(() => calculateTotalCost('costoReal'), [inputCosts]);


    const renderCostHeader = () => (
        <div className="d-flex fw-bold list-cost-header">
            <div className="col-6">Entregable</div>
            <div className={ejecutado ? "col-3 text-center" : "col-6 text-center"}>Costo Est.</div>
            {ejecutado && <div className="col-3 text-center">Costo Real</div>}
        </div>
    );

    const formatToEcuador = (number) => {
        const val = unformatToNumber(number);
        const parsed = parseFloat(val);
        if (isNaN(parsed)) return '0,00';
        return new Intl.NumberFormat('es-EC', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(parsed);
    };

    // Función para renderizar una fila de costo
    const renderCostRow = (item, index) => (
        <ListGroup.Item className='d-flex p-2' key={index}>
            <div className="col-6 text-break">{item.entregable}</div>

            {/* Costo Estimado (Col 3 o 6) */}
            <div className={ejecutado ? "col-3 pr-0" : "col-6 pr-0"}>
                <InputGroup size="sm" className="input-cost-item">
                    <InputGroup.Prepend>
                        <InputGroup.Text><strong>$</strong></InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                        disabled={disabled || ejecutado}
                        className='input-cost-list'
                        autoComplete="off"
                        type="text"
                        // Condicional de visualización
                        value={focusedKey === `${index}-costo` ? item.costo : formatToEcuador(item.costo)}
                        onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, value => handleCostChanges(value, index, 'costo'))}
                        onBlur={(e) => handleBlur(e.target.value, index, 'costo')}
                        onFocus={(e) => handleFocus(e.target.value, index, 'costo')}
                    />
                </InputGroup>
            </div>

            {/* Costo Real (Col 3 - solo si ejecutado) */}
            {ejecutado && (
                <div className="col-3 pr-0">
                    <InputGroup size="sm" className="input-cost-item">
                        <InputGroup.Prepend>
                            <InputGroup.Text><strong>$</strong></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            disabled={disabled}
                            className='input-cost-list'
                            autoComplete="off"
                            type="text"
                            value={focusedKey === `${index}-costoReal` ? item.costoReal : formatToEcuador(item.costoReal)}
                            onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, value => handleCostChanges(value, index, 'costoReal'))}
                            onBlur={(e) => handleBlur(e.target.value, index, 'costoReal')}
                            onFocus={(e) => handleFocus(e.target.value, index, 'costoReal')}
                        />
                    </InputGroup>
                </div>
            )}
        </ListGroup.Item>
    );

    // Función para renderizar la fila de totales
    const renderTotalRow = () => (
        <ListGroup.Item className='d-flex fw-bold p-2 total-cost-row'>
            {/* Total Label (Col 6) */}
            <div className="col-6 text-break">TOTAL ENTREGABLES</div>

            {/* Total Costo Estimado (Col 3 o 6) */}
            <div className={ejecutado ? "col-3 pr-0" : "col-6 pr-0"}>
                <InputGroup size="sm" className="input-cost-item">
                    <InputGroup.Prepend>
                        <InputGroup.Text><strong>$</strong></InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                        className='input-cost-list'
                        type="text"
                        value={formatToEcuador(totalCostoEstimado)}
                        plaintext
                        readOnly
                    />
                </InputGroup>
            </div>

            {/* Total Costo Real (Col 3 - solo si ejecutado) */}
            {ejecutado && (
                <div className="col-3 pr-0">
                    <InputGroup size="sm" className="input-cost-item">
                        <InputGroup.Prepend>
                            <InputGroup.Text><strong>$</strong></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            className='input-cost-list'
                            type="text"
                            value={formatToEcuador(totalCostoReal)}
                            plaintext
                            readOnly
                        />
                    </InputGroup>
                </div>
            )}
        </ListGroup.Item>
    );

    return (
        <div className="input-cost-list-container">
            {renderCostHeader()}
            <ListGroup variant="flush">
                {inputCosts.map((item, index) => renderCostRow(item, index))}
                {inputCosts.length > 0 && renderTotalRow()}
            </ListGroup>
        </div>
    )
}

export default InputCostToList;