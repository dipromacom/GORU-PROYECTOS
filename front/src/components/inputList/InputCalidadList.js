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
        <div className="calidad-container shadow-sm border rounded p-4 bg-white mt-4">
            {/* Título con diseño unificado */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 text-dark fw-bold">
                    <i className="bi bi-clipboard-check me-2"></i>Calidad y Requisitos
                </h4>
            </div>

            <Form.Group controlId="metricas-criterios" className="mb-0">
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
                    <>
                        <Form.Label className="small fw-bold text-muted">Métricas / Criterios de Aceptación</Form.Label>
                        <InputCriteriosInput
                            disabled={!editMode}
                            criteriosList={calidadMetricas}
                            setCriterioList={setCalidadMetricas}
                        />
                    </>
                )}
            </Form.Group>
        </div>
    );
};

export default InputCalidadList;