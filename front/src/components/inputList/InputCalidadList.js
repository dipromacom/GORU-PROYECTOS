import React, { useMemo } from "react";
import { Form } from "react-bootstrap";
import InputCriteriosInput from "./InputCriteriosInput";
import InputCalidadEjecutado from "./InputCalidadEjecutado";

const InputCalidadList = ({ calidadMetricas, setCalidadMetricas, costoEntregable, editMode, ejecutado, cerrado, onSummaryChange = () => { } }) => {

    const transformedMetricas = useMemo(() => {
        const metrics = calidadMetricas || [];

        if (ejecutado && metrics.length > 0) {
            if (!metrics[0].hasOwnProperty('completado')) {
                return metrics.map(item => ({
                    ...item,
                    completado: false // Inicializa como no completado
                }));
            }
        }
        return metrics;
    }, [calidadMetricas, ejecutado]);

    if (!(costoEntregable?.length > 0)) {
        return null;
    }

    return (
        <div className="mt-4">
            <h3>Calidad / Requisitos Funcionales / Requisitos del Cliente</h3>
            <Form.Group controlId="metricas-criterios">
                <Form.Label>Métrica / Criterios de Aceptación</Form.Label>
                {ejecutado || cerrado ? (
                    <InputCalidadEjecutado
                        calidadMetricas={transformedMetricas}
                        setCalidadMetricas={setCalidadMetricas}
                        editMode={editMode}
                        ejecutado={ejecutado}
                        cerrado={cerrado}
                        onSummaryChange={onSummaryChange}
                    />
                ) : (
                    <InputCriteriosInput
                        disabled={!editMode}
                        criteriosList={calidadMetricas}
                        setCriterioList={setCalidadMetricas}
                    />
                )}
            </Form.Group>
        </div>
    );
};

export default InputCalidadList;