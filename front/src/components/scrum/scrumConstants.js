export const STORY_TYPES = [
    { value: 'historia', label: 'Historia de usuario' },
    { value: 'tarea', label: 'Tarea técnica' },
    { value: 'bug', label: 'Bug' },
    { value: 'mejora', label: 'Mejora' },
    { value: 'spike', label: 'Spike / Investigación' },
];

export const STORY_TYPE_PILL_STYLES = {
    historia: { background: '#e0f2fe', color: '#075985', border: '#bae6fd' },
    tarea: { background: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' },
    bug: { background: '#fee2e2', color: '#991b1b', border: '#fecaca' },
    mejora: { background: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
    spike: { background: '#fef3c7', color: '#92400e', border: '#fde68a' },
};

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
    { value: 'puntuacion', label: 'Puntuación (valor − complejidad − esfuerzo)' },
    { value: 'moscow', label: 'MoSCoW' },
    { value: 'valor_esfuerzo', label: 'Matriz Valor vs Esfuerzo' },
];

export const PRIORIZATION_METHOD_LABELS = {
    puntuacion: 'Puntuación',
    moscow: 'MoSCoW',
    valor_esfuerzo: 'Valor vs Esfuerzo',
};

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
    prioridad_score: null,
    moscow: '',
    metodo_priorizacion: 'moscow',
    riesgo: '',
    story_points: '',
    estado: 'idea',
    asignado_a: '',
    reglas_negocio: '',
    dependencias: '',
    supuestos: '',
    requisitos_culminacion: '',
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

export const DOCUMENT_TYPES = [
    { value: 'vision', label: 'Visión del producto' },
    { value: 'roadmap', label: 'Roadmap' },
    { value: 'dor', label: 'Definition of Ready' },
    { value: 'dod', label: 'Definition of Done' },
    { value: 'planning', label: 'Acta Sprint Planning' },
    { value: 'daily', label: 'Daily notes' },
    { value: 'review', label: 'Sprint Review' },
    { value: 'retro', label: 'Sprint Retrospective' },
    { value: 'decision', label: 'Decisiones del proyecto' },
    { value: 'evidencia', label: 'Evidencias de entrega' },
    { value: 'manual', label: 'Manuales' },
    { value: 'funcional', label: 'Documento funcional' },
    { value: 'tecnico', label: 'Documento técnico' },
    { value: 'lecciones', label: 'Lecciones aprendidas' },
    { value: 'minutas', label: 'Minutas' },
    { value: 'otros', label: 'Otros' },
];

export const DOCUMENT_STATES = [
    { value: 'borrador', label: 'Borrador' },
    { value: 'vigente', label: 'Vigente' },
    { value: 'obsoleto', label: 'Obsoleto' },
];

export const DOCUMENT_STATE_STYLES = {
    borrador: { background: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
    vigente: { background: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
    obsoleto: { background: '#fef3c7', color: '#92400e', border: '#fde68a' },
};

export const emptyDocument = () => ({
    tipo: 'planning',
    titulo: '',
    descripcion: '',
    contenido: '',
    sprint_id: '',
    epic_id: '',
    story_id: '',
    relacion_ref: '',
    relacion_tipo: 'proyecto',
    solicitud_cambio_id: '',
    riesgo_ref: '',
    archivos: [],
    comentarios: [],
    estado: 'borrador',
});

export const DOCUMENT_RELATION_TYPES = [
    { value: 'proyecto', label: 'Proyecto' },
    { value: 'alcance', label: 'Alcance' },
    { value: 'sprint', label: 'Sprint' },
    { value: 'epic', label: 'Épica' },
    { value: 'story', label: 'Historia' },
    { value: 'riesgo', label: 'Riesgo' },
    { value: 'cambio', label: 'Cambio' },
];
