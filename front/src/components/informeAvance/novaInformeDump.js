/**
 * Texto plano para portapapeles → NOVA (ChatGPT), alineado al informe de avance en GORU.
 * Tope global para no saturar el chat ni el portapapeles.
 */
export const NOVA_GPT_URL = 'https://chatgpt.com/g/g-6994b0ba071c8191abacf65b2da3deca-nova';

export const NOVA_DUMP_MAX_CHARS = 28000;

/**
 * Abre NOVA en una ventana emergente (tamaño reducido, centrada).
 * Nombre de ventana fijo para reutilizar la misma al repetir clic.
 */
export function openNovaPopup() {
    const w = 920;
    const h = 780;
    const left = Math.max(0, Math.round((window.screen.availWidth - w) / 2));
    const top = Math.max(0, Math.round((window.screen.availHeight - h) / 5));
    const features = [
        `width=${w}`,
        `height=${h}`,
        `left=${left}`,
        `top=${top}`,
        'scrollbars=yes',
        'resizable=yes',
        'menubar=no',
        'toolbar=no',
        'location=yes',
        'status=no',
    ].join(',');
    const win = window.open(NOVA_GPT_URL, 'goru_nova_gpt', features);
    try {
        if (win) win.opener = null;
    } catch {
        /* noop */
    }
    return win;
}

/** Instrucción para el asistente «¿Qué hacemos hoy?» — solo día actual; respuesta breve. */
export const NOVA_INSTR_GORU_HOY =
    'Rol: asistente Goru vía NOVA. El proyecto está en marcha: evaluá su estado basándote en la información de abajo. '
    + 'Analizá esa información y respondé de forma muy breve con: '
    + '(1) las 5 acciones críticas que debo hacer el día de hoy; '
    + '(2) una lista de 3 posibles riesgos críticos que identifiques hoy; '
    + '(3) una conclusión del estado del proyecto en tono ejecutivo, en un solo párrafo de hasta 5 líneas. '
    + 'Solo el día actual; no planees más allá de hoy. Español.\n\n';

export function novaInstrGoruSeguimiento(preguntaUsuario) {
    const q = (preguntaUsuario || '').trim() || '(sin texto adicional)';
    return (
        'Seguimiento en la conversación con Goru / NOVA. Mensaje del usuario en GORU:\n'
        + `${q}\n\n`
        + 'Respondé con foco en el día actual. Datos de referencia del proyecto a continuación.\n\n'
    );
}

function trunc(s, max = 600) {
    if (s == null || s === '') return '';
    const t = String(s).replace(/\r\n/g, '\n').trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max - 1)}…`;
}

function fmtDate(d) {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return String(d);
    }
}

function fmtMoney(v) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v) || 0);
}

function estadoProyectoLabel(e) {
    const m = { P: 'Planificado', S: 'Iniciado', X: 'En Ejecución', E: 'Cerrado' };
    return m[e] || e || '—';
}

function tipoProyectoLabel(tp) {
    if (tp === 1) return 'Ágil';
    if (tp === 2) return 'Predictivo';
    if (tp === 3) return 'Híbrido';
    return tp != null ? String(tp) : '—';
}

function safeJson(obj, max = 2200) {
    if (obj == null) return '(sin datos)';
    try {
        return trunc(JSON.stringify(obj, null, 0), max);
    } catch {
        return trunc(String(obj), max);
    }
}

function promEncuesta(encuesta) {
    const campos = [
        'comunicacion', 'rapidez_respuesta', 'manejo_reuniones',
        'cumplimiento_plazos', 'cumplimiento_alcance', 'calidad_entregado',
        'nivel_capacitaciones', 'gestion_documentacion', 'experiencia_director',
        'satisfaccion_general',
    ];
    const suma = campos.reduce((acc, campo) => acc + (Number(encuesta[campo]) || 0), 0);
    return (suma / campos.length).toFixed(1);
}

export function computeNovaSolicitudesImpact(listaSolicitudes) {
    const solicitudesAprobadas = (listaSolicitudes || []).filter((s) => s.estado === 'Aprobado');
    const getAnalisisImpacto = (s) =>
        typeof s.analisis_impacto === 'string' ? {} : (s.analisis_impacto || {});
    const impactoDolares = solicitudesAprobadas.reduce((acc, s) => {
        const val = parseFloat(getAnalisisImpacto(s).dolares);
        return acc + (isNaN(val) ? 0 : val);
    }, 0);
    const totalImpactoTiempo = solicitudesAprobadas.reduce((acc, s) => {
        const ai =
            typeof s.analisis_impacto === 'string'
                ? (() => {
                    try {
                        return JSON.parse(s.analisis_impacto);
                    } catch {
                        return {};
                    }
                })()
                : (s.analisis_impacto || {});
        return acc + Number(ai.tiempo || 0);
    }, 0);
    return {
        solicitudesAprobadasCount: solicitudesAprobadas.length,
        impactoDolares,
        totalImpactoTiempo,
    };
}

export function computeNovaRetrasosFlags({
    alcanceEntregables = [],
    tiempoFechasCriticas = [],
    costoEntregable = [],
    calidadMetricas = [],
    todo = [],
}) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const alcanceRetrasado = alcanceEntregables.filter((ent) => {
        const deadline = ent.deadline ? new Date(ent.deadline) : null;
        return deadline && deadline < hoy && !ent.completado;
    });
    const hitosRetrasados = tiempoFechasCriticas.filter((h) => {
        const fecha = h.date ? new Date(h.date) : null;
        return fecha && fecha < hoy && !h.completado;
    });
    const costosRetrasados = costoEntregable.filter((c) => {
        const deadline = c.deadline ? new Date(c.deadline) : null;
        return deadline && deadline < hoy && !c.completado;
    });
    const calidadPendiente = calidadMetricas.filter((c) => !c.completado);
    const tareasAtrasadas = todo.filter((t) => {
        const fecha = t.dueDate ? new Date(t.dueDate) : null;
        return fecha && fecha < hoy && !t.done;
    });

    const hayRetrasos =
        alcanceRetrasado.length > 0 ||
        hitosRetrasados.length > 0 ||
        costosRetrasados.length > 0 ||
        tareasAtrasadas.length > 0;
    const hayCualquierAlerta = hayRetrasos || calidadPendiente.length > 0;

    return { hayRetrasos, hayCualquierAlerta };
}

/**
 * Volcado para «¿Qué hacemos hoy?»: mismo cuerpo que el informe, pero sin guardar en BD.
 * @param {object} p — incluye `usuario` (sesión) para el nombre en cabecera.
 */
export function buildNovaHoyDump(p) {
    const {
        usuario,
        listaSolicitudes,
        proyectoId,
        projectDetail,
        resumenEjecucion,
        resumenDesempeno,
        estadisticas,
        logs,
        riesgosList,
        listaEncuestas,
        alcanceEntregables,
        tiempoFechasCriticas,
        costoEntregable,
        calidadMetricas,
        todo,
        totalesAprobados,
        presupuesto,
        ganttSummary,
        leccionesAprendidas,
    } = p;

    const { impactoDolares, totalImpactoTiempo, solicitudesAprobadasCount } =
        computeNovaSolicitudesImpact(listaSolicitudes);
    const { hayRetrasos, hayCualquierAlerta } = computeNovaRetrasosFlags({
        alcanceEntregables,
        tiempoFechasCriticas,
        costoEntregable,
        calidadMetricas,
        todo,
    });

    const today = new Date().toISOString().split('T')[0];
    let nombrePersona = '—';
    if (usuario?.Persona) {
        nombrePersona = `${usuario.Persona.nombre || ''} ${usuario.Persona.apellido || ''}`.trim() || usuario?.username || '—';
    } else if (usuario?.username) {
        nombrePersona = usuario.username;
    }

    return buildNovaStructuredDump(
        {
            proyectoId,
            projectDetail,
            formData: {
                nombrePersona,
                fechaInforme: today,
                conclusiones:
                    '(Volcado efímero generado por GORU para NOVA — no es un informe de avance guardado.)',
                proximosPasos: '(Asistente del día: prioridades solo para la fecha actual.)',
            },
            recomendacionesIa: '',
            resumenEjecucion,
            resumenDesempeno,
            estadisticas,
            logs,
            riesgosList,
            listaSolicitudes,
            listaEncuestas,
            alcanceEntregables,
            tiempoFechasCriticas,
            costoEntregable,
            calidadMetricas,
            todo,
            totalesAprobados,
            presupuesto,
            ganttSummary,
            leccionesAprendidas,
            hayRetrasos,
            hayCualquierAlerta,
            impactoDolares,
            totalImpactoTiempo,
            solicitudesAprobadasCount,
        },
        { mode: 'hoy' },
    );
}

/**
 * @param {object} p - mismos datos que recibe InformeAvanceModal (props + formData + recomendacionesIa)
 * @param {object} [options]
 * @param {'informe'|'hoy'} [options.mode] — cabecera del volcado
 */
export function buildNovaStructuredDump(p, options = {}) {
    const mode = options.mode || 'informe';
    const {
        proyectoId,
        projectDetail,
        formData,
        recomendacionesIa,
        resumenEjecucion,
        resumenDesempeno,
        estadisticas,
        logs,
        riesgosList,
        listaSolicitudes,
        listaEncuestas,
        alcanceEntregables,
        tiempoFechasCriticas,
        costoEntregable,
        calidadMetricas,
        todo,
        totalesAprobados,
        presupuesto,
        ganttSummary,
        leccionesAprendidas,
        hayRetrasos,
        hayCualquierAlerta,
        impactoDolares,
        totalImpactoTiempo,
        solicitudesAprobadasCount,
    } = p;

    const modo =
        projectDetail?.modo === 'A' ? 'Proyecto personal'
            : projectDetail?.modo === 'PR' ? 'Programa' : 'Proyecto';

    const director = projectDetail?.DirectorProyecto?.Persona
        ? `${projectDetail.DirectorProyecto.Persona.nombre} ${projectDetail.DirectorProyecto.Persona.apellido}`.trim()
        : '—';
    const patrocinador = projectDetail?.Patrocinador?.Persona
        ? `${projectDetail.Patrocinador.Persona.nombre} ${projectDetail.Patrocinador.Persona.apellido}`.trim()
        : '—';

    const chunks = [];

    const push = (title, body) => {
        if (body == null || String(body).trim() === '') return;
        chunks.push(`--- ${title} ---\n${String(body).trim()}`);
    };

    const tituloCabecera =
        mode === 'hoy'
            ? '=== Volcado efímero GORU — Asistente «¿Qué hacemos hoy?» (no se guarda informe) ==='
            : '=== Volcado estructurado para NOVA (informe de avance / proyecto en marcha) ===';

    push('Cabecera GORU', [
        tituloCabecera,
        `proyecto_id (GORU): ${proyectoId != null ? proyectoId : '—'}`,
        `modo: ${modo}`,
        `nombre: ${projectDetail?.nombre || '—'}`,
        `ref/numero: ${projectDetail?.numero != null ? String(projectDetail.numero) : '—'}`,
        `estado: ${estadoProyectoLabel(projectDetail?.estado)}`,
        projectDetail?.modo !== 'PR' ? `tipo_proyecto: ${tipoProyectoLabel(projectDetail?.tipo_proyecto)}` : null,
        `director: ${director}`,
        `patrocinador: ${patrocinador}`,
        `departamento: ${projectDetail?.Departamento?.nombre || '—'}`,
        `fecha_inicio: ${fmtDate(projectDetail?.fecha_inicio)}`,
        `fecha_cierre: ${fmtDate(projectDetail?.fecha_cierre)}`,
        `presupuesto_planificado: ${fmtMoney(presupuesto)}`,
        `informacion_breve: ${trunc(projectDetail?.informacion, 900)}`,
        `fecha_informe: ${formData?.fechaInforme || '—'}`,
        `elaborado_por: ${formData?.nombrePersona?.trim() || '—'}`,
        `flags_ui: hay_retrasos_o_alertas_similares=${hayCualquierAlerta ? 'sí' : 'no'}; hay_retrasos_estrictos=${hayRetrasos ? 'sí' : 'no'}`,
        `solicitudes_aprobadas (resumen): cantidad_aprobada_en_ui=${solicitudesAprobadasCount != null ? solicitudesAprobadasCount : '—'}; impacto_USD_aprox=${impactoDolares != null ? impactoDolares : '—'}; impacto_tiempo_dias=${totalImpactoTiempo != null ? totalImpactoTiempo : '—'}`,
        `totales_aprobados_cambios: ${safeJson(totalesAprobados, 400)}`,
    ].filter(Boolean).join('\n'));

    if (ganttSummary) {
        push('Gantt (resumen)', [
            `inicio: ${ganttSummary.start || '—'}`,
            `fin: ${ganttSummary.end || '—'}`,
            `total_dias: ${ganttSummary.totalDays != null ? ganttSummary.totalDays : '—'}`,
        ].join('\n'));
    }

    push('Estadísticas / satisfacción (objeto)', safeJson(estadisticas, 1800));
    push('Resumen ejecución', typeof resumenEjecucion === 'string' ? trunc(resumenEjecucion, 4500) : safeJson(resumenEjecucion, 3500));
    push('Resumen desempeño', typeof resumenDesempeno === 'string' ? trunc(resumenDesempeno, 4500) : safeJson(resumenDesempeno, 3500));

    const enc = listaEncuestas || [];
    if (enc.length) {
        const lines = enc.slice(0, 6).map((e, i) => {
            const pr = promEncuesta(e);
            const f = e.createdAt || e.fecha;
            return `${i + 1}. id=${e.id ?? '—'} | ${trunc(e.nombre, 80)} | promedio≈${pr}/5 | fecha ${fmtDate(f)}`;
        });
        if (enc.length > 6) lines.push(`… (+${enc.length - 6} encuestas más)`);
        push('Encuestas (muestra)', lines.join('\n'));
    }

    const sols = listaSolicitudes || [];
    if (sols.length) {
        const lines = sols.slice(0, 18).map((s, i) => `${i + 1}. #${s.id} ${trunc(s.nombre_cambio, 120)} | ${s.estado || '—'} | impacto ${s.impacto_proyecto || '—'} | solicitante ${trunc(s.nombre_solicitante, 80)} | resolución: ${trunc(s.resolucion, 220)}`);
        if (sols.length > 18) lines.push(`… (+${sols.length - 18} solicitudes más)`);
        push('Solicitudes de cambio', lines.join('\n'));
    }

    const alc = alcanceEntregables || [];
    if (alc.length) {
        const lines = alc.slice(0, 28).map((ent, i) => `${i + 1}. ${trunc(ent.nombre, 140)} | deadline ${fmtDate(ent.deadline)} | completado=${ent.completado ? 'sí' : 'no'}`);
        if (alc.length > 28) lines.push(`… (+${alc.length - 28} filas)`);
        push('Alcance / entregables', lines.join('\n'));
    }

    const hitos = tiempoFechasCriticas || [];
    if (hitos.length) {
        const lines = hitos.slice(0, 28).map((h, i) => `${i + 1}. ${trunc(h.description, 160)} | fecha ${fmtDate(h.date)} | completado=${h.completado ? 'sí' : 'no'}`);
        if (hitos.length > 28) lines.push(`… (+${hitos.length - 28} hitos más)`);
        push('Hitos / fechas críticas', lines.join('\n'));
    }

    const costos = costoEntregable || [];
    if (costos.length) {
        const lines = costos.slice(0, 22).map((c, i) => `${i + 1}. ${trunc(c.entregable, 120)} | costo ${fmtMoney(c.costo)} | real ${fmtMoney(c.costoReal)} | deadline ${fmtDate(c.deadline)} | completado=${c.completado ? 'sí' : 'no'}`);
        if (costos.length > 22) lines.push(`… (+${costos.length - 22} filas)`);
        push('Costos por entregable', lines.join('\n'));
    }

    const cal = calidadMetricas || [];
    if (cal.length) {
        const lines = cal.slice(0, 26).map((c, i) => `${i + 1}. ${trunc(c.entregable, 100)} | métrica ${trunc(c.metrica, 120)} | completado=${c.completado ? 'sí' : 'no'}`);
        if (cal.length > 26) lines.push(`… (+${cal.length - 26} filas)`);
        push('Calidad / métricas', lines.join('\n'));
    }

    const tareas = todo || [];
    if (tareas.length) {
        const lines = tareas.slice(0, 45).map((t, i) => {
            const nom = t.task || t.name || t.descripcion || '—';
            return `${i + 1}. ${trunc(nom, 160)} | vence ${fmtDate(t.dueDate)} | hecha=${t.done ? 'sí' : 'no'}`;
        });
        if (tareas.length > 45) lines.push(`… (+${tareas.length - 45} tareas más)`);
        push('Tareas / ToDo', lines.join('\n'));
    }

    const riesgos = riesgosList || [];
    if (riesgos.length) {
        const lines = riesgos.slice(0, 22).map((r, i) => {
            const nom = r.nombre || r.descripcion || r.riesgo || `Riesgo ${i + 1}`;
            return `${i + 1}. ${trunc(nom, 160)} | prob=${r.probabilidad ?? '—'} imp=${r.impacto ?? '—'} | plan_completado=${r.completado ? 'sí' : 'no'} | mitigación: ${trunc(r.mitigacion || r.plan_mitigacion || '', 200)}`;
        });
        if (riesgos.length > 22) lines.push(`… (+${riesgos.length - 22} riesgos más)`);
        push('Riesgos', lines.join('\n'));
    }

    const lg = logs || [];
    if (lg.length) {
        const tail = lg.slice(-22);
        const lines = tail.map((log, i) => `${i + 1}. ${fmtDate(log.fecha)} | usuario ${trunc(log.usuario, 80)} | ${log.estadoAnterior || '—'} → ${log.estadoNuevo || '—'}`);
        push('Historial cambios de estado (últimos)', lines.join('\n'));
    }

    if (leccionesAprendidas && String(leccionesAprendidas).trim()) {
        push('Lecciones aprendidas (si el proyecto está cerrado en GORU)', trunc(leccionesAprendidas, 3500));
    }

    push('Conclusiones (borrador del informe)', formData?.conclusiones?.trim() || '(vacío)');
    push('Próximos pasos (borrador del informe)', formData?.proximosPasos?.trim() || '(vacío)');
    if (recomendacionesIa && String(recomendacionesIa).trim()) {
        push('Recomendaciones IA ya pegadas en GORU', trunc(recomendacionesIa, 4000));
    }

    const full = chunks.join('\n\n');
    if (full.length <= NOVA_DUMP_MAX_CHARS) return full;

    const cut = full.slice(0, NOVA_DUMP_MAX_CHARS);
    const lost = full.length - NOVA_DUMP_MAX_CHARS;
    return `${cut}\n\n[--- GORU: volcado truncado; ${lost} caracteres omitidos al final. Podés pedir un detalle puntual en el chat. ---]`;
}
