import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Badge } from 'react-bootstrap'; // Usaremos Badge de react-bootstrap


// Definición de colores
const SUCCESS_COLOR = 'rgb(40, 167, 69)'; // Verde
const DANGER_COLOR = 'rgb(220, 53, 69)'; // Rojo
const WARNING_COLOR = 'rgb(255, 193, 7)'; // Amarillo
const INFO_COLOR = 'rgb(23, 162, 184)'; // Azul

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
const SummaryChart = ({ type, value }) => {
    if (type === 'risk') {
        return <RiskIndicator riskValue={value} />;
    }
    if (type === 'cost') {
        return <CostDeviation deviation={value} />;
    }
    // Para alcance, hitos y calidad
    return <DoughnutProgress title={type.charAt(0).toUpperCase() + type.slice(1)} percentage={Number(value) || 0} />;
};

export default SummaryChart;