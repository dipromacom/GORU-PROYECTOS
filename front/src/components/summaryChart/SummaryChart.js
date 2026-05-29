import React from 'react';
import { Doughnut, Polar } from 'react-chartjs-2';
import { Badge } from 'react-bootstrap'; // Usaremos Badge de react-bootstrap


// Definición de colores
const SUCCESS_COLOR = 'rgb(40, 167, 69)'; // Verde
const DANGER_COLOR = 'rgb(220, 53, 69)'; // Rojo
const WARNING_COLOR = 'rgb(255, 193, 7)'; // Amarillo
const INFO_COLOR = 'rgb(23, 162, 184)'; // Azul

// Colores sólidos para la leyenda y bordes


const PerformancePolarChart = ({ dataValues }) => {
    const metricDefinitions = [
        {
            key: 'alcance',
            label: '🎯 Alcance',
            baseColor: { r: 54, g: 162, b: 235 }
        },
        {
            key: 'hitos',
            label: '🏁 Hitos',
            baseColor: { r: 153, g: 102, b: 255 }
        },
        {
            key: 'costos',
            label: '💰 Costos',
            baseColor: { r: 255, g: 159, b: 64 }
        },
        {
            key: 'eficiencia',
            label: '📊 Kanban',
            baseColor: { r: 75, g: 192, b: 192 }
        },
        {
            key: 'todo',
            label: '✅ To-Do',
            baseColor: { r: 76, g: 175, b: 80 }
        },
        {
            key: 'cronograma',
            label: '📅 Cronograma',
            baseColor: { r: 255, g: 99, b: 132 }
        },
        {
            key: 'beneficios',
            label: '🏆 Beneficios',
            baseColor: { r: 255, g: 215, b: 0 }
        },
    ];

    const metrics = metricDefinitions
        .filter(m => dataValues[m.key] !== undefined)
        .map(m => ({
            label: m.label,
            value: dataValues[m.key] || 0,
            baseColor: m.baseColor,
        }));

    // Función para ajustar el color según el desempeño
    const getColorByPerformance = (baseColor, value) => {
        const { r, g, b } = baseColor;

        if (value >= 1) {
            // Excelente: Color vibrante y saturado (opacidad alta)
            return `rgba(${r}, ${g}, ${b}, 0.9)`;
        } else if (value >= 0.6) {
            // Regular: Color medio (opacidad media)
            return `rgba(${r}, ${g}, ${b}, 0.6)`;
        } else {
            // Crítico: Color desaturado/apagado (opacidad baja)
            return `rgba(${r}, ${g}, ${b}, 0.3)`;
        }
    };

    // Función para el borde (siempre más oscuro que el relleno)
    const getBorderColor = (baseColor, value) => {
        const { r, g, b } = baseColor;

        if (value >= 1) {
            return `rgba(${r}, ${g}, ${b}, 1)`;
        } else if (value >= 0.6) {
            return `rgba(${r}, ${g}, ${b}, 0.8)`;
        } else {
            return `rgba(${r}, ${g}, ${b}, 0.5)`;
        }
    };

    const data = {
        labels: metrics.map(m => m.label),
        datasets: [{
            data: metrics.map(m => m.value),
            backgroundColor: metrics.map(m => getColorByPerformance(m.baseColor, m.value)),
            borderColor: metrics.map(m => getBorderColor(m.baseColor, m.value)),
            borderWidth: 3,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 13,
                        weight: 'bold'
                    },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i];
                            const metric = metrics[i];

                            // Determinar estado
                            let status = '';
                            if (value >= 1) status = '✓';
                            else if (value >= 0.6) status = '⚠';
                            else status = '✗';

                            return {
                                text: `${label}: ${value.toFixed(2)} ${status}`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                strokeStyle: data.datasets[0].borderColor[i],
                                lineWidth: 2,
                                hidden: false,
                                index: i
                            };
                        });
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    title: (context) => {
                        return metrics[context[0].dataIndex].label;
                    },
                    label: (context) => {
                        const val = context.parsed.r;
                        let status = '';
                        let statusText = '';

                        if (val >= 1) {
                            status = '✓';
                            statusText = 'Excelente';
                        } else if (val >= 0.6) {
                            status = '⚠';
                            statusText = 'Regular';
                        } else {
                            status = '✗';
                            statusText = 'Crítico';
                        }

                        return [
                            `Índice: ${val.toFixed(2)}`,
                            `Porcentaje: ${(val * 100).toFixed(0)}%`,
                            `Estado: ${status} ${statusText}`
                        ];
                    }
                }
            }
        },
        scales: {
            r: {
                beginAtZero: true,
                max: 2,
                ticks: {
                    stepSize: 0.5,
                    callback: (value) => value.toFixed(1),
                    backdropColor: 'transparent',
                    font: {
                        size: 11
                    }
                },
                pointLabels: {
                    font: {
                        size: 13,
                        weight: 'bold'
                    },
                    color: '#333'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                angleLines: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    };

    return (
        <div className="w-100 text-center">
            <div style={{ height: '400px' }}>
                <Polar data={data} options={options} />
            </div>

            {/* Leyenda de intensidad 
            <div className="mt-4">
                <h6 className="mb-3">Intensidad del Color según Desempeño</h6>
                <div className="d-flex justify-content-center align-items-center flex-wrap" style={{ gap: '20px' }}>
                    <div className="d-flex align-items-center">
                        <div style={{
                            width: '40px',
                            height: '20px',
                            background: 'linear-gradient(to right, rgba(100, 100, 100, 0.3), rgba(100, 100, 100, 0.9))',
                            borderRadius: '4px',
                            marginRight: '8px',
                            border: '1px solid #ddd'
                        }}></div>
                        <div>
                            <small style={{ display: 'block' }}><strong>Color apagado:</strong> Crítico ({"< 0.6"})</small>
                            <small style={{ display: 'block' }}><strong>Color medio:</strong> Regular (0.6 - 0.99)</small>
                            <small style={{ display: 'block' }}><strong>Color vibrante:</strong> Excelente (≥ 1.0)</small>
                        </div>
                    </div>
                </div>
            </div>*/}

            {/* Leyenda de colores por métrica */}
            <div className="mt-4">
                <h6 className="mb-2">Cada color representa un componente diferente</h6>
                <div className="d-flex justify-content-center flex-wrap" style={{ gap: '15px' }}>
                    {metrics.map((metric, idx) => {
                        const { r, g, b } = metric.baseColor;
                        return (
                            <div key={idx} className="d-flex align-items-center">
                                <span style={{
                                    width: '15px',
                                    height: '15px',
                                    backgroundColor: `rgb(${r}, ${g}, ${b})`,
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    border: '2px solid rgba(0,0,0,0.2)'
                                }}></span>
                                <small>{metric.label}</small>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-3">
                <small className="text-muted">
                    <strong>Interpretación:</strong> 1.0 = 100% del desempeño esperado.
                    Mayor valor = Mejor desempeño (color más intenso).
                </small>
            </div>
        </div>
    );
};


// --- Componente de Gráfico de Dona ---
const DoughnutProgress = ({ title, percentage }) => {
    const remaining = 100 - percentage;
    const color = percentage >= 100 ? SUCCESS_COLOR : INFO_COLOR;

    const data = {
        datasets: [
            {
                data: [percentage, remaining],
                backgroundColor: [color, '#e9ecef'], // Color principal y color de fondo
                hoverBackgroundColor: [color, '#e9ecef'],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutoutPercentage: 75,
        legend: { display: false },
        tooltips: { enabled: false },
    };

    return (
        <div style={{ position: 'relative', height: '120px', width: '120px' }} className="text-center">
            <Doughnut data={data} options={options} />
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                }}
            >
                {percentage}%
            </div>
            <p className="mt-2 mb-0 fw-bold">{title}</p>
        </div>
    );
};

const getRiskColorVariant = (percentage) => {
    // La lógica de riesgo es INVERSA a la de progreso (mayor % = peor riesgo)
    if (percentage >= 67) return DANGER_COLOR; // 67-100% -> Rojo
    if (percentage >= 34) return WARNING_COLOR; // 34-66% -> Amarillo
    return SUCCESS_COLOR; // 0-33% -> Verde
}

// --- Componente de Riesgo (Badge Semáforo) ---
const RiskIndicator = ({ title, riskValue }) => {
    title = "Indice de Riesgo"
    const percentage = riskValue === null || riskValue === undefined ? 0 : riskValue;

    const remaining = 100 - percentage;

    // Obtener el color basado en la regla de riesgo
    const color = getRiskColorVariant(percentage);

    const data = {
        datasets: [
            {
                data: [percentage, remaining],
                backgroundColor: [color, '#e9ecef'], // Color principal y color de fondo
                hoverBackgroundColor: [color, '#e9ecef'],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutoutPercentage: 75,
        legend: { display: false },
        tooltips: { enabled: false },
    };

    return (
        <div style={{ position: 'relative', height: '120px', width: '120px' }} className="text-center">
            <Doughnut data={data} options={options} />
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                }}
            >
                {percentage}%
            </div>
            <p className="mt-2 mb-0 fw-bold">{title}</p>
        </div>
    );
};

// --- Componente de Desviación de Costo ---
const CostDeviation = ({ deviation }) => {
    const numDeviation = parseFloat(deviation);

    // 1. Determinar el valor a mostrar en la Dona (máx. 100% de cumplimiento visual)
    const visualProgress = Math.min(numDeviation, 100);
    const remaining = 100 - visualProgress;

    // 2. Determinar los colores y el mensaje
    let color = INFO_COLOR;      // Azul por defecto
    let title = 'Avance de Costos';
    let centerText = `${numDeviation.toFixed(2)}%`; // Muestra el valor real en el centro

    if (numDeviation <= 100) {
        // En presupuesto (o gastado exactamente 100%)
        color = SUCCESS_COLOR;
    } else {
        // Sobrepresupuesto (más del 100%)
        color = DANGER_COLOR;
        title = 'Avance de Costos';
    }

    const data = {
        datasets: [
            {
                data: [visualProgress, remaining],
                backgroundColor: [color, '#e9ecef'],
                hoverBackgroundColor: [color, '#e9ecef'],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutoutPercentage: 75,
        legend: { display: false },
        tooltips: { enabled: false },
    };

    return (
        <div style={{ position: 'relative', height: '120px', width: '120px' }} className="text-center">
            <Doughnut data={data} options={options} />
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: color, // El color del texto es el mismo que el color del progreso
                }}
            >
                {centerText}
            </div>
            <p className="mt-2 mb-0 fw-bold" style={{ color: color }}>{title}</p>
        </div>
    );
};


// --- Componente Principal de Resumen ---
const SummaryChart = ({ type, value, dataValues }) => {
    if (type === 'performance') {
        return <PerformancePolarChart dataValues={dataValues} />;
    }
    if (type === 'risk') {
        return <RiskIndicator riskValue={value} />;
    }
    if (type === 'cost') {
        return <CostDeviation deviation={value} />;
    }
    return <DoughnutProgress title={type.charAt(0).toUpperCase() + type.slice(1)} percentage={Number(value) || 0} />;
};

export default SummaryChart;