import React, { useEffect, useMemo } from 'react';
import { Form, ProgressBar } from "react-bootstrap";
import InputBeneficiosPlan from "./InputBeneficiosPlan";
import InputBeneficiosEjecutado from "./InputBeneficiosEjecutado";

const InputBeneficiosList = ({
    beneficiosList,
    setBeneficiosList,
    editMode,
    ejecutado,
    onSummaryChange = () => { }
}) => {

    // 1. Cálculo de Totales
    const { totalBeneficios, beneficiosCumplidos } = useMemo(() => {
        let total = 0;
        let cumplidos = 0;

        if (Array.isArray(beneficiosList)) {
            beneficiosList.forEach(objetivo => {
                if (Array.isArray(objetivo.beneficios)) {
                    objetivo.beneficios.forEach(beneficio => {
                        total++;
                        if (beneficio.cumplido) {
                            cumplidos++;
                        }
                    });
                }
            });
        }
        return { totalBeneficios: total, beneficiosCumplidos: cumplidos };
    }, [beneficiosList]);


    // 2. Cálculo del Porcentaje de Cumplimiento
    const porcentajeCumplido = totalBeneficios > 0
        ? Math.round((beneficiosCumplidos / totalBeneficios) * 100)
        : 0;

    // 3. Envío del porcentaje al componente padre (similar a Alcance/Costos)
    useEffect(() => {
        if (ejecutado) {
            // Asumo que el campo en el resumen del proyecto se llama 'beneficios'
            onSummaryChange('beneficios', porcentajeCumplido);
        }
    }, [porcentajeCumplido, ejecutado, onSummaryChange]);


    // 4. Renderizado condicional

    // Si no hay datos y no estamos en modo edición (Planificación), no mostrar nada.
    if (!beneficiosList?.length && !editMode) return null;

    return (
        <div className="beneficios-container mt-4">
            <h3>Beneficios Estratégicos</h3>

            {ejecutado && (
                <div className="mb-3">
                    <Form.Label>Progreso de Beneficios: <span className="fw-bold">{porcentajeCumplido}%</span></Form.Label><br />
                    <Form.Label><span className="fw-bold">Fórmula: (beneficios_cumplidos / total_beneficios) * 100 </span></Form.Label>
                    <ProgressBar now={porcentajeCumplido} label={`${porcentajeCumplido}%`} />
                </div>
            )}

            {ejecutado ? (
                // MODO EJECUCIÓN (Permite marcar cumplimiento)
                <InputBeneficiosEjecutado
                    beneficiosList={beneficiosList}
                    setBeneficiosList={setBeneficiosList}
                    editMode={editMode}
                />
            ) : (
                // MODO PLANIFICACIÓN (Permite definir objetivos y beneficios)
                <InputBeneficiosPlan
                    beneficiosList={beneficiosList}
                    setBeneficiosList={setBeneficiosList}
                    disabled={!editMode}
                />
            )}
        </div>
    );
};

export default InputBeneficiosList;