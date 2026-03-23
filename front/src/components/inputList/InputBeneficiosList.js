import React, { useEffect, useMemo } from 'react';
import { Form, ProgressBar, Row, Col } from "react-bootstrap";
import InputBeneficiosPlan from "./InputBeneficiosPlan";
import InputBeneficiosEjecutado from "./InputBeneficiosEjecutado";

const InputBeneficiosList = ({
    beneficiosList,
    setBeneficiosList,
    editMode,
    ejecutado,
    cerrado,
    interesados = [],
    onSummaryChange = () => { },
    onPerformanceChange = () => { },  
}) => {

    // ── Progreso (porcentaje de beneficios cumplidos) ─────────────────────────
    const { totalBeneficios, beneficiosCumplidos } = useMemo(() => {
        let total = 0, cumplidos = 0;
        if (Array.isArray(beneficiosList)) {
            beneficiosList.forEach(obj => {
                (obj.beneficios || []).forEach(b => {
                    total++;
                    if (b.cumplido) cumplidos++;
                });
            });
        }
        return { totalBeneficios: total, beneficiosCumplidos: cumplidos };
    }, [beneficiosList]);

    const porcentajeCumplido = totalBeneficios > 0
        ? Math.round((beneficiosCumplidos / totalBeneficios) * 100)
        : 0;

    // ── Índice de desempeño (misma lógica que InputAlcanceList) ───────────────
    //   EV: beneficios cumplidos A TIEMPO (fechaCumplimiento <= deadline)
    //   PV: beneficios cuyo deadline ya venció hoy
    const performanceIndex = useMemo(() => {
        const allBeneficios = [];
        (beneficiosList || []).forEach(obj =>
            (obj.beneficios || []).forEach(b => allBeneficios.push(b))
        );

        if (allBeneficios.length === 0) return 1.0;

        const today = new Date().toISOString().split('T')[0];

        const successful = allBeneficios.filter(b => {
            if (!b.cumplido || !b.fechaCumplimiento || !b.deadline) return false;
            return b.fechaCumplimiento <= b.deadline;
        }).length;

        const shouldBeDone = allBeneficios.filter(b => b.deadline && b.deadline <= today).length;

        if (shouldBeDone === 0) return successful > 0 ? 2.0 : 1.0;

        return Math.min(Number((successful / shouldBeDone).toFixed(2)), 2.0);
    }, [beneficiosList]);

    // ── Reportar al padre ─────────────────────────────────────────────────────
    useEffect(() => {
        if (ejecutado || cerrado) {
            onSummaryChange('beneficios', porcentajeCumplido);
            // 'beneficios' es la key que se añade a resumenDesempeno en ProyectoDetail
            onPerformanceChange('beneficios', performanceIndex);
        }
    }, [porcentajeCumplido, performanceIndex, ejecutado, cerrado]);

    if (!beneficiosList?.length && !editMode) return null;

    return (
        <div className="alcance-container border rounded p-4 bg-white shadow-sm">

            {/* Cabecera — idéntica a InputAlcanceList */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="m-0 fw-bold">
                    <i className="bi bi-trophy me-2"></i>
                    Beneficios Estratégicos del Programa
                </h4>
            </div>

            {/* Barras — solo en ejecución/cerrado, igual que alcance */}
            {(ejecutado || cerrado) && (
                <Row className="mb-4">
                    <Col md={6} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className="fw-bold mb-1 small text-uppercase">Progreso de Beneficios</Form.Label>
                            <span className="fw-bold text-primary small">{porcentajeCumplido}%</span>
                        </div>
                        <ProgressBar now={porcentajeCumplido} style={{ height: '20px' }} />
                        <small className="text-muted d-block mt-1">
                            Fórmula: (Beneficios cumplidos / Total beneficios) × 100
                        </small>
                    </Col>
                    <Col md={6} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className="fw-bold mb-1 small text-uppercase">Índice de Desempeño</Form.Label>
                            <span className={`fw-bold small text-${performanceIndex >= 1 ? 'success' : performanceIndex >= 0.8 ? 'warning' : 'danger'}`}>
                                {performanceIndex.toFixed(2)}
                            </span>
                        </div>
                        <ProgressBar
                            now={Math.min(performanceIndex * 100, 100)}
                            variant={performanceIndex >= 1 ? 'success' : performanceIndex >= 0.8 ? 'warning' : 'danger'}
                            style={{ height: '20px' }}
                        />
                        <small className="text-muted d-block mt-1">
                            Fórmula: Beneficios a tiempo / Beneficios que debían cumplirse hoy
                        </small>
                    </Col>
                </Row>
            )}

            {/* Contenido según estado */}
            {(ejecutado || cerrado) ? (
                <InputBeneficiosEjecutado
                    beneficiosList={beneficiosList}
                    setBeneficiosList={setBeneficiosList}
                    editMode={editMode}
                    interesados={interesados}
                />
            ) : (
                <InputBeneficiosPlan
                    beneficiosList={beneficiosList}
                    setBeneficiosList={setBeneficiosList}
                    disabled={!editMode}
                    interesados={interesados}
                />
            )}
        </div>
    );
};

export default InputBeneficiosList;