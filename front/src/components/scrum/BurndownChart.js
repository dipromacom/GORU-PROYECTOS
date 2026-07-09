import React from 'react';
import { Line } from 'react-chartjs-2';

export default function BurndownChart({ sprint, stories }) {
    if (!sprint?.fecha_inicio || !sprint?.fecha_fin) {
        return <p className="text-muted small">Fechas del sprint no definidas</p>;
    }

    const start = new Date(sprint.fecha_inicio);
    const end = new Date(sprint.fecha_fin);
    const totalDays = Math.max(1, Math.round((end - start) / 86400000) + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayIndex = Math.max(0, Math.min(totalDays - 1, Math.round((today - start) / 86400000)));

    const totalPoints = (stories || []).reduce((a, s) => a + (Number(s.story_points) || 0), 0);

    const days = Array.from({ length: totalDays }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    });

    const idealLine = days.map((_, i) => {
        const remaining = totalPoints - (totalPoints / Math.max(totalDays - 1, 1)) * i;
        return Math.max(0, Number(remaining.toFixed(1)));
    });

    const actualLine = days.map((_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        d.setHours(23, 59, 59, 999);
        if (d > today) return null;
        const doneByDay = (stories || []).filter((s) => {
            if (!s.story_points) return false;
            if (s.kanban_column !== 'done') return false;
            const movedAt = s.updatedAt;
            if (!movedAt) return false;
            return new Date(movedAt) <= d;
        });
        const donePoints = doneByDay.reduce((a, s) => a + (Number(s.story_points) || 0), 0);
        return Number((totalPoints - donePoints).toFixed(1));
    });

    const data = {
        labels: days,
        datasets: [
            {
                label: 'Ideal',
                data: idealLine,
                borderColor: '#6b7280',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                borderWidth: 2,
            },
            {
                label: 'Real',
                data: actualLine,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                pointRadius: 4,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                fill: false,
                borderWidth: 2,
                spanGaps: false,
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        legend: { display: true, position: 'top', labels: { fontSize: 11, boxWidth: 14 } },
        scales: {
            xAxes: [{
                gridLines: { display: false },
                ticks: { maxTicksLimit: 15, fontSize: 10, fontColor: '#6b7280' },
            }],
            yAxes: [{
                gridLines: { color: 'rgba(0,0,0,0.06)', drawBorder: false },
                ticks: { beginAtZero: true, fontSize: 10, fontColor: '#6b7280' },
            }],
        },
        tooltips: {
            backgroundColor: 'rgba(17,40,64,.92)',
            xPadding: 8, yPadding: 6,
            bodyFontSize: 12,
            callbacks: {
                label: (item, data) => {
                    const label = data.datasets[item.datasetIndex].label || '';
                    return `${label}: ${item.yLabel} pts`;
                },
            },
        },
    };

    return (
        <div style={{ height: 280 }}>
            <Line data={data} options={options} />
        </div>
    );
}
