export const STORY_TYPES = [
    { value: 'historia', label: 'Historia de usuario' },
    { value: 'tarea', label: 'Tarea técnica' },
    { value: 'bug', label: 'Bug' },
    { value: 'mejora', label: 'Mejora' },
    { value: 'spike', label: 'Spike / Investigación' },
];

export const STORY_STATES = [
    { value: 'idea', label: 'Idea', variant: 'secondary' },
    { value: 'backlog', label: 'Backlog', variant: 'info' },
    { value: 'refinamiento', label: 'Refinamiento', variant: 'warning' },
    { value: 'ready', label: 'Ready', variant: 'primary' },
    { value: 'en_sprint', label: 'En Sprint', variant: 'dark' },
    { value: 'done', label: 'Done', variant: 'success' },
    { value: 'cancelado', label: 'Cancelado', variant: 'danger' },
];

export const EPIC_STATES = [
    { value: 'propuesta', label: 'Propuesta' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'en_ejecucion', label: 'En ejecución' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
];

export const PRIORITIES = [
    { value: 'critica', label: 'Crítica' },
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baja', label: 'Baja' },
];

/** Pills con fondo claro + texto oscuro (legible sin depender de Badge/bg de BS5) */
export const PRIORITY_PILL_STYLES = {
    critica: { background: '#fee2e2', color: '#991b1b', border: '#fecaca' },
    alta: { background: '#ffedd5', color: '#9a3412', border: '#fed7aa' },
    media: { background: '#fef9c3', color: '#854d0e', border: '#fde047' },
    baja: { background: '#e2e8f0', color: '#475569', border: '#cbd5e1' },
};

export const STATE_PILL_STYLES = {
    idea: { background: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
    backlog: { background: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
    refinamiento: { background: '#fef3c7', color: '#92400e', border: '#fde68a' },
    ready: { background: '#dcfce7', color: '#166534', border: '#bbf7d0' },
    en_sprint: { background: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' },
    done: { background: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
    cancelado: { background: '#fee2e2', color: '#991b1b', border: '#fecaca' },
};

export const WARNING_PILL_STYLE = { background: '#fef3c7', color: '#92400e', border: '#fde68a' };

export const BUSINESS_VALUES = [
    { value: 'muy_alto', label: 'Muy alto' },
    { value: 'alto', label: 'Alto' },
    { value: 'medio', label: 'Medio' },
    { value: 'bajo', label: 'Bajo' },
];

export const RISK_LEVELS = [
    { value: 'alto', label: 'Alto' },
    { value: 'medio', label: 'Medio' },
    { value: 'bajo', label: 'Bajo' },
];

export const MOSCOW_OPTIONS = [
    { value: 'must', label: 'Must have' },
    { value: 'should', label: 'Should have' },
    { value: 'could', label: 'Could have' },
    { value: 'wont', label: "Won't have" },
];

export const PRIORIZATION_METHODS = [
    { value: 'manual', label: 'Manual (drag & drop)' },
    { value: 'formula', label: 'Valor + Urgencia + Riesgo + Impacto − Complejidad' },
    { value: 'valor_esfuerzo', label: 'Valor vs Esfuerzo' },
    { value: 'wsjf', label: 'WSJF simplificado' },
    { value: 'moscow', label: 'MoSCoW' },
];

export const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13, 21];

export const SCORE_FIELDS = [
    { key: 'valor_negocio', label: 'Valor de negocio' },
    { key: 'urgencia', label: 'Urgencia' },
    { key: 'reduccion_riesgo', label: 'Reducción de riesgo' },
    { key: 'dependencia_estrategica', label: 'Dependencia estratégica' },
    { key: 'impacto_cliente', label: 'Impacto cliente/usuario' },
    { key: 'complejidad', label: 'Complejidad' },
    { key: 'esfuerzo', label: 'Esfuerzo' },
    { key: 'costo_demora', label: 'Costo de demora' },
];

export const labelFor = (options, value) =>
    options.find((o) => o.value === value)?.label || value || '—';

export const buildUserStoryText = (rol, necesidad, beneficio) => {
    if (!rol && !necesidad && !beneficio) return '';
    return `Como ${rol || '…'}, quiero ${necesidad || '…'} para ${beneficio || '…'}`;
};

export const emptyStory = () => ({
    tipo: 'historia',
    titulo: '',
    rol_usuario: '',
    necesidad: '',
    beneficio: '',
    descripcion: '',
    epic_id: '',
    sprint_id: '',
    prioridad: '',
    valor_negocio: null,
    urgencia: null,
    reduccion_riesgo: null,
    dependencia_estrategica: null,
    impacto_cliente: null,
    complejidad: null,
    esfuerzo: null,
    costo_demora: null,
    moscow: '',
    riesgo: '',
    story_points: '',
    estado: 'idea',
    asignado_a: '',
    reglas_negocio: '',
    dependencias: '',
    supuestos: '',
    riesgos_asociados: '',
    dependencias_criticas_abiertas: false,
    aprobado_po: false,
    estimacion_comentario: '',
    criterios_aceptacion: [{ dado: '', cuando: '', entonces: '' }],
    comentarios: [],
});

export const SPRINT_STATES = [
    { value: 'planificado', label: 'Planificado', variant: 'secondary' },
    { value: 'activo', label: 'Activo', variant: 'primary' },
    { value: 'cerrado', label: 'Cerrado', variant: 'success' },
    { value: 'cancelado', label: 'Cancelado', variant: 'danger' },
];

export const emptySprint = () => ({
    nombre: '',
    objetivo: '',
    fecha_inicio: '',
    fecha_fin: '',
    capacidad_puntos: 40,
    scrum_master_id: '',
    product_owner_id: '',
});

export const emptyEpic = () => ({
    nombre: '',
    descripcion: '',
    objetivo_estrategico: '',
    beneficio_esperado: '',
    valor_negocio: '',
    prioridad: '',
    estado: 'propuesta',
    responsable_id: '',
    fecha_objetivo: '',
    entregable_ref: '',
    riesgos_asociados: '',
});
