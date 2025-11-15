import React from "react";
import { Form, ProgressBar } from "react-bootstrap"; // Se añade ProgressBar
import InputTextList from "./InputTextList";
import InputAlcanceEjecutado from "./InputAlcanceEjecutado"; // Crearemos este nuevo componente
import { useEffect, useState, useMemo } from 'react';

// Función auxiliar para verificar el formato (solo si es array de objetos)
const isNewFormat = (alcanceEntregables) =>
    Array.isArray(alcanceEntregables) &&
    alcanceEntregables.length > 0 &&
    typeof alcanceEntregables[0] === 'object' &&
    alcanceEntregables[0] !== null &&
    alcanceEntregables[0].hasOwnProperty('nombre');

// Función auxiliar para transformar del formato antiguo al nuevo (Punto 4)
const transformToNewFormat = (alcanceEntregables) => {
    const now = new Date().toISOString(); // Usamos la fecha actual para la conversión inicial

    return alcanceEntregables.map(nombre => ({
        nombre: nombre,
        completado: false, // Por defecto, es false
        fecha_entregable: null // Por defecto, es null
    }));
};

const InputAlcanceList = ({ alcanceEntregables, setAlcanceEntregables, editMode, ejecutado, onSummaryChange = () => { } }) => {

    const totalAlcances = alcanceEntregables?.length || 0;
    const completados = (isNewFormat(alcanceEntregables) ? alcanceEntregables.filter(a => a.completado).length : 0);
    const porcentajeCompletado = totalAlcances > 0 ? Math.round((completados / totalAlcances) * 100) : 0;

    useEffect(() => {
        if (ejecutado) {
            onSummaryChange('alcance', porcentajeCompletado);
        }
    }, [porcentajeCompletado, ejecutado, onSummaryChange]);


    useEffect(() => {
        if (ejecutado && alcanceEntregables?.length > 0 && !isNewFormat(alcanceEntregables)) {
            const newAlcances = transformToNewFormat(alcanceEntregables);
            // Llama al setter del padre
            setAlcanceEntregables(newAlcances);
        }
    }, [ejecutado, alcanceEntregables, setAlcanceEntregables]); // setAlcanceEntregables debe estar en las dependencias


    if (!(alcanceEntregables?.length > 0 || editMode)) return null;
    if (ejecutado && alcanceEntregables?.length > 0 && !isNewFormat(alcanceEntregables)) {
        return null;
    }

    if (ejecutado && isNewFormat(alcanceEntregables)) {
        return (
            <div className="alcance-container">
                <h3>Alcance del Proyecto</h3>
                <div className="mb-3">
                    <Form.Label>Progreso de Entregables: <span className="fw-bold">{porcentajeCompletado}%</span></Form.Label><br></br>
                    <Form.Label><span className="fw-bold">Fórmula: (entregables_finalizados / total_entregables) * 100 </span></Form.Label>
                    <ProgressBar now={porcentajeCompletado} label={`${porcentajeCompletado}%`} />
                </div>

                <InputAlcanceEjecutado
                    alcanceEntregables={alcanceEntregables}
                    setAlcanceEntregables={setAlcanceEntregables}
                    editMode={editMode}
                />
            </div>
        );
    }

    return (
        <div className="alcance-container">
            <h3>Alcance del Proyecto</h3>
            <Form.Group controlId="principales-entregables">
                <Form.Label>Principales Entregables</Form.Label>
                <InputTextList
                    disabled={!editMode}
                    list={alcanceEntregables}
                    setList={setAlcanceEntregables}
                />
            </Form.Group>
        </div>
    );
};

export default InputAlcanceList;