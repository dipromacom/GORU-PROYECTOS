import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import './RiskHeatmapMatrix.css';

const RiskHeatmapMatrix = ({ riesgosList = [], showResidual = false }) => {
    const matrixCells = useMemo(() => {
        const cells = [];
        for (let impacto = 3; impacto >= 1; impacto--) {
            for (let probabilidad = 1; probabilidad <= 3; probabilidad++) {
                const riesgosEnCelda = riesgosList.filter(r => {
                    const prob = showResidual && r.probabilidad_residual !== null
                        ? r.probabilidad_residual
                        : r.probabilidad;
                    const imp = showResidual && r.impacto_residual !== null
                        ? r.impacto_residual
                        : r.impacto;

                    return prob === probabilidad && imp === impacto;
                });

                const valor = probabilidad * impacto;
                let nivel = 'low';
                if (valor === 9) nivel = 'high';
                else if (valor >= 4 && valor <= 6) nivel = 'medium';
                else if (valor >= 1 && valor <= 3) nivel = 'low';

                cells.push({
                    probabilidad,
                    impacto,
                    valor,
                    nivel,
                    riesgos: riesgosEnCelda
                });
            }
        }
        return cells;
    }, [riesgosList, showResidual]);

    const getNivelColor = (nivel) => {
        switch (nivel) {
            case 'high': return '#DC3545';
            case 'medium': return '#FFC107';
            case 'low': return '#28A745';
            default: return '#28A745';
        }
    };

    const getNivelLabel = (nivel) => {
        switch (nivel) {
            case 'high': return 'Alto';
            case 'medium': return 'Medio';
            case 'low': return 'Bajo';
            default: return 'Bajo';
        }
    };

    return (
        <Card className="risk-heatmap-card shadow-sm">
            <Card.Body>
                <div className="heatmap-wrapper">
                    {/* Etiqueta Y (Impacto) - A LA IZQUIERDA */}
                    <div className="heatmap-y-axis">
                        <div className="y-axis-title">IMPACTO</div>
                        <div className="y-axis-labels">
                            <div>Alto (3)</div>
                            <div>Medio (2)</div>
                            <div>Bajo (1)</div>
                        </div>
                    </div>

                    {/* Contenedor de matriz + etiqueta X */}
                    <div className="heatmap-main">
                        {/* Matriz */}
                        <div className="heatmap-grid">
                            {matrixCells.map((cell, index) => (
                                <div
                                    key={index}
                                    className="heatmap-cell"
                                    style={{
                                        backgroundColor: getNivelColor(cell.nivel),
                                    }}
                                >
                                    <div className="cell-nivel">{getNivelLabel(cell.nivel)}</div>
                                    <div className="cell-valor">({cell.valor})</div>
                                    <div className="cell-riesgos">
                                        {cell.riesgos.map((riesgo, idx) => (
                                            <span
                                                key={idx}
                                                className="riesgo-badge"
                                                title={riesgo.descripcion}
                                            >
                                                {riesgo.id}
                                                {showResidual && riesgo.completado && (
                                                    <i className="bi bi-check-circle-fill ms-1 text-success"></i>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Etiqueta X (Probabilidad) - ABAJO */}
                        <div className="heatmap-x-axis">
                            <div className="x-axis-title">PROBABILIDAD</div>
                            <div className="x-axis-labels">
                                <div>Bajo (1)</div>
                                <div>Medio (2)</div>
                                <div>Alto (3)</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leyenda */}
                <div className="heatmap-legend mt-4">
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#28A745' }}></span>
                        <span>Bajo (1-3)</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#FFC107' }}></span>
                        <span>Medio (4-6)</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#DC3545' }}></span>
                        <span>Alto (9)</span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default RiskHeatmapMatrix;