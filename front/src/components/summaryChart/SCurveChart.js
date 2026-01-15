import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

const SCurveChart = ({ dataPoints, title }) => {
    if (!dataPoints || dataPoints.length === 0) return null;

    // 1. Extraer todas las fechas únicas (programadas y reales) para construir el eje X
    const allDates = new Set();
    dataPoints.forEach(p => {
        if (p.date) allDates.add(moment(p.date).format('YYYY-MM-DD'));
        if (p.completado && p.realDate) allDates.add(moment(p.realDate).format('YYYY-MM-DD'));
    });

    const sortedTimeline = Array.from(allDates).sort();
    const totalHitos = dataPoints.length;
    const today = moment().startOf('day').format('YYYY-MM-DD');

    const labels = [];
    const plannedPoints = [];
    const realPoints = [];

    // 2. Iterar por la línea de tiempo para calcular acumulados en cada fecha
    sortedTimeline.forEach((currentTime) => {
        labels.push(moment(currentTime).format('DD/MM/YY'));

        // PROGRESO PLANIFICADO (PV): ¿Cuántos hitos debían estar listos hasta esta fecha?
        const plannedCount = dataPoints.filter(h =>
            moment(h.date).format('YYYY-MM-DD') <= currentTime
        ).length;
        plannedPoints.push(Math.round((plannedCount / totalHitos) * 100));

        // PROGRESO REAL (EV): ¿Cuántos hitos se cerraron REALMENTE hasta esta fecha?
        // Solo graficamos real si la fecha ya pasó o si hay cierres futuros registrados
        if (currentTime <= today || dataPoints.some(h => h.completado && h.realDate && moment(h.realDate).format('YYYY-MM-DD') === currentTime)) {
            const realCount = dataPoints.filter(h =>
                h.completado &&
                h.realDate &&
                moment(h.realDate).format('YYYY-MM-DD') <= currentTime
            ).length;
            realPoints.push(Math.round((realCount / totalHitos) * 100));
        }
    });

    const data = {
        labels,
        datasets: [
            {
                label: 'Planificado (PV)',
                data: plannedPoints,
                borderColor: '#5bc0de',
                backgroundColor: 'rgba(91, 192, 222, 0.1)',
                fill: true,
                tension: 0.1, // Líneas un poco más rectas para ver mejor los escalones de hitos
                pointRadius: 3,
            },
            {
                label: 'Real (EV)',
                data: realPoints,
                borderColor: '#6f42c1',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.1,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#6f42c1'
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: { beginAtZero: true, max: 100, callback: (v) => v + "%" },
                scaleLabel: { display: true, labelString: 'Avance Acumulado' }
            }],
            xAxes: [{
                ticks: { maxRotation: 45, minRotation: 45 }
            }]
        },
        tooltips: { mode: 'index', intersect: false }
    };

    return (
        <div className="bg-white p-3 border rounded shadow-sm" style={{ height: '380px' }}>
            <h6 className="text-center fw-bold text-muted mb-3">{title}</h6>
            <Line data={data} options={options} />
        </div>
    );
};

export default SCurveChart;