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
    const labels = ['Desempeño Alcance', 'Desempeño Hitos', 'Desempeño Costos', 'Desempeño Kanban', 'Desempeño Gantt'];
    const values = [dataValues.alcance || 0, dataValues.hitos || 0, dataValues.costos || 0, dataValues.eficiencia || 0, dataValues.cronograma || 0];

    const getColor = (val) => {
        if (val >= 1) return 'rgba(40, 167, 69, 0.7)';   // SUCCESS
        if (val >= 0.6) return 'rgba(255, 193, 7, 0.7)';  // WARNING
        return 'rgba(220, 53, 69, 0.7)';                  // DANGER
    };

    const data = {
        labels: labels,
        datasets: [{
            data: values,
            backgroundColor: values.map(v => getColor(v)),
            borderWidth: 1,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scale: {
            ticks: {
                beginAtZero: true,
                max: 1.4, // Ajustamos el límite superior
                stepSize: 0.2
            }
        },
        legend: {
            position: 'bottom',
        },
        tooltips: {
            callbacks: {
                label: (tooltipItem, data) => {
                    const val = data.datasets[0].data[tooltipItem.index];
                    return ` Valor: ${val.toFixed(2)} (${(val * 100).toFixed(0)}%)`;
                }
            }
        }
    };

    return (
        <div className="w-100 text-center">
            <h5 className="mb-3">Índice de Desempeño</h5>
            <div style={{ height: '250px' }}>
                <Polar data={data} options={options} />
            </div>

            {/* 🔹 NUEVO: Indicador de colores (Leyenda personalizada) */}
            <div className="mt-4 d-flex justify-content-center flex-wrap" style={{ gap: '10px' }}>
                <div className="d-flex align-items-center">
                    <span style={{ width: '12px', height: '12px', backgroundColor: SUCCESS_COLOR, borderRadius: '50%', display: 'inline-block', marginRight: '5px' }}></span>
                    <small>Excelente (≥ 1.0)</small>
                </div>
                <div className="d-flex align-items-center">
                    <span style={{ width: '12px', height: '12px', backgroundColor: WARNING_COLOR, borderRadius: '50%', display: 'inline-block', marginRight: '5px' }}></span>
                    <small>Regular (0.6 - 0.99)</small>
                </div>
                <div className="d-flex align-items-center">
                    <span style={{ width: '12px', height: '12px', backgroundColor: DANGER_COLOR, borderRadius: '50%', display: 'inline-block', marginRight: '5px' }}></span>
                    <small>Crítico ({"< 0.59"})</small>
                </div>
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
    title="Indice de Riesgo"
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