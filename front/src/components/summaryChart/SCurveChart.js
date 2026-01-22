import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

const SCurveChart = ({
    dataPoints,
    title,
    // Props para mapear campos según el módulo (Hitos o Costos)
    dateField = "date",
    realDateField = "realDate"
}) => {
    if (!dataPoints || dataPoints.length === 0) return null;

    const allDates = new Set();
    dataPoints.forEach(p => {
        if (p[dateField]) allDates.add(moment(p[dateField]).format('YYYY-MM-DD'));
        if (p.completado && p[realDateField]) allDates.add(moment(p[realDateField]).format('YYYY-MM-DD'));
    });

    const sortedTimeline = Array.from(allDates).sort();
    const totalItems = dataPoints.length;
    const today = moment().startOf('day').format('YYYY-MM-DD');

    const labels = [];
    const plannedPoints = [];
    const realPoints = [];

    sortedTimeline.forEach((currentTime) => {
        labels.push(moment(currentTime).format('DD/MM/YY'));

        const plannedCount = dataPoints.filter(h =>
            moment(h[dateField]).format('YYYY-MM-DD') <= currentTime
        ).length;
        plannedPoints.push(Math.round((plannedCount / totalItems) * 100));

        if (currentTime <= today || dataPoints.some(h => h.completado && h[realDateField] && moment(h[realDateField]).format('YYYY-MM-DD') === currentTime)) {
            const realCount = dataPoints.filter(h =>
                h.completado &&
                h[realDateField] &&
                moment(h[realDateField]).format('YYYY-MM-DD') <= currentTime
            ).length;
            realPoints.push(Math.round((realCount / totalItems) * 100));
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
                tension: 0.1,
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