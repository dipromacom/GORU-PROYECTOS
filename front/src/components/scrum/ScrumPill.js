import React from 'react';
import {
    PRIORITIES, STORY_STATES, PRIORITY_PILL_STYLES, STATE_PILL_STYLES, labelFor,
} from './scrumConstants';

const DEFAULT_STYLE = { background: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

export default function ScrumPill({ label, style, className = '' }) {
    if (!label || label === '—') return <span className="text-muted">—</span>;
    const s = style || DEFAULT_STYLE;
    return (
        <span
            className={`scrum-pill ${className}`.trim()}
            style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                backgroundColor: s.background,
                color: s.color,
                border: `1px solid ${s.border}`,
            }}
        >
            {label}
        </span>
    );
}

export function PriorityPill({ prioridad, className }) {
    if (!prioridad) return <span className="text-muted">—</span>;
    return (
        <ScrumPill
            label={labelFor(PRIORITIES, prioridad)}
            style={PRIORITY_PILL_STYLES[prioridad]}
            className={className}
        />
    );
}

export function EstadoPill({ estado, className }) {
    if (!estado) return <span className="text-muted">—</span>;
    const st = STORY_STATES.find((s) => s.value === estado);
    return (
        <ScrumPill
            label={st?.label || estado}
            style={STATE_PILL_STYLES[estado]}
            className={className}
        />
    );
}
