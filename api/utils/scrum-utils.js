const { Op } = require('sequelize');
const {
    Proyecto, ScrumEpic, ScrumStory, ScrumSprint, ScrumConfig,
} = require('../models/index');

const TIPO_PROYECTO_AGIL = 1;
const TIPO_PROYECTO_HIBRIDO = 3;

const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13, 21];
const MOSCOW_WEIGHT = { must: 4, should: 3, could: 2, wont: 1 };

const storyIncludes = () => {
    const { Usuario, Persona } = require('../models/index');
    return [
        { model: ScrumEpic, as: 'Epic', attributes: ['id', 'codigo', 'nombre'] },
        { model: ScrumSprint, as: 'Sprint', attributes: ['id', 'codigo', 'nombre', 'estado'] },
        {
            model: Usuario,
            as: 'Asignado',
            attributes: ['id', 'username'],
            include: [{ model: Persona, as: 'Persona', attributes: ['nombre', 'apellido'] }],
        },
    ];
};

const esTipoProyectoScrum = (tipoProyecto) => {
    const tp = Number(tipoProyecto);
    return tp === TIPO_PROYECTO_AGIL || tp === TIPO_PROYECTO_HIBRIDO;
};

async function assertProyectoScrumHabilitado(res, proyectoId) {
    const pid = parseInt(proyectoId, 10);
    if (Number.isNaN(pid)) {
        res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
        return null;
    }

    const proyecto = await Proyecto.findByPk(pid, {
        attributes: ['id', 'tipo_proyecto', 'modo', 'nombre'],
    });

    if (!proyecto) {
        res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
        return null;
    }

    if (!esTipoProyectoScrum(proyecto.tipo_proyecto)) {
        res.status(400).json({
            success: false,
            message: 'Scrum solo está disponible para proyectos ágiles o híbridos.',
        });
        return null;
    }

    return proyecto;
}

async function getOrCreateConfig(proyectoId) {
    const pid = parseInt(proyectoId, 10);
    let config = await ScrumConfig.findOne({ where: { proyecto_id: pid } });
    if (!config) {
        config = await ScrumConfig.create({ proyecto_id: pid, metodo_priorizacion: 'manual' });
    }
    return config;
}

async function nextCodigo(proyectoId, prefix, Model) {
    const count = await Model.count({ where: { proyecto_id: proyectoId } });
    const num = String(count + 1).padStart(3, '0');
    return `${prefix}-${num}`;
}

function pushHistorial(current, entry) {
    const list = Array.isArray(current) ? [...current] : [];
    list.push({ ...entry, fecha: new Date().toISOString() });
    return list.slice(-100);
}

function pushEstimacionHistorial(current, entry) {
    const list = Array.isArray(current) ? [...current] : [];
    list.push({ ...entry, fecha: new Date().toISOString() });
    return list.slice(-50);
}

function calcularPrioridadScore(story, metodo) {
    const vn = Number(story.valor_negocio) || 0;
    const urg = Number(story.urgencia) || 0;
    const rr = Number(story.reduccion_riesgo) || 0;
    const ic = Number(story.impacto_cliente) || 0;
    const comp = Number(story.complejidad) || 0;
    const pts = Number(story.story_points) || Number(story.esfuerzo) || 1;
    const cd = Number(story.costo_demora) || 0;

    switch (metodo) {
        case 'valor_esfuerzo':
            return pts > 0 ? +(vn / pts).toFixed(2) : vn;
        case 'wsjf':
            return pts > 0 ? +((vn + urg + rr + cd) / pts).toFixed(2) : (vn + urg + rr + cd);
        case 'moscow': {
            const w = MOSCOW_WEIGHT[(story.moscow || '').toLowerCase()] || 0;
            return w;
        }
        case 'formula':
        default:
            return vn + urg + rr + ic - comp;
    }
}

function enrichEpicsWithStats(epics, stories, sprints) {
    return epics.map((epic) => {
        const plain = epic.toJSON ? epic.toJSON() : epic;
        const epicStories = stories.filter((s) => s.epic_id === plain.id && !s.archivado);
        const done = epicStories.filter((s) => s.estado === 'done');
        const totalPoints = epicStories.reduce((a, s) => a + (Number(s.story_points) || 0), 0);
        const completedPoints = done.reduce((a, s) => a + (Number(s.story_points) || 0), 0);
        const sprintIds = [...new Set(epicStories.map((s) => s.sprint_id).filter(Boolean))];
        const sprintInicio = sprintIds.length
            ? sprints.find((sp) => sp.id === Math.min(...sprintIds))
            : null;

        return {
            ...plain,
            stats: {
                totalHistorias: epicStories.length,
                historiasCompletadas: done.length,
                historiasPendientes: epicStories.length - done.length,
                puntosTotales: totalPoints,
                puntosCompletados: completedPoints,
                porcentajeAvance: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
                sprintInicio: sprintInicio ? sprintInicio.nombre : null,
            },
        };
    });
}

function validateDefinitionOfReady(story) {
    const errors = [];
    const descOk = story.descripcion && String(story.descripcion).trim().length > 0;
    const plantillaOk = story.rol_usuario && story.necesidad && story.beneficio;
    if (!descOk && !plantillaOk) {
        errors.push('Debe tener descripción completa o plantilla Como/quiero/para.');
    }

    const criterios = Array.isArray(story.criterios_aceptacion) ? story.criterios_aceptacion : [];
    const criteriosOk = criterios.some((c) => c.dado && c.cuando && c.entonces);
    if (!criteriosOk) {
        errors.push('Debe tener al menos un criterio de aceptación (Dado/Cuando/Entonces).');
    }
    if (!story.prioridad) errors.push('Debe tener prioridad asignada.');
    if (!story.story_points) errors.push('Debe tener story points asignados.');
    if (!story.epic_id) errors.push('Debe estar relacionada con una épica.');
    if (story.dependencias_criticas_abiertas) {
        errors.push('No puede pasar a Ready con dependencias críticas abiertas.');
    }
    if (!story.aprobado_po) errors.push('Debe estar aprobada por el Product Owner.');

    return errors;
}

async function getScrumOverview(proyectoId, options = {}) {
    const pid = parseInt(proyectoId, 10);
    const config = await getOrCreateConfig(pid);

    const storyQuery = {
        where: { proyecto_id: pid, archivado: false },
        include: storyIncludes(),
        order: [['orden_backlog', 'ASC'], ['prioridad_score', 'DESC'], ['created_at', 'ASC']],
    };

    const queries = [
        ScrumEpic.findAll({ where: { proyecto_id: pid }, order: [['created_at', 'ASC']] }),
        ScrumStory.findAll(storyQuery),
        ScrumSprint.findAll({
            where: { proyecto_id: pid },
            order: [['fecha_inicio', 'DESC'], ['created_at', 'DESC']],
        }),
    ];

    if (options.includeArchived) {
        queries.push(ScrumStory.findAll({
            where: { proyecto_id: pid, archivado: true },
            include: storyIncludes(),
            order: [['updated_at', 'DESC']],
        }));
    }

    const results = await Promise.all(queries);
    const epicsRaw = results[0];
    const storiesRaw = results[1];
    const sprints = results[2];
    const archivedRaw = options.includeArchived ? results[3] : [];

    const stories = storiesRaw.map((s) => s.toJSON());
    const archivedStories = archivedRaw.map((s) => s.toJSON());
    const epics = enrichEpicsWithStats(epicsRaw, stories, sprints.map((sp) => sp.toJSON()));
    const activeSprint = sprints.find((s) => s.estado === 'activo') || null;
    const totalPoints = stories.reduce((a, s) => a + (Number(s.story_points) || 0), 0);
    const readyPoints = stories
        .filter((s) => s.estado === 'ready')
        .reduce((a, s) => a + (Number(s.story_points) || 0), 0);
    const unestimated = stories.filter((s) => !s.story_points).length;
    const activeEpics = epics.filter((e) => ['aprobada', 'en_ejecucion'].includes(e.estado)).length;
    const readyPct = stories.length
        ? Math.round((stories.filter((s) => s.estado === 'ready').length / stories.length) * 100)
        : 0;
    const archivedCount = options.includeArchived
        ? archivedStories.length
        : await ScrumStory.count({ where: { proyecto_id: pid, archivado: true } });

    return {
        config: config.toJSON(),
        epics,
        stories,
        archivedStories,
        sprints: await Promise.all(sprints.map((s) => enrichSprint(s))),
        stats: {
            totalEpics: epics.length,
            activeEpics,
            totalStories: stories.length,
            totalSprints: sprints.length,
            storiesReady: stories.filter((s) => s.estado === 'ready').length,
            storiesReadyPct: readyPct,
            storiesDone: stories.filter((s) => s.estado === 'done').length,
            activeSprint: activeSprint ? await enrichSprint(activeSprint) : null,
            totalBacklogPoints: totalPoints,
            readyPoints,
            unestimatedStories: unestimated,
            archivedStories: archivedCount,
        },
    };
}

async function createEpic(proyectoId, data, userId) {
    const codigo = await nextCodigo(proyectoId, 'EPIC', ScrumEpic);
    return ScrumEpic.create({
        proyecto_id: proyectoId,
        codigo,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        objetivo_estrategico: data.objetivo_estrategico || null,
        beneficio_esperado: data.beneficio_esperado || null,
        valor_negocio: data.valor_negocio || null,
        prioridad: data.prioridad || null,
        estado: data.estado || 'propuesta',
        responsable_id: data.responsable_id || null,
        fecha_objetivo: data.fecha_objetivo || null,
        entregable_ref: data.entregable_ref || null,
        riesgos_asociados: data.riesgos_asociados || null,
        created_by: userId,
    });
}

async function updateEpic(epicId, proyectoId, data) {
    const epic = await ScrumEpic.findOne({ where: { id: epicId, proyecto_id: proyectoId } });
    if (!epic) throw Object.assign(new Error('Épica no encontrada'), { statusCode: 404 });
    await epic.update(data);
    return epic;
}

async function deleteEpic(epicId, proyectoId) {
    const epic = await ScrumEpic.findOne({ where: { id: epicId, proyecto_id: proyectoId } });
    if (!epic) throw Object.assign(new Error('Épica no encontrada'), { statusCode: 404 });
    const linked = await ScrumStory.count({ where: { epic_id: epicId, archivado: false } });
    if (linked > 0) {
        throw Object.assign(new Error('No se puede eliminar: tiene historias asociadas.'), { statusCode: 400 });
    }
    await epic.destroy();
    return true;
}

async function getNextOrden(proyectoId) {
    const max = await ScrumStory.max('orden_backlog', { where: { proyecto_id: proyectoId, archivado: false } });
    return (max || 0) + 1;
}

async function createStory(proyectoId, data, userId) {
    const codigo = await nextCodigo(proyectoId, 'HU', ScrumStory);
    const orden = await getNextOrden(proyectoId);
    const config = await getOrCreateConfig(proyectoId);

    const payload = {
        proyecto_id: proyectoId,
        codigo,
        orden_backlog: orden,
        tipo: data.tipo || 'historia',
        titulo: data.titulo,
        epic_id: data.epic_id || null,
        sprint_id: data.sprint_id || null,
        rol_usuario: data.rol_usuario || null,
        necesidad: data.necesidad || null,
        beneficio: data.beneficio || null,
        descripcion: data.descripcion || null,
        criterios_aceptacion: data.criterios_aceptacion || [],
        reglas_negocio: data.reglas_negocio || null,
        dependencias: data.dependencias || null,
        supuestos: data.supuestos || null,
        riesgos_asociados: data.riesgos_asociados || null,
        riesgo: data.riesgo || null,
        prioridad: data.prioridad || null,
        valor_negocio: data.valor_negocio ?? null,
        urgencia: data.urgencia ?? null,
        reduccion_riesgo: data.reduccion_riesgo ?? null,
        dependencia_estrategica: data.dependencia_estrategica ?? null,
        impacto_cliente: data.impacto_cliente ?? null,
        complejidad: data.complejidad ?? null,
        esfuerzo: data.esfuerzo ?? null,
        costo_demora: data.costo_demora ?? null,
        moscow: data.moscow || null,
        story_points: data.story_points ?? null,
        estado: data.estado || 'idea',
        asignado_a: data.asignado_a || null,
        aprobado_po: Boolean(data.aprobado_po),
        dependencias_criticas_abiertas: Boolean(data.dependencias_criticas_abiertas),
        comentarios: data.comentarios || [],
        created_by: userId,
        historial: pushHistorial([], { usuario_id: userId, accion: 'creacion', detalle: 'Historia creada' }),
    };

    if (data.aprobado_po) {
        payload.aprobado_po_por = userId;
        payload.aprobado_po_at = new Date();
    }

    payload.prioridad_score = calcularPrioridadScore(payload, config.metodo_priorizacion);

    if (payload.story_points) {
        payload.estimado_por = userId;
        payload.estimado_at = new Date();
        payload.estimacion_comentario = data.estimacion_comentario || null;
        payload.estimacion_historial = pushEstimacionHistorial([], {
            usuario_id: userId,
            puntos: payload.story_points,
            comentario: data.estimacion_comentario || '',
        });
    }

    if (payload.estado === 'ready') {
        const dorErrors = validateDefinitionOfReady(payload);
        if (dorErrors.length) {
            throw Object.assign(new Error(dorErrors.join(' ')), { statusCode: 400, dorErrors });
        }
    }

    return ScrumStory.create(payload);
}

async function updateStory(storyId, proyectoId, data, userId) {
    const story = await ScrumStory.findOne({ where: { id: storyId, proyecto_id: proyectoId, archivado: false } });
    if (!story) throw Object.assign(new Error('Historia no encontrada'), { statusCode: 404 });

    const config = await getOrCreateConfig(proyectoId);
    const merged = { ...story.toJSON(), ...data };

    if (data.estado === 'ready' || (merged.estado === 'ready' && data.estado !== undefined)) {
        const dorErrors = validateDefinitionOfReady(merged);
        if (dorErrors.length) {
            throw Object.assign(new Error(dorErrors.join(' ')), { statusCode: 400, dorErrors });
        }
    }

    const updates = { ...data };
    updates.historial = pushHistorial(story.historial, {
        usuario_id: userId,
        accion: 'actualizacion',
        detalle: data.estado ? `Estado → ${data.estado}` : 'Campos actualizados',
    });

    if (data.story_points !== undefined && data.story_points !== story.story_points) {
        updates.estimado_por = userId;
        updates.estimado_at = new Date();
        updates.estimacion_historial = pushEstimacionHistorial(story.estimacion_historial, {
            usuario_id: userId,
            puntos_anteriores: story.story_points,
            puntos: data.story_points,
            comentario: data.estimacion_comentario || '',
        });
    }

    if (data.aprobado_po && !story.aprobado_po) {
        updates.aprobado_po_por = userId;
        updates.aprobado_po_at = new Date();
    }

    updates.prioridad_score = calcularPrioridadScore({ ...story.toJSON(), ...updates }, config.metodo_priorizacion);

    await story.update(updates);
    return ScrumStory.findByPk(storyId, { include: storyIncludes() });
}

async function archiveStory(storyId, proyectoId, userId) {
    const story = await ScrumStory.findOne({ where: { id: storyId, proyecto_id: proyectoId } });
    if (!story) throw Object.assign(new Error('Historia no encontrada'), { statusCode: 404 });
    await story.update({
        archivado: true,
        historial: pushHistorial(story.historial, {
            usuario_id: userId,
            accion: 'archivado',
            detalle: 'Ítem archivado',
        }),
    });
    return true;
}

async function unarchiveStory(storyId, proyectoId, userId) {
    const story = await ScrumStory.findOne({ where: { id: storyId, proyecto_id: proyectoId } });
    if (!story) throw Object.assign(new Error('Historia no encontrada'), { statusCode: 404 });
    await story.update({
        archivado: false,
        historial: pushHistorial(story.historial, {
            usuario_id: userId,
            accion: 'restaurado',
            detalle: 'Ítem restaurado desde archivo',
        }),
    });
    return ScrumStory.findByPk(storyId, { include: storyIncludes() });
}

async function deleteStory(storyId, proyectoId) {
    const story = await ScrumStory.findOne({ where: { id: storyId, proyecto_id: proyectoId } });
    if (!story) throw Object.assign(new Error('Historia no encontrada'), { statusCode: 404 });
    await story.destroy();
    return true;
}

async function duplicateStory(storyId, proyectoId, userId) {
    const story = await ScrumStory.findOne({ where: { id: storyId, proyecto_id: proyectoId } });
    if (!story) throw Object.assign(new Error('Historia no encontrada'), { statusCode: 404 });

    const plain = story.toJSON();
    delete plain.id;
    delete plain.codigo;
    delete plain.created_at;
    delete plain.updated_at;
    plain.titulo = `${plain.titulo} (copia)`;
    plain.estado = 'idea';
    plain.sprint_id = null;
    plain.aprobado_po = false;
    plain.aprobado_po_por = null;
    plain.aprobado_po_at = null;

    return createStory(proyectoId, plain, userId);
}

async function reorderStories(proyectoId, orderedIds) {
    const updates = orderedIds.map((id, index) =>
        ScrumStory.update(
            { orden_backlog: index + 1 },
            { where: { id, proyecto_id: proyectoId, archivado: false } },
        ));
    await Promise.all(updates);
    return true;
}

async function recalculatePriorities(proyectoId, metodoOverride) {
    const config = await getOrCreateConfig(proyectoId);
    const metodo = metodoOverride || config.metodo_priorizacion;
    if (metodoOverride) {
        await config.update({ metodo_priorizacion: metodoOverride });
    }

    const stories = await ScrumStory.findAll({
        where: { proyecto_id: proyectoId, archivado: false },
    });

    const scored = stories.map((s) => ({
        story: s,
        score: calcularPrioridadScore(s, metodo),
    })).sort((a, b) => b.score - a.score);

    await Promise.all(scored.map(({ story, score }, index) =>
        story.update({ prioridad_score: score, orden_backlog: index + 1 })));

    return { metodo, count: scored.length };
}

async function updateConfig(proyectoId, data) {
    const config = await getOrCreateConfig(proyectoId);
    await config.update(data);
    return config;
}

async function attachSprintTeam(sprintData) {
    const { Usuario, Persona } = require('../models/index');
    const personaInclude = [{ model: Persona, as: 'Persona', attributes: ['nombre', 'apellido'] }];

    const loadUser = async (userId) => {
        if (!userId) return null;
        const u = await Usuario.findByPk(userId, {
            attributes: ['id', 'username'],
            include: personaInclude,
        });
        return u ? u.toJSON() : null;
    };

    const [ScrumMaster, ProductOwner] = await Promise.all([
        loadUser(sprintData.scrum_master_id),
        loadUser(sprintData.product_owner_id),
    ]);

    return { ...sprintData, ScrumMaster, ProductOwner };
}

async function recalcSprintPoints(sprintId) {
    const stories = await ScrumStory.findAll({
        where: { sprint_id: sprintId, archivado: false },
        attributes: ['story_points', 'estado'],
    });
    const comprometidos = stories.reduce((a, s) => a + (Number(s.story_points) || 0), 0);
    const completados = stories
        .filter((s) => s.estado === 'done')
        .reduce((a, s) => a + (Number(s.story_points) || 0), 0);
    await ScrumSprint.update(
        { puntos_comprometidos: comprometidos, puntos_completados: completados },
        { where: { id: sprintId } },
    );
    return { comprometidos, completados, historias: stories.length };
}

async function enrichSprint(sprintRow) {
    const s = sprintRow.toJSON ? sprintRow.toJSON() : sprintRow;
    const stories = await ScrumStory.findAll({
        where: { sprint_id: s.id, archivado: false },
        attributes: ['id', 'story_points', 'estado'],
    });
    const puntosComprometidos = stories.reduce((a, st) => a + (Number(st.story_points) || 0), 0);
    const puntosCompletados = stories
        .filter((st) => st.estado === 'done')
        .reduce((a, st) => a + (Number(st.story_points) || 0), 0);
    const capacidad = Number(s.capacidad_puntos) || 0;
    return {
        ...s,
        totalHistorias: stories.length,
        puntos_comprometidos: puntosComprometidos,
        puntos_completados: puntosCompletados,
        capacidadPct: capacidad > 0 ? Math.round((puntosComprometidos / capacidad) * 100) : 0,
        sobreCapacidad: capacidad > 0 && puntosComprometidos > capacidad,
    };
}

async function getSprintById(sprintId, proyectoId) {
    const sprint = await ScrumSprint.findOne({
        where: { id: sprintId, proyecto_id: proyectoId },
    });
    if (!sprint) throw Object.assign(new Error('Sprint no encontrado'), { statusCode: 404 });
    const enriched = await enrichSprint(sprint);
    return attachSprintTeam(enriched);
}

async function createSprint(proyectoId, data, userId) {
    const codigo = await nextCodigo(proyectoId, 'SPRINT', ScrumSprint);
    const sprint = await ScrumSprint.create({
        proyecto_id: proyectoId,
        codigo,
        nombre: data.nombre,
        objetivo: data.objetivo || null,
        fecha_inicio: data.fecha_inicio || null,
        fecha_fin: data.fecha_fin || null,
        capacidad_puntos: Number(data.capacidad_puntos) || 0,
        estado: 'planificado',
        scrum_master_id: data.scrum_master_id || null,
        product_owner_id: data.product_owner_id || null,
        riesgos: Array.isArray(data.riesgos) ? data.riesgos : [],
    });
    return getSprintById(sprint.id, proyectoId);
}

async function updateSprint(sprintId, proyectoId, data) {
    const sprint = await ScrumSprint.findOne({ where: { id: sprintId, proyecto_id: proyectoId } });
    if (!sprint) throw Object.assign(new Error('Sprint no encontrado'), { statusCode: 404 });
    if (sprint.estado === 'activo' && data.estado !== 'cerrado') {
        const allowed = ['objetivo', 'comentarios_cierre', 'riesgos'];
        const keys = Object.keys(data);
        if (keys.some((k) => !allowed.includes(k))) {
            throw Object.assign(new Error('Sprint activo: solo se pueden editar campos limitados.'), { statusCode: 400 });
        }
    }
    if (sprint.estado === 'cerrado' || sprint.estado === 'cancelado') {
        throw Object.assign(new Error('No se puede editar un sprint cerrado o cancelado.'), { statusCode: 400 });
    }
    await sprint.update(data);
    await recalcSprintPoints(sprintId);
    return getSprintById(sprintId, proyectoId);
}

async function deleteSprint(sprintId, proyectoId) {
    const sprint = await ScrumSprint.findOne({ where: { id: sprintId, proyecto_id: proyectoId } });
    if (!sprint) throw Object.assign(new Error('Sprint no encontrado'), { statusCode: 404 });
    if (sprint.estado !== 'planificado') {
        throw Object.assign(new Error('Solo se pueden eliminar sprints en estado planificado.'), { statusCode: 400 });
    }
    const stories = await ScrumStory.findAll({ where: { sprint_id: sprintId } });
    await Promise.all(stories.map((s) => s.update({ sprint_id: null, estado: 'ready' })));
    await sprint.destroy();
    return true;
}

function buildActivationChecklist(sprint, sprintStories) {
    const s = sprint;
    return {
        objetivo: Boolean(s.objetivo && String(s.objetivo).trim()),
        fechas: Boolean(s.fecha_inicio && s.fecha_fin),
        historias: sprintStories.length > 0,
        capacidad: Number(s.capacidad_puntos) > 0,
        equipo: Boolean(s.scrum_master_id || s.product_owner_id),
        historiasEstimadas: sprintStories.every((st) => st.story_points),
        historiasReady: sprintStories.every((st) => st.estado === 'ready' || st.estado === 'en_sprint'),
    };
}

async function getSprintPlanning(proyectoId, sprintId) {
    const sprint = await getSprintById(sprintId, proyectoId);
    const [readyStories, sprintStories] = await Promise.all([
        ScrumStory.findAll({
            where: {
                proyecto_id: proyectoId,
                archivado: false,
                estado: 'ready',
                sprint_id: null,
            },
            include: storyIncludes(),
            order: [['prioridad_score', 'DESC'], ['orden_backlog', 'ASC']],
        }),
        ScrumStory.findAll({
            where: { proyecto_id: proyectoId, archivado: false, sprint_id: sprintId },
            include: storyIncludes(),
            order: [['prioridad_score', 'DESC'], ['orden_backlog', 'ASC']],
        }),
    ]);
    const ready = readyStories.map((s) => s.toJSON());
    const selected = sprintStories.map((s) => s.toJSON());
    const checklist = buildActivationChecklist(sprint, selected);
    const capacidad = Number(sprint.capacidad_puntos) || 0;
    const comprometidos = sprint.puntos_comprometidos || 0;
    return {
        sprint,
        readyStories: ready,
        sprintStories: selected,
        checklist,
        capacityPct: capacidad > 0 ? Math.round((comprometidos / capacidad) * 100) : 0,
        overCapacity: capacidad > 0 && comprometidos > capacidad,
        nearCapacity: capacidad > 0 && comprometidos >= capacidad * 0.95,
    };
}

async function assertSprintPlanificable(sprint) {
    if (sprint.estado !== 'planificado') {
        throw Object.assign(new Error('Solo se puede modificar la planificación de sprints planificados.'), { statusCode: 400 });
    }
}

async function assignStoryToSprint(storyId, sprintId, proyectoId, userId) {
    const sprint = await ScrumSprint.findOne({ where: { id: sprintId, proyecto_id: proyectoId } });
    if (!sprint) throw Object.assign(new Error('Sprint no encontrado'), { statusCode: 404 });
    await assertSprintPlanificable(sprint);

    const story = await ScrumStory.findOne({ where: { id: storyId, proyecto_id: proyectoId, archivado: false } });
    if (!story) throw Object.assign(new Error('Historia no encontrada'), { statusCode: 404 });
    if (story.estado !== 'ready') {
        throw Object.assign(new Error('Solo historias en estado Ready pueden entrar al sprint.'), { statusCode: 400 });
    }
    if (story.sprint_id && story.sprint_id !== sprintId) {
        throw Object.assign(new Error('La historia ya pertenece a otro sprint.'), { statusCode: 400 });
    }

    await story.update({
        sprint_id: sprintId,
        estado: 'ready',
        historial: pushHistorial(story.historial, {
            usuario_id: userId,
            accion: 'sprint_asignado',
            detalle: `Asignada a ${sprint.nombre}`,
        }),
    });
    await recalcSprintPoints(sprintId);
    return ScrumStory.findByPk(storyId, { include: storyIncludes() });
}

async function removeStoryFromSprint(storyId, sprintId, proyectoId, userId) {
    const sprint = await ScrumSprint.findOne({ where: { id: sprintId, proyecto_id: proyectoId } });
    if (!sprint) throw Object.assign(new Error('Sprint no encontrado'), { statusCode: 404 });
    await assertSprintPlanificable(sprint);

    const story = await ScrumStory.findOne({
        where: { id: storyId, proyecto_id: proyectoId, sprint_id: sprintId, archivado: false },
    });
    if (!story) throw Object.assign(new Error('Historia no encontrada en el sprint'), { statusCode: 404 });

    await story.update({
        sprint_id: null,
        estado: 'ready',
        historial: pushHistorial(story.historial, {
            usuario_id: userId,
            accion: 'sprint_removido',
            detalle: `Removida de ${sprint.nombre}`,
        }),
    });
    await recalcSprintPoints(sprintId);
    return true;
}

async function saveSprintPlanning(sprintId, proyectoId, storyIds, userId) {
    const sprint = await ScrumSprint.findOne({ where: { id: sprintId, proyecto_id: proyectoId } });
    if (!sprint) throw Object.assign(new Error('Sprint no encontrado'), { statusCode: 404 });
    await assertSprintPlanificable(sprint);

    const ids = Array.isArray(storyIds) ? storyIds.map((id) => parseInt(id, 10)) : [];

    const current = await ScrumStory.findAll({
        where: { proyecto_id: proyectoId, sprint_id: sprintId, archivado: false },
    });

    const toRemove = current.filter((s) => !ids.includes(s.id));
    await Promise.all(toRemove.map((s) => removeStoryFromSprint(s.id, sprintId, proyectoId, userId)));

    for (const id of ids) {
        const story = await ScrumStory.findOne({ where: { id, proyecto_id: proyectoId, archivado: false } });
        if (!story) continue;
        if (story.sprint_id && story.sprint_id !== sprintId) {
            throw Object.assign(new Error(`Historia ${story.codigo} ya está en otro sprint.`), { statusCode: 400 });
        }
        if (story.estado !== 'ready' && story.sprint_id !== sprintId) {
            throw Object.assign(new Error(`Historia ${story.codigo} debe estar en Ready.`), { statusCode: 400 });
        }
        if (!story.sprint_id) {
            await assignStoryToSprint(id, sprintId, proyectoId, userId);
        }
    }

    await recalcSprintPoints(sprintId);
    return getSprintPlanning(proyectoId, sprintId);
}

async function activateSprint(sprintId, proyectoId, userId) {
    const sprint = await ScrumSprint.findOne({ where: { id: sprintId, proyecto_id: proyectoId } });
    if (!sprint) throw Object.assign(new Error('Sprint no encontrado'), { statusCode: 404 });
    if (sprint.estado !== 'planificado') {
        throw Object.assign(new Error('Solo se pueden activar sprints planificados.'), { statusCode: 400 });
    }

    const planning = await getSprintPlanning(proyectoId, sprintId);
    const { checklist } = planning;
    const errors = [];
    if (!checklist.objetivo) errors.push('Definir objetivo del sprint.');
    if (!checklist.fechas) errors.push('Confirmar fechas de inicio y fin.');
    if (!checklist.equipo) errors.push('Asignar Product Owner o Scrum Master.');
    if (!checklist.historias) errors.push('Seleccionar al menos una historia.');
    if (errors.length) {
        throw Object.assign(new Error(errors.join(' ')), { statusCode: 400, checklist });
    }

    const otherActive = await ScrumSprint.findOne({
        where: { proyecto_id: proyectoId, estado: 'activo', id: { [Op.ne]: sprintId } },
    });
    if (otherActive) {
        throw Object.assign(
            new Error(`Ya existe un sprint activo (${otherActive.nombre}). Ciérralo antes de activar otro.`),
            { statusCode: 400 },
        );
    }

    await sprint.update({ estado: 'activo' });

    const stories = await ScrumStory.findAll({
        where: { sprint_id: sprintId, archivado: false },
    });
    await Promise.all(stories.map((s) => s.update({
        estado: 'en_sprint',
        kanban_column: 'todo',
        historial: pushHistorial(s.historial, {
            usuario_id: userId,
            accion: 'sprint_activado',
            detalle: `Sprint ${sprint.nombre} activado`,
        }),
    })));

    return getSprintById(sprintId, proyectoId);
}

async function closeSprint(sprintId, proyectoId, userId, data = {}) {
    const sprint = await ScrumSprint.findOne({ where: { id: sprintId, proyecto_id: proyectoId } });
    if (!sprint) throw Object.assign(new Error('Sprint no encontrado'), { statusCode: 404 });
    if (sprint.estado !== 'activo') {
        throw Object.assign(new Error('Solo se pueden cerrar sprints activos.'), { statusCode: 400 });
    }

    await recalcSprintPoints(sprintId);
    await sprint.update({
        estado: 'cerrado',
        comentarios_cierre: data.comentarios_cierre || sprint.comentarios_cierre,
    });

    const incomplete = await ScrumStory.findAll({
        where: {
            sprint_id: sprintId,
            archivado: false,
            estado: { [Op.ne]: 'done' },
        },
    });
    await Promise.all(incomplete.map((s) => s.update({
        sprint_id: null,
        estado: 'ready',
        kanban_column: 'todo',
        historial: pushHistorial(s.historial, {
            usuario_id: userId,
            accion: 'sprint_cerrado',
            detalle: 'Devuelta al backlog tras cierre de sprint',
        }),
    })));

    return getSprintById(sprintId, proyectoId);
}

async function clearSprintStories(sprintId, proyectoId, userId) {
    const sprint = await ScrumSprint.findOne({ where: { id: sprintId, proyecto_id: proyectoId } });
    if (!sprint) throw Object.assign(new Error('Sprint no encontrado'), { statusCode: 404 });
    await assertSprintPlanificable(sprint);
    const stories = await ScrumStory.findAll({ where: { sprint_id: sprintId, archivado: false } });
    await Promise.all(stories.map((s) => removeStoryFromSprint(s.id, sprintId, proyectoId, userId)));
    return getSprintPlanning(proyectoId, sprintId);
}

module.exports = {
    TIPO_PROYECTO_AGIL,
    TIPO_PROYECTO_HIBRIDO,
    FIBONACCI_POINTS,
    esTipoProyectoScrum,
    assertProyectoScrumHabilitado,
    getScrumOverview,
    validateDefinitionOfReady,
    calcularPrioridadScore,
    createEpic,
    updateEpic,
    deleteEpic,
    createStory,
    updateStory,
    archiveStory,
    unarchiveStory,
    deleteStory,
    duplicateStory,
    reorderStories,
    recalculatePriorities,
    updateConfig,
    createSprint,
    updateSprint,
    deleteSprint,
    getSprintById,
    getSprintPlanning,
    assignStoryToSprint,
    removeStoryFromSprint,
    saveSprintPlanning,
    activateSprint,
    closeSprint,
    clearSprintStories,
    recalcSprintPoints,
};
