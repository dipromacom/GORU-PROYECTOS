/**
 * Claves = permiso_proyecto.nombre (misma lista que api/utils/permiso-proyecto-utils.js → P).
 */
export const P = {
    PROYECTO_CONFIG_VER: 'proyecto_configuracion_ver',
    PROYECTO_CONFIG_GEST: 'proyecto_configuracion_gestionar',
    PROYECTO_MIEMBROS_VER: 'proyecto_miembros_ver',
    PROYECTO_MIEMBROS_GEST: 'proyecto_miembros_gestionar',
    CONSTITUCION_VER: 'constitucion_ver',
    CONSTITUCION_GEST: 'constitucion_gestionar',
    INTERESADOS_VER: 'interesados_ver',
    INTERESADOS_GEST: 'interesados_gestionar',
    ANALISIS_AMBIENTAL_VER: 'analisis_ambiental_ver',
    ANALISIS_AMBIENTAL_GEST: 'analisis_ambiental_gestionar',
    ALCANCE_VER: 'alcance_ver',
    ALCANCE_GEST: 'alcance_gestionar',
    HITOS_VER: 'hitos_ver',
    HITOS_GEST: 'hitos_gestionar',
    COSTOS_VER: 'costos_ver',
    COSTOS_GEST: 'costos_gestionar',
    CALIDAD_VER: 'calidad_ver',
    CALIDAD_GEST: 'calidad_gestionar',
    RIESGOS_VER: 'riesgos_ver',
    RIESGOS_GEST: 'riesgos_gestionar',
    GANTT_VER: 'gantt_ver',
    GANTT_GEST: 'gantt_gestionar',
    TODO_VER: 'todo_ver',
    TODO_GEST: 'todo_gestionar',
    KANBAN_VER: 'kanban_ver',
    KANBAN_GEST: 'kanban_gestionar',
    PIZARRA_VER: 'pizarra_ver',
    PIZARRA_GEST: 'pizarra_gestionar',
    BENEFICIOS_VER: 'beneficios_ver',
    BENEFICIOS_GEST: 'beneficios_gestionar',
    PROGRAMA_PROYECTOS_VER: 'programa_proyectos_ver',
    PROGRAMA_VINCULAR: 'programa_vincular',
    LECCIONES_VER: 'lecciones_aprendidas_ver',
    LECCIONES_GEST: 'lecciones_aprendidas_gestionar',
    ENCUESTAS_VER: 'encuestas_ver',
    ENCUESTAS_GEST: 'encuestas_gestionar',
    INFORMES_VER: 'informes_ver',
    INFORMES_GEST: 'informes_gestionar',
    CONTROL_CAMBIO_VER: 'control_cambio_ver',
    CONTROL_CAMBIO_GEST: 'control_cambio_gestionar',
    HISTORIAL_VER: 'historial_ver',
    SCRUM_VER: 'scrum_ver',
    SCRUM_GEST: 'scrum_gestionar',
};

/**
 * @param {string[]|undefined|null} permisos - userProjectPermisos del reducer (nombres en BD)
 * @param {string} claveRequerida - ej. P.KANBAN_VER
 */
export function proyectoPuede(permisos, claveRequerida) {
    if (!claveRequerida) return true;
    if (!permisos || permisos.length === 0) return false;
    if (permisos.includes('ADMIN')) return true;
    const set = new Set(permisos);
    if (set.has(claveRequerida)) return true;
    if (claveRequerida.endsWith('_ver')) {
        const gestionar = claveRequerida.replace(/_ver$/, '_gestionar');
        if (set.has(gestionar)) return true;
    }
    return false;
}
