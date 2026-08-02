/* eslint-disable no-unused-vars */
const { Op, literal } = require('sequelize');
const { Proyecto, Usuario } = require('../models/index');
const {
    Persona, DirectorProyecto, Patrocinador, Departamento,
    TipoProyecto, Empresa,
} = require('../models/index');
const { saveLog } = require('./log-service');

// Includes reutilizables (mismo patrón que proyecto-utils)
const DEFAULT_PROYECTO_INCLUDES = [
    {
        model: DirectorProyecto,
        as: 'DirectorProyecto',
        include: { model: Persona, as: 'Persona', foreignKey: 'persona', },
    },
    {
        model: Patrocinador,
        as: 'Patrocinador',
        include: { model: Persona, as: 'Persona' },
    },
    { model: Empresa, as: 'Empresa' },
    { model: Departamento, as: 'Departamento' },
    { model: TipoProyecto, as: 'TipoProyecto' },
];

/**
 * Obtiene todos los proyectos (modo P o A) pertenecientes a un programa.
 * @param {number} programaId
 */
const getProyectosByPrograma = async (programaId) => {
    // Verificar que el programa existe y es de modo PR
    const programa = await Proyecto.findOne({
        where: { id: programaId, modo: 'PR' },
    });

    if (!programa) {
        throw new Error(`El proyecto con ID ${programaId} no existe o no es un programa.`);
    }

    const proyectos = await Proyecto.findAll({
        where: { programa_id: programaId },
        include: DEFAULT_PROYECTO_INCLUDES,
        order: [
            [literal(`CASE 
        WHEN estado = 'X' THEN 1
        WHEN estado = 'P' THEN 2
        WHEN estado = 'S' THEN 3
        WHEN estado = 'C' THEN 4
        WHEN estado = 'E' THEN 5
        ELSE 6 END`), 'ASC'],
        ],
    });

    return proyectos;
};

/**
 * Obtiene todos los proyectos disponibles del usuario para ser añadidos a un programa.
 * Excluye: los que ya pertenecen al programa, los que son programas (PR), 
 * y los que ya pertenecen a otro programa.
 * @param {number} programaId
 * @param {number} usuarioId
 */
const getProyectosDisponiblesParaPrograma = async (programaId, usuarioId) => {
    const proyectos = await Proyecto.findAll({
        where: {
            modo: { [Op.in]: ['P', 'A'] }, // Solo proyectos y actividades, no programas
            programa_id: null,             // Que no estén ya en un programa
            estado: { [Op.ne]: 'E' },
            [Op.or]: [
                { usuario_creador: usuarioId },
                { '$Usuarios.id$': usuarioId },
            ],
        },
        include: [
            {
                model: Usuario,
                as: 'Usuarios',
                required: false,
                through: { attributes: [] },
                attributes: ['id'],
            },
            ...DEFAULT_PROYECTO_INCLUDES,
        ],
        order: [['nombre', 'ASC']],
    });

    return proyectos;
};

/**
 * Asigna un proyecto a un programa.
 * Valida que el programa sea modo PR y el proyecto no sea PR.
 * @param {number} programaId
 * @param {number} proyectoId
 * @param {number} usuarioId
 */
const asignarProyectoAPrograma = async (programaId, proyectoId, usuarioId) => {
    // Validar programa
    const programa = await Proyecto.findOne({
        where: { id: programaId, modo: 'PR' },
    });
    if (!programa) {
        throw new Error(`El ID ${programaId} no corresponde a un programa válido.`);
    }

    // Validar proyecto
    const proyecto = await Proyecto.findOne({
        where: { id: proyectoId },
    });
    if (!proyecto) {
        throw new Error(`El proyecto con ID ${proyectoId} no existe.`);
    }
    if (proyecto.modo === 'PR') {
        throw new Error(`Un programa no puede ser parte de otro programa.`);
    }
    if (proyecto.programa_id && proyecto.programa_id !== programaId) {
        throw new Error(`El proyecto ya pertenece a otro programa (ID: ${proyecto.programa_id}).`);
    }

    await proyecto.update({ programa_id: programaId });

    await saveLog({
        userId: usuarioId,
        actionType: 'PROJECT_ASSIGNED_TO_PROGRAM',
        resourceType: 'Proyecto',
        resourceId: proyectoId,
        details: {
            programa_id: programaId,
            programa_nombre: programa.nombre,
            proyecto_nombre: proyecto.nombre,
        },
    });

    return proyecto;
};

/**
 * Desasigna un proyecto de su programa actual.
 * @param {number} proyectoId
 * @param {number} usuarioId
 */
const desasignarProyectoDePrograma = async (proyectoId, usuarioId) => {
    const proyecto = await Proyecto.findByPk(proyectoId);

    if (!proyecto) {
        throw new Error(`El proyecto con ID ${proyectoId} no existe.`);
    }
    if (!proyecto.programa_id) {
        throw new Error(`El proyecto con ID ${proyectoId} no pertenece a ningún programa.`);
    }

    const programaIdAnterior = proyecto.programa_id;
    await proyecto.update({ programa_id: null });

    await saveLog({
        userId: usuarioId,
        actionType: 'PROJECT_REMOVED_FROM_PROGRAM',
        resourceType: 'Proyecto',
        resourceId: proyectoId,
        details: {
            programa_id_anterior: programaIdAnterior,
            proyecto_nombre: proyecto.nombre,
        },
    });

    return proyecto;
};

const getProgramasByUsuario = async (usuarioId) => {
    const programas = await Proyecto.findAll({
        where: {
            modo: 'PR',
            estado: { [Op.ne]: 'E' },
            [Op.or]: [
                { usuario_creador: usuarioId },
                { '$Usuarios.id$': usuarioId },
            ],
        },
        include: [
            {
                model: Usuario,
                as: 'Usuarios',
                required: false,
                through: { attributes: [] },
                attributes: ['id'],
            },
            { model: Empresa, as: 'Empresa' },
        ],
        attributes: ['id', 'nombre', 'estado', 'empresa'],
        order: [['nombre', 'ASC']],
    });

    return programas;
};

/**
 * Obtiene resumen agregado de ejecución de todos los proyectos hijos de un programa.
 * Incluye: alcance, hitos, costos, calidad, riesgos, gantt, beneficios, lecciones aprendidas.
 * @param {number} programaId
 */
const getResumenAgregadoPrograma = async (programaId) => {
    // Verificar que el programa existe y es modo PR
    const programa = await Proyecto.findOne({
        where: { id: programaId, modo: 'PR' },
    });

    if (!programa) {
        throw new Error(`El proyecto con ID ${programaId} no existe o no es un programa.`);
    }

    // Obtener todos los proyectos hijos con los campos necesarios para el resumen
    const proyectosHijos = await Proyecto.findAll({
        where: { programa_id: programaId },
        attributes: [
            'id', 'nombre', 'estado', 'modo', 'tipo_proyecto',
            'alcance_entregables', 'tiempo_fechas_criticas', 'costo_entregable',
            'costo_reserva_contingencia', 'costo_reserva_gestion',
            'costo_reserva_contingencia_real', 'costo_reserva_gestion_real',
            'calidad_metricas', 'riesgos', 'beneficios', 'lecciones_aprendidas',
            'tiempo_duracion', 'fecha_inicio', 'fecha_cierre',
        ],
        include: [
            {
                model: DirectorProyecto,
                as: 'DirectorProyecto',
                include: { model: Persona, as: 'Persona' },
            },
        ],
        order: [
            [literal(`CASE 
                WHEN estado = 'X' THEN 1
                WHEN estado = 'P' THEN 2
                WHEN estado = 'S' THEN 3
                WHEN estado = 'C' THEN 4
                WHEN estado = 'E' THEN 5
                ELSE 6 END`), 'ASC'],
        ],
    });

    // Helper para parsear JSONB de forma segura
    const parseJSON = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
            return JSON.parse(val);
        } catch {
            return [];
        }
    };

    // Agregar datos de cada proyecto
    const resumen = {
        programa: {
            id: programa.id,
            nombre: programa.nombre,
            estado: programa.estado,
            beneficios: parseJSON(programa.beneficios),
            lecciones_aprendidas: parseJSON(programa.lecciones_aprendidas),
        },
        proyectos: [],
        totales: {
            proyectosTotal: 0,
            porEstado: { C: 0, P: 0, S: 0, X: 0, E: 0 },
            alcance: { totalEntregables: 0, completados: 0, porcentaje: 0 },
            hitos: { total: 0, cumplidos: 0, vencidos: 0, pendientes: 0, porcentaje: 0 },
            costos: {
                presupuestoTotal: 0,
                ejecutadoTotal: 0,
                desviacionTotal: 0,
                reservContingencia: 0,
                reservGestion: 0,
                reservContingenciaReal: 0,
                reservGestionReal: 0,
            },
            calidad: { totalMetricas: 0, cumplidas: 0, porcentaje: 0 },
            riesgos: { total: 0, altos: 0, medios: 0, bajos: 0, cerrados: 0 },
            gantt: { tareasTotal: 0, completadas: 0, enProgreso: 0, retrasadas: 0, avancePromedio: 0 },
            beneficios: { total: 0, alcanzados: 0, enProgreso: 0, noAlcanzados: 0 },
            leccionesAprendidas: { total: 0 },
        },
    };

    for (const p of proyectosHijos) {
        const alcance = parseJSON(p.alcance_entregables);
        const hitos = parseJSON(p.tiempo_fechas_criticas);
        const costos = parseJSON(p.costo_entregable);
        const calidad = parseJSON(p.calidad_metricas);
        const riesgos = parseJSON(p.riesgos);
        const beneficios = parseJSON(p.beneficios);
        const lecciones = parseJSON(p.lecciones_aprendidas);

        // Contar entregables y completados (asumimos que tienen campo completado o progreso)
        const totalEntregables = alcance.length;
        const completados = alcance.filter(e => e.completado === true || e.progreso === 100).length;

        // Hitos
        const totalHitos = hitos.length;
        const hitosCumplidos = hitos.filter(h => h.completado === true).length;
        const hoy = new Date();
        const hitosVencidos = hitos.filter(h => !h.completado && h.date && new Date(h.date) < hoy).length;
        const hitosPendientes = totalHitos - hitosCumplidos - hitosVencidos;

        // Costos
        const presupuestoProyecto =
            (parseFloat(p.costo_reserva_contingencia) || 0) +
            (parseFloat(p.costo_reserva_gestion) || 0) +
            costos.reduce((sum, c) => sum + (parseFloat(c.costo) || 0), 0);

        const ejecutadoProyecto = costos.reduce((sum, c) => sum + (parseFloat(c.costo_real) || parseFloat(c.costo) || 0), 0);
        const desviacion = ejecutadoProyecto - presupuestoProyecto;

        // Calidad
        const totalMetricas = calidad.length;
        const cumplidas = calidad.filter(m => m.cumplida === true || m.porcentaje_cumplimiento === 100).length;

        // Riesgos (asumimos campo nivel: 'alto'|'medio'|'bajo' y estado: 'abierto'|'cerrado')
        const totalRiesgos = riesgos.length;
        const altos = riesgos.filter(r => r.nivel === 'alto' || r.nivel === 'H').length;
        const medios = riesgos.filter(r => r.nivel === 'medio' || r.nivel === 'M').length;
        const bajos = riesgos.filter(r => r.nivel === 'bajo' || r.nivel === 'L').length;
        const cerrados = riesgos.filter(r => r.estado === 'cerrado' || r.estado === 'C').length;

        // Beneficios
        const totalBeneficios = beneficios.length;
        const alcanzados = beneficios.filter(b => b.alcanzado === true || b.estado === 'alcanzado').length;
        const enProgresoBen = beneficios.filter(b => b.estado === 'en_progreso' || b.estado === 'en progreso').length;
        const noAlcanzados = beneficios.filter(b => b.estado === 'no_alcanzado' || b.estado === 'no alcanzado').length;

        // Acumular totales
        resumen.totales.proyectosTotal++;
        resumen.totales.porEstado[p.estado] = (resumen.totales.porEstado[p.estado] || 0) + 1;

        resumen.totales.alcance.totalEntregables += totalEntregables;
        resumen.totales.alcance.completados += completados;

        resumen.totales.hitos.total += totalHitos;
        resumen.totales.hitos.cumplidos += hitosCumplidos;
        resumen.totales.hitos.vencidos += hitosVencidos;
        resumen.totales.hitos.pendientes += hitosPendientes;

        resumen.totales.costos.presupuestoTotal += presupuestoProyecto;
        resumen.totales.costos.ejecutadoTotal += ejecutadoProyecto;
        resumen.totales.costos.desviacionTotal += desviacion;
        resumen.totales.costos.reservContingencia += parseFloat(p.costo_reserva_contingencia) || 0;
        resumen.totales.costos.reservGestion += parseFloat(p.costo_reserva_gestion) || 0;
        resumen.totales.costos.reservContingenciaReal += parseFloat(p.costo_reserva_contingencia_real) || 0;
        resumen.totales.costos.reservGestionReal += parseFloat(p.costo_reserva_gestion_real) || 0;

        resumen.totales.calidad.totalMetricas += totalMetricas;
        resumen.totales.calidad.cumplidas += cumplidas;

        resumen.totales.riesgos.total += totalRiesgos;
        resumen.totales.riesgos.altos += altos;
        resumen.totales.riesgos.medios += medios;
        resumen.totales.riesgos.bajos += bajos;
        resumen.totales.riesgos.cerrados += cerrados;

        resumen.totales.beneficios.total += totalBeneficios;
        resumen.totales.beneficios.alcanzados += alcanzados;
        resumen.totales.beneficios.enProgreso += enProgresoBen;
        resumen.totales.beneficios.noAlcanzados += noAlcanzados;

        resumen.totales.leccionesAprendidas.total += lecciones.length;

        // Agregar detalle por proyecto
        resumen.proyectos.push({
            id: p.id,
            nombre: p.nombre,
            estado: p.estado,
            modo: p.modo,
            tipo_proyecto: p.tipo_proyecto,
            director: (p.DirectorProyecto && p.DirectorProyecto.Persona && p.DirectorProyecto.Persona.nombre)
                ? `${p.DirectorProyecto.Persona.nombre} ${p.DirectorProyecto.Persona.apellido || ''}`.trim()
                : 'Sin director',
            alcance: { total: totalEntregables, completados, porcentaje: totalEntregables > 0 ? Math.round((completados / totalEntregables) * 100) : 0 },
            hitos: { total: totalHitos, cumplidos: hitosCumplidos, vencidos: hitosVencidos, pendientes: hitosPendientes, porcentaje: totalHitos > 0 ? Math.round((hitosCumplidos / totalHitos) * 100) : 0 },
            costos: {
                presupuesto: presupuestoProyecto,
                ejecutado: ejecutadoProyecto,
                desviacion,
                contingencia: parseFloat(p.costo_reserva_contingencia) || 0,
                gestion: parseFloat(p.costo_reserva_gestion) || 0,
                contingenciaReal: parseFloat(p.costo_reserva_contingencia_real) || 0,
                gestionReal: parseFloat(p.costo_reserva_gestion_real) || 0,
            },
            calidad: { total: totalMetricas, cumplidas, porcentaje: totalMetricas > 0 ? Math.round((cumplidas / totalMetricas) * 100) : 0 },
            riesgos: { total: totalRiesgos, altos, medios, bajos, cerrados },
            beneficios: { total: totalBeneficios, alcanzados, enProgreso: enProgresoBen, noAlcanzados },
            leccionesAprendidas: { total: lecciones.length },
        });
    }

    // Calcular porcentajes globales
    if (resumen.totales.alcance.totalEntregables > 0) {
        resumen.totales.alcance.porcentaje = Math.round((resumen.totales.alcance.completados / resumen.totales.alcance.totalEntregables) * 100);
    }
    if (resumen.totales.hitos.total > 0) {
        resumen.totales.hitos.porcentaje = Math.round((resumen.totales.hitos.cumplidos / resumen.totales.hitos.total) * 100);
    }
    if (resumen.totales.calidad.totalMetricas > 0) {
        resumen.totales.calidad.porcentaje = Math.round((resumen.totales.calidad.cumplidas / resumen.totales.calidad.totalMetricas) * 100);
    }
    if (resumen.totales.costos.presupuestoTotal > 0) {
        resumen.totales.costos.desviacionPorcentaje = Math.round((resumen.totales.costos.desviacionTotal / resumen.totales.costos.presupuestoTotal) * 100);
    }

    return resumen;
};

module.exports = {
    getProyectosByPrograma,
    getProyectosDisponiblesParaPrograma,
    asignarProyectoAPrograma,
    desasignarProyectoDePrograma,
    getProgramasByUsuario,
    getResumenAgregadoPrograma,
};