import { labelFor, STORY_STATES, PRIORITIES, STORY_TYPES } from './scrumConstants';

export const normalizeUsuarioProyecto = (item) => {
    if (!item) return null;
    const src = typeof item.toJSON === 'function' ? item.toJSON() : { ...item };
    const usuario = src.Usuario || src.usuario || {};
    const persona = usuario.Persona || usuario.persona || null;
    const username = usuario.username || src.email || '';
    const nombre = persona?.nombre
        ? `${persona.nombre} ${persona.apellido || ''}`.trim()
        : (username || (src.usuario_id ? `Usuario ${src.usuario_id}` : '—'));

    return {
        ...src,
        usuario_id: src.usuario_id,
        rol_proyecto_id: src.rol_proyecto_id,
        Usuario: usuario,
        RolProyecto: src.RolProyecto || src.rolProyecto || null,
        nombre,
        email: username,
    };
};

export const normalizeUsuariosProyecto = (list) =>
    (list || []).map(normalizeUsuarioProyecto).filter(Boolean);

export const getUsuarioLabel = (u) => {
    if (!u) return '—';
    const usuario = u.Usuario || u.usuario;
    if (usuario?.username) return usuario.username;
    if (u.email) return u.email;
    return '—';
};

export const getUsuarioInitials = (u) => {
    const label = getUsuarioLabel(u);
    if (label === '—') return '?';
    const parts = label.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return label.substring(0, 2).toUpperCase();
};

export const getAssigneeName = (story) => {
    return story?.Asignado?.username || '—';
};

export const getAssigneeInitials = (story) => {
    const name = getAssigneeName(story);
    if (name === '—') return null;
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

export const getSprintUserName = (usuario) => {
    if (!usuario) return '—';
    const persona = usuario.Persona;
    if (persona?.nombre) return `${persona.nombre} ${persona.apellido || ''}`.trim();
    return usuario.username || '—';
};

export const getAutorName = (doc) => getSprintUserName(doc?.Autor);

export const formatSprintDates = (inicio, fin) => {
    if (!inicio || !fin) return '—';
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    const a = new Date(inicio).toLocaleDateString('es-ES', opts);
    const b = new Date(fin).toLocaleDateString('es-ES', opts);
    const days = Math.max(1, Math.round((new Date(fin) - new Date(inicio)) / 86400000) + 1);
    return `${a} – ${b} (${days} días)`;
};

export const getSprintLabel = (story) => {
    if (!story?.Sprint) return '—';
    return story.Sprint.nombre || story.Sprint.codigo || '—';
};

export const getEpicLabel = (story) => story?.Epic?.nombre || story?.Epic?.codigo || '—';

export const getPriorityVariant = (prioridad) => {
    const map = { critica: 'danger', alta: 'warning', media: 'info', baja: 'secondary' };
    return map[prioridad] || 'secondary';
};

export const getValorEsfuerzoRatio = (story) => {
    const val = Number(story.valor_negocio) || 0;
    const eff = Number(story.story_points) || 0;
    if (!val || !eff) return null;
    return val / eff;
};

export const calculatePrioridadScore = (s) => {
    const valor = Number(s.valor_negocio) || 0;
    const urgencia = Number(s.urgencia) || 0;
    const reduccionRiesgo = Number(s.reduccion_riesgo) || 0;

    const totalValue = valor + urgencia + reduccionRiesgo;
    const divisor = (Number(s.esfuerzo) || Number(s.complejidad) || 1);
    const score = totalValue / divisor;
    return Number(score.toFixed(2));
};

export const calculatePuntuacionFinal = (s) => {
    const vn = Number(s.valor_negocio) || 0;
    const urg = Number(s.urgencia) || 0;
    const rr = Number(s.reduccion_riesgo) || 0;
    const de = Number(s.dependencia_estrategica) || 0;
    const ic = Number(s.impacto_cliente) || 0;
    const comp = Number(s.complejidad) || 0;
    const esf = Number(s.esfuerzo) || 0;
    const cd = Number(s.costo_demora) || 0;
    return vn + urg + rr + de + ic + cd - comp - esf;
};

export const getSuggestedPriorities = (stories, limit = 5) => {
    return [...stories]
        .map((s) => ({ ...s, ratio: getValorEsfuerzoRatio(s) }))
        .filter((s) => s.ratio != null)
        .sort((a, b) => b.ratio - a.ratio)
        .slice(0, limit);
};

export const filterStories = (stories, filters) => {
    return stories.filter((s) => {
        if (filters.tipo && s.tipo !== filters.tipo) return false;
        if (filters.estado && s.estado !== filters.estado) return false;
        if (filters.prioridad && s.prioridad !== filters.prioridad) return false;
        if (filters.epic_id && String(s.epic_id) !== String(filters.epic_id)) return false;
        if (filters.sprint_id) {
            if (filters.sprint_id === 'none' && s.sprint_id) return false;
            if (filters.sprint_id !== 'none' && String(s.sprint_id) !== String(filters.sprint_id)) return false;
        }
        if (filters.asignado_a && String(s.asignado_a) !== String(filters.asignado_a)) return false;
        if (filters.search) {
            const q = filters.search.toLowerCase();
            const hay = [s.codigo, s.titulo, s.descripcion, s.rol_usuario, s.necesidad, s.beneficio, getEpicLabel(s)]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            if (!hay.includes(q)) return false;
        }
        return true;
    });
};

export const storiesToCsv = (stories, epics, sprints) => {
    const epicMap = Object.fromEntries(epics.map((e) => [e.id, e.codigo || e.nombre]));
    const sprintMap = Object.fromEntries(sprints.map((sp) => [sp.id, sp.codigo || sp.nombre]));

    return stories.map((s) => ({
        Codigo: s.codigo,
        Titulo: s.titulo,
        Tipo: labelFor(STORY_TYPES, s.tipo),
        Estado: labelFor(STORY_STATES, s.estado),
        Prioridad: labelFor(PRIORITIES, s.prioridad),
        'Story Points': s.story_points ?? '',
        Epica: epicMap[s.epic_id] || '',
        Sprint: sprintMap[s.sprint_id] || '',
        'Prioridad calculada': s.prioridad_score ?? '',
        MoSCoW: s.moscow || '',
        Responsable: getAssigneeName(s),
        'Valor negocio': s.valor_negocio ?? '',
        Urgencia: s.urgencia ?? '',
        Descripcion: s.descripcion || '',
        'Como/quiero/para': [s.rol_usuario, s.necesidad, s.beneficio].filter(Boolean).join(' | '),
    }));
};

export const openBacklogPrintPdf = (stories, projectName) => {
    const rows = stories.map((s) => `
        <tr>
            <td>${s.codigo || ''}</td>
            <td>${s.titulo || ''}</td>
            <td>${getEpicLabel(s)}</td>
            <td>${s.prioridad || ''}</td>
            <td>${s.valor_negocio ?? ''}</td>
            <td>${s.story_points ?? ''}</td>
            <td>${s.estado || ''}</td>
            <td>${getSprintLabel(s)}</td>
            <td>${getAssigneeName(s)}</td>
        </tr>
    `).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Backlog ${projectName}</title>
        <style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ccc;padding:6px;text-align:left}th{background:#f0f0f0}</style></head>
        <body><h2>Backlog — ${projectName}</h2><p>Generado: ${new Date().toLocaleString('es-ES')}</p>
        <table><thead><tr><th>Código</th><th>Historia</th><th>Épica</th><th>Prioridad</th><th>Valor</th><th>SP</th><th>Estado</th><th>Sprint</th><th>Responsable</th></tr></thead>
        <tbody>${rows}</tbody></table></body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
};
