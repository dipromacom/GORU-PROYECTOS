// reducers/programa.js
// Maneja el estado de los proyectos dentro de un programa

export const types = {
    // Obtener proyectos del programa (pestaña de visualización)
    GET_PROYECTOS_PROGRAMA_REQUEST: 'programa/GET_PROYECTOS_PROGRAMA_REQUEST',
    GET_PROYECTOS_PROGRAMA_SUCCESS: 'programa/GET_PROYECTOS_PROGRAMA_SUCCESS',
    GET_PROYECTOS_PROGRAMA_ERROR: 'programa/GET_PROYECTOS_PROGRAMA_ERROR',

    // Obtener proyectos disponibles del usuario para asignar
    GET_PROYECTOS_DISPONIBLES_REQUEST: 'programa/GET_PROYECTOS_DISPONIBLES_REQUEST',
    GET_PROYECTOS_DISPONIBLES_SUCCESS: 'programa/GET_PROYECTOS_DISPONIBLES_SUCCESS',
    GET_PROYECTOS_DISPONIBLES_ERROR: 'programa/GET_PROYECTOS_DISPONIBLES_ERROR',

    // Asignar un proyecto al programa
    ASIGNAR_PROYECTO_REQUEST: 'programa/ASIGNAR_PROYECTO_REQUEST',
    ASIGNAR_PROYECTO_SUCCESS: 'programa/ASIGNAR_PROYECTO_SUCCESS',
    ASIGNAR_PROYECTO_ERROR: 'programa/ASIGNAR_PROYECTO_ERROR',

    // Desasignar un proyecto del programa
    DESASIGNAR_PROYECTO_REQUEST: 'programa/DESASIGNAR_PROYECTO_REQUEST',
    DESASIGNAR_PROYECTO_SUCCESS: 'programa/DESASIGNAR_PROYECTO_SUCCESS',
    DESASIGNAR_PROYECTO_ERROR: 'programa/DESASIGNAR_PROYECTO_ERROR',

    // Limpiar estado al desmontar
    CLEAR_PROGRAMA_STATE: 'programa/CLEAR_PROGRAMA_STATE',

    GET_PROGRAMAS_LISTA_REQUEST: 'programa/GET_PROGRAMAS_LISTA_REQUEST',
    GET_PROGRAMAS_LISTA_SUCCESS: 'programa/GET_PROGRAMAS_LISTA_SUCCESS',
    GET_PROGRAMAS_LISTA_ERROR: 'programa/GET_PROGRAMAS_LISTA_ERROR',

    // Resumen agregado del programa (estadísticas de todos los proyectos hijos)
    GET_RESUMEN_AGREGADO_REQUEST: 'programa/GET_RESUMEN_AGREGADO_REQUEST',
    GET_RESUMEN_AGREGADO_SUCCESS: 'programa/GET_RESUMEN_AGREGADO_SUCCESS',
    GET_RESUMEN_AGREGADO_ERROR: 'programa/GET_RESUMEN_AGREGADO_ERROR',
    CLEAR_RESUMEN_AGREGADO: 'programa/CLEAR_RESUMEN_AGREGADO',
};

export const actions = {
    getProyectosPrograma: (programaId) => ({
        type: types.GET_PROYECTOS_PROGRAMA_REQUEST,
        programaId,
    }),
    getProyectosDisponibles: (programaId) => ({
        type: types.GET_PROYECTOS_DISPONIBLES_REQUEST,
        programaId,
    }),
    asignarProyecto: (programaId, proyectoId) => ({
        type: types.ASIGNAR_PROYECTO_REQUEST,
        programaId,
        proyectoId,
    }),
    desasignarProyecto: (proyectoId, programaId) => ({
        type: types.DESASIGNAR_PROYECTO_REQUEST,
        proyectoId,
        programaId, // para refrescar la lista tras desasignar
    }),
    clearProgramaState: () => ({
        type: types.CLEAR_PROGRAMA_STATE,
    }),
    getProgramasLista: () => ({
        type: types.GET_PROGRAMAS_LISTA_REQUEST,
    }),
    getResumenAgregado: (programaId) => ({
        type: types.GET_RESUMEN_AGREGADO_REQUEST,
        programaId,
    }),
    clearResumenAgregado: () => ({
        type: types.CLEAR_RESUMEN_AGREGADO,
    }),
};

const defaultState = {
    isLoading: false,
    proyectosPrograma: [],    // Los que ya están en el programa
    proyectosDisponibles: [], // Los que el usuario puede añadir
    programasLista: [],
    resumenAgregado: null,    // Resumen agregado de ejecución de todos los proyectos hijos
    error: null,
};

export const selectors = {
    getIsLoading: ({ programa }) => programa.isLoading,
    getProyectosPrograma: ({ programa }) => programa.proyectosPrograma,
    getProyectosDisponibles: ({ programa }) => programa.proyectosDisponibles,
    getError: ({ programa }) => programa.error,
    getProgramasLista: ({ programa }) => programa.programasLista,
    getResumenAgregado: ({ programa }) => programa.resumenAgregado,
};

const programaReducer = (state = defaultState, action = {}) => {
    switch (action.type) {
        // --- GET PROYECTOS DEL PROGRAMA ---
        case types.GET_PROYECTOS_PROGRAMA_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.GET_PROYECTOS_PROGRAMA_SUCCESS:
            return { ...state, isLoading: false, proyectosPrograma: action.proyectosPrograma };
        case types.GET_PROYECTOS_PROGRAMA_ERROR:
            return { ...state, isLoading: false, error: action.error, proyectosPrograma: [] };

        // --- GET PROYECTOS DISPONIBLES ---
        case types.GET_PROYECTOS_DISPONIBLES_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.GET_PROYECTOS_DISPONIBLES_SUCCESS:
            return { ...state, isLoading: false, proyectosDisponibles: action.proyectosDisponibles };
        case types.GET_PROYECTOS_DISPONIBLES_ERROR:
            return { ...state, isLoading: false, error: action.error, proyectosDisponibles: [] };

        // --- ASIGNAR ---
        case types.ASIGNAR_PROYECTO_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.ASIGNAR_PROYECTO_SUCCESS:
            return {
                ...state,
                isLoading: false,
                // Mueve el proyecto de disponibles a los del programa
                proyectosPrograma: [...state.proyectosPrograma, action.proyecto],
                proyectosDisponibles: state.proyectosDisponibles.filter(
                    (p) => p.id !== action.proyecto.id
                ),
            };
        case types.ASIGNAR_PROYECTO_ERROR:
            return { ...state, isLoading: false, error: action.error };

        // --- DESASIGNAR ---
        case types.DESASIGNAR_PROYECTO_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.DESASIGNAR_PROYECTO_SUCCESS:
            return {
                ...state,
                isLoading: false,
                // Saca el proyecto del programa y lo devuelve a disponibles
                proyectosPrograma: state.proyectosPrograma.filter(
                    (p) => p.id !== action.proyecto.id
                ),
                proyectosDisponibles: [...state.proyectosDisponibles, action.proyecto],
            };
        case types.DESASIGNAR_PROYECTO_ERROR:
            return { ...state, isLoading: false, error: action.error };

        // --- CLEAR ---
        case types.CLEAR_PROGRAMA_STATE:
            return defaultState;

        case types.GET_PROGRAMAS_LISTA_REQUEST:
            return { ...state, isLoading: true };
        case types.GET_PROGRAMAS_LISTA_SUCCESS:
            return { ...state, isLoading: false, programasLista: action.programasLista };
        case types.GET_PROGRAMAS_LISTA_ERROR:
            return { ...state, isLoading: false, programasLista: [] };

        // --- RESUMEN AGREGADO ---
        case types.GET_RESUMEN_AGREGADO_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.GET_RESUMEN_AGREGADO_SUCCESS:
            return { ...state, isLoading: false, resumenAgregado: action.resumenAgregado };
        case types.GET_RESUMEN_AGREGADO_ERROR:
            return { ...state, isLoading: false, error: action.error, resumenAgregado: null };
        case types.CLEAR_RESUMEN_AGREGADO:
            return { ...state, resumenAgregado: null };

        default:
            return state;
    }
};

export default programaReducer;