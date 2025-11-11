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


// --- Componente de Riesgo (Badge Semáforo) ---
const RiskIndicator = ({ riskValue }) => {
    let variant = SUCCESS_COLOR; // Color de fondo por defecto (L)
    let label = 'BAJO (L)';
    let textColor = 'white';     // Color de texto por defecto

    if (riskValue === 'M') {
        // NARANJA/AMARILLO
        variant = WARNING_COLOR;
        label = 'MEDIO (M)';
        // El texto debe ser negro sobre amarillo para alto contraste
        textColor = 'black';
    } else if (riskValue === 'H') {
        // ROJO
        variant = DANGER_COLOR;
        label = 'ALTO (H)';
        // El texto debe ser blanco sobre rojo
        textColor = 'white';
    } else if (!riskValue) {
        // N/A
        variant = '#6c757d'; // Gris secundario
        label = 'N/A';
        textColor = 'white';
    }

    return (
        <div className="text-center">
            {/* Aplicando el color de fondo y color de texto directamente mediante style */}
            <Badge
                style={{
                    fontSize: '1.5rem',
                    padding: '10px 15px',
                    backgroundColor: variant, // Usa el color (Rojo, Amarillo/Naranja, Verde, Gris)
                    color: textColor,         // Usa el color del texto (Blanco o Negro)
                }}
            >
                {label}
            </Badge>
            <p className="mt-2 mb-0 fw-bold">Riesgo Promedio</p>
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
    let title = 'Costo Real vs Estimado: Superávit';
    let centerText = `${numDeviation.toFixed(2)}%`; // Muestra el valor real en el centro

    if (numDeviation <= 100) {
        // En presupuesto (o gastado exactamente 100%)
        color = SUCCESS_COLOR;
    } else {
        // Sobrepresupuesto (más del 100%)
        color = DANGER_COLOR;
        title = 'Costo Real vs Estimado: Sobrepresupuesto';
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