// reducers/rolProyecto.js

export const types = {
    // Roles CRUD
    CREATE_ROL_REQUEST: "rolProyecto/CREATE_ROL_REQUEST",
    CREATE_ROL_SUCCESS: "rolProyecto/CREATE_ROL_SUCCESS",
    CREATE_ROL_ERROR: "rolProyecto/CREATE_ROL_ERROR",

    GET_ROLES_REQUEST: "rolProyecto/GET_ROLES_REQUEST",
    GET_ROLES_SUCCESS: "rolProyecto/GET_ROLES_SUCCESS",
    GET_ROLES_ERROR: "rolProyecto/GET_ROLES_ERROR",

    UPDATE_ROL_REQUEST: "rolProyecto/UPDATE_ROL_REQUEST",
    UPDATE_ROL_SUCCESS: "rolProyecto/UPDATE_ROL_SUCCESS",
    UPDATE_ROL_ERROR: "rolProyecto/UPDATE_ROL_ERROR",

    DELETE_ROL_REQUEST: "rolProyecto/DELETE_ROL_REQUEST",
    DELETE_ROL_SUCCESS: "rolProyecto/DELETE_ROL_SUCCESS",
    DELETE_ROL_ERROR: "rolProyecto/DELETE_ROL_ERROR",

    // Permisos CRUD
    GET_PERMISOS_REQUEST: "rolProyecto/GET_PERMISOS_REQUEST",
    GET_PERMISOS_SUCCESS: "rolProyecto/GET_PERMISOS_SUCCESS",
    GET_PERMISOS_ERROR: "rolProyecto/GET_PERMISOS_ERROR",

    // Asignación
    ASSIGN_ROL_REQUEST: "rolProyecto/ASSIGN_ROL_REQUEST",
    ASSIGN_ROL_SUCCESS: "rolProyecto/ASSIGN_ROL_SUCCESS",
    ASSIGN_ROL_ERROR: "rolProyecto/ASSIGN_ROL_ERROR",

    // Usuarios del Proyecto
    GET_USUARIOS_PROYECTO_REQUEST: "rolProyecto/GET_USUARIOS_PROYECTO_REQUEST",
    GET_USUARIOS_PROYECTO_SUCCESS: "rolProyecto/GET_USUARIOS_PROYECTO_SUCCESS",
    GET_USUARIOS_PROYECTO_ERROR: "rolProyecto/GET_USUARIOS_PROYECTO_ERROR",

    DELETE_USUARIO_PROYECTO_REQUEST: "rolProyecto/DELETE_USUARIO_PROYECTO_REQUEST",
    DELETE_USUARIO_PROYECTO_SUCCESS: "rolProyecto/DELETE_USUARIO_PROYECTO_SUCCESS",
    DELETE_USUARIO_PROYECTO_ERROR: "rolProyecto/DELETE_USUARIO_PROYECTO_ERROR",

    // Rol y Permisos del Usuario Actual
    GET_USER_PROJECT_ROL_REQUEST: "rolProyecto/GET_USER_PROJECT_ROL_REQUEST",
    GET_USER_PROJECT_ROL_SUCCESS: "rolProyecto/GET_USER_PROJECT_ROL_SUCCESS",
    GET_USER_PROJECT_ROL_ERROR: "rolProyecto/GET_USER_PROJECT_ROL_ERROR",

};

export const actions = {
    // Roles
    createRolProyecto: (payload) => ({ type: types.CREATE_ROL_REQUEST, payload }),
    getAllRolesProyecto: () => ({ type: types.GET_ROLES_REQUEST }),
    updateRolProyecto: (rolId, payload) => ({ type: types.UPDATE_ROL_REQUEST, rolId, payload }),
    deleteRolProyecto: (rolId) => ({ type: types.DELETE_ROL_REQUEST, rolId }),

    // Permisos
    getAllPermisosProyecto: () => ({ type: types.GET_PERMISOS_REQUEST }),
    // (Otras acciones de Permisos: crear, modificar, eliminar si es necesario)

    // Asignación
    assignRolProyecto: (payload) => ({ type: types.ASSIGN_ROL_REQUEST, payload }),

    // Usuarios del Proyecto
    getUsuariosProyectoRequest: (proyectoId) => ({ type: types.GET_USUARIOS_PROYECTO_REQUEST, proyectoId }),
    deleteUsuarioProyectoRequest: (usuarioId, proyectoId) => ({ type: types.DELETE_USUARIO_PROYECTO_REQUEST, usuarioId, proyectoId }),

    // Rol y Permisos del Usuario Actual
    getUserProjectRolRequest: (usuarioId, proyectoId) => ({ type: types.GET_USER_PROJECT_ROL_REQUEST, usuarioId, proyectoId }),
};

const defaultState = {
    roles: [],
    permisos: [],
    isLoadingRoles: false,
    isLoadingPermisos: false,
    usuariosAsignados: [], 
    isLoadingUsuariosAsignados: false, 
    userProjectRol: null, 
    userProjectPermisos: [],
    isLoadingUserRol: false, 
    isSavingRol: false,
    errorMessage: null,
};

const rolProyectoReducer = (state = defaultState, action = {}) => {
    switch (action.type) {
        case types.GET_ROLES_REQUEST:
        case types.GET_PERMISOS_REQUEST:
            return { ...state, isLoadingRoles: action.type === types.GET_ROLES_REQUEST, isLoadingPermisos: action.type === types.GET_PERMISOS_REQUEST, errorMessage: null };

        case types.CREATE_ROL_REQUEST:
        case types.UPDATE_ROL_REQUEST:
        case types.DELETE_ROL_REQUEST:
        case types.ASSIGN_ROL_REQUEST:
            return { ...state, isSavingRol: true, errorMessage: null };

        case types.GET_ROLES_SUCCESS:
            return { ...state, isLoadingRoles: false, roles: action.data };

        case types.GET_PERMISOS_SUCCESS:
            return { ...state, isLoadingPermisos: false, permisos: action.data };

        case types.CREATE_ROL_SUCCESS:
            return { ...state, isSavingRol: false, roles: [...state.roles, action.data] };

        case types.UPDATE_ROL_SUCCESS:
            return {
                ...state,
                isSavingRol: false,
                roles: state.roles.map(rol => (rol.id === action.data.id ? action.data : rol)),
            };

        case types.DELETE_ROL_SUCCESS:
            return { ...state, isSavingRol: false, roles: state.roles.filter(rol => rol.id !== action.rolId) };

        case types.ASSIGN_ROL_SUCCESS:
            return { ...state, isSavingRol: false };
        
        case types.GET_USUARIOS_PROYECTO_REQUEST:
            return { ...state, isLoadingUsuariosAsignados: true, errorMessage: null };
        case types.GET_USER_PROJECT_ROL_REQUEST:
            return { ...state, isLoadingUserRol: true, errorMessage: null };

        case types.DELETE_USUARIO_PROYECTO_REQUEST:
            return { ...state, isSavingRol: true, errorMessage: null };

        case types.GET_USUARIOS_PROYECTO_SUCCESS:
            return { ...state, isLoadingUsuariosAsignados: false, usuariosAsignados: action.data };

        case types.GET_USER_PROJECT_ROL_SUCCESS:
            const permisosClaves = action.data.PermisosProyecto
                ? action.data.PermisosProyecto.map(p => p.clave || p.nombre) // Usar 'clave' si existe, sino 'nombre'
                : (action.data.rol_proyecto_id === null ? ['ADMIN'] : []); // Si es Admin (null), darle un permiso especial o todos.

            return {
                ...state,
                isLoadingUserRol: false,
                userProjectRol: action.data,
                userProjectPermisos: permisosClaves,
            };

        case types.ASSIGN_ROL_SUCCESS:
            return { ...state, isSavingRol: false, /* No actualizamos la lista aquí directamente, se hace en el front */ };

        case types.DELETE_USUARIO_PROYECTO_SUCCESS:
            // Filtramos el usuario eliminado
            return {
                ...state,
                isSavingRol: false,
                usuariosAsignados: state.usuariosAsignados.filter(u => u.usuario_id !== action.usuarioId)
            };

        case types.GET_ROLES_ERROR:
        case types.GET_PERMISOS_ERROR:
        case types.GET_USUARIOS_PROYECTO_ERROR:
        case types.CREATE_ROL_ERROR:
        case types.UPDATE_ROL_ERROR:
        case types.DELETE_ROL_ERROR:
        case types.ASSIGN_ROL_ERROR:
            return { ...state, isLoadingRoles: false, isLoadingPermisos: false, isSavingRol: false, errorMessage: action.errorMessage || "Ocurrió un error." };

        
        default:
            return state;
    }
};

export default rolProyectoReducer;

export const selectors = {
    getRoles: ({ rolProyecto }) => rolProyecto.roles,
    getPermisos: ({ rolProyecto }) => rolProyecto.permisos,
    getIsLoadingRoles: ({ rolProyecto }) => rolProyecto.isLoadingRoles,
    getIsLoadingPermisos: ({ rolProyecto }) => rolProyecto.isLoadingPermisos,
    getIsSavingRol: ({ rolProyecto }) => rolProyecto.isSavingRol,
    getUsuariosAsignados: ({ rolProyecto }) => rolProyecto.usuariosAsignados,
    getIsLoadingUsuariosAsignados: ({ rolProyecto }) => rolProyecto.isLoadingUsuariosAsignados,

    getUserProjectRol: ({ rolProyecto }) => rolProyecto.userProjectRol,
    getUserProjectPermisos: ({ rolProyecto }) => rolProyecto.userProjectPermisos,
    getIsLoadingUserRol: ({ rolProyecto }) => rolProyecto.isLoadingUserRol,
};