import React from 'react';
import { Line } from 'react-chartjs-2';

export default function BurnupChart({ sprint, stories }) {
    if (!sprint?.fecha_inicio || !sprint?.fecha_fin) {
        return <p className="text-muted small">Fechas del sprint no definidas</p>;
    }

    const start = new Date(sprint.fecha_inicio);
    const end = new Date(sprint.fecha_fin);
    const totalDays = Math.max(1, Math.round((end - start) / 86400000) + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalPoints = (stories || []).reduce((a, s) => a + (Number(s.story_points) || 0), 0);

    const days = Array.from({ length: totalDays }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    });

    const completedLine = days.map((_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        d.setHours(23, 59, 59, 999);
        if (d > today) return null;
        const doneByDay = (stories || []).filter((s) => {
            if (s.kanban_column !== 'done' && s.estado !== 'done') return false;
            const movedAt = s.estimado_at || s.updatedAt;
            return movedAt && new Date(movedAt) <= d;
        });
        return doneByDay.reduce((a, s) => a + (Number(s.story_points) || 0), 0);
    });

    const data = {
        labels: days,
        datasets: [
            {
                label: 'Alcance total',
                data: days.map(() => totalPoints),
                borderColor: '#94a3b8',
                borderDash: [4, 4],
                pointRadius: 0,
                fill: false,
                borderWidth: 2,
            },
            {
                label: 'Completado',
                data: completedLine,
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.08)',
                pointRadius: 3,
                fill: true,
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
            callbacks: {
                label: (item, chartData) => {
                    const label = chartData.datasets[item.datasetIndex].label || '';
                    return `${label}: ${item.yLabel} pts`;
                },
            },
        },
    };

    return (
        <div style={{ height: 240 }}>
            <Line data={data} options={options} />
        </div>
    );
}
