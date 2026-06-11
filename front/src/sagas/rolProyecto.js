// sagas/rolProyecto.js

import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { types } from "../reducers/rolProyecto";
import { onError } from "../libs/errorLib";
import {
    createRolProyecto, getAllRolesProyecto, updateRolProyecto, deleteRolProyecto,
    getAllPermisosProyecto, assignRolProyecto, getUsuariosProyecto, deleteUsuarioProyecto, getUserProjectRol,
} from "../api";

const sagas = [
    // Roles
    takeLatest(types.GET_ROLES_REQUEST, handleGetAllRolesProyecto),
    takeLatest(types.CREATE_ROL_REQUEST, handleCreateRolProyecto),
    takeLatest(types.UPDATE_ROL_REQUEST, handleUpdateRolProyecto),
    takeLatest(types.DELETE_ROL_REQUEST, handleDeleteRolProyecto),

    // Permisos
    takeLatest(types.GET_PERMISOS_REQUEST, handleGetAllPermisosProyecto),

    // Asignación
    takeLatest(types.ASSIGN_ROL_REQUEST, handleAssignRolProyecto),

    // usuarios y roles
    takeLatest(types.GET_USUARIOS_PROYECTO_REQUEST, handleGetUsuariosProyecto),
    takeLatest(types.DELETE_USUARIO_PROYECTO_REQUEST, handleDeleteUsuarioProyecto),
    takeLatest(types.GET_USER_PROJECT_ROL_REQUEST, handleGetUserProjectRol),
];

export default sagas;

// --- Handlers de Roles ---

function* handleGetAllRolesProyecto() {
    try {
        const response = yield call(getAllRolesProyecto);
        yield put({ type: types.GET_ROLES_SUCCESS, data: response.data.data });
    } catch (e) {
        onError(e);
        yield put({ type: types.GET_ROLES_ERROR, errorMessage: "Error al cargar roles de proyecto." });
    }
}

function* handleCreateRolProyecto({ payload }) {
    try {
        const response = yield call(createRolProyecto, payload);
        yield put({ type: types.CREATE_ROL_SUCCESS, data: response.data.data });
    } catch (e) {
        onError(e);
        yield put({ type: types.CREATE_ROL_ERROR, errorMessage: "Error al crear el rol." });
    }
}

function* handleUpdateRolProyecto({ rolId, payload }) {
    try {
        const response = yield call(updateRolProyecto, rolId, payload);
        yield put({ type: types.UPDATE_ROL_SUCCESS, data: response.data.data });
    } catch (e) {
        onError(e);
        yield put({ type: types.UPDATE_ROL_ERROR, errorMessage: "Error al actualizar el rol." });
    }
}

function* handleDeleteRolProyecto({ rolId }) {
    try {
        yield call(deleteRolProyecto, rolId);
        yield put({ type: types.DELETE_ROL_SUCCESS, rolId });
    } catch (e) {
        onError(e);
        yield put({ type: types.DELETE_ROL_ERROR, errorMessage: "Error al eliminar el rol." });
    }
}

// --- Handlers de Permisos ---

function* handleGetAllPermisosProyecto() {
    try {
        const response = yield call(getAllPermisosProyecto);
        yield put({ type: types.GET_PERMISOS_SUCCESS, data: response.data.data });
    } catch (e) {
        onError(e);
        yield put({ type: types.GET_PERMISOS_ERROR, errorMessage: "Error al cargar permisos de proyecto." });
    }
}

// --- Handlers de Asignación ---

function* handleAssignRolProyecto({ payload }) {
    try {
        const response = yield call(assignRolProyecto, payload);
        yield put({ type: types.ASSIGN_ROL_SUCCESS, data: response.data.data });

        // Debes recargar la lista de usuarios del proyecto para que la tabla se actualice
        if (payload.proyectoId) { // Asumiendo que `proyectoId` está en el payload
            // Llama a la acción para recargar la lista
            yield put({ type: types.GET_USUARIOS_PROYECTO_REQUEST, proyectoId: payload.proyectoId });
        }

    } catch (e) {
        onError(e);
        const msg = e.response && e.response.data && e.response.data.message;
        const st = e.response && e.response.status;
        if (st === 403 && msg) {
            toast.warn(msg);
        } else if (msg) {
            toast.error(msg);
        }
        yield put({ type: types.ASSIGN_ROL_ERROR, errorMessage: msg || "Error al asignar el rol al usuario." });
    }
}
// --- Handlers usuarios proyecto ---

function normalizeUsuarioProyectoItem(item) {
    const src = item?.dataValues ? item : item;
    const plain = typeof src.toJSON === 'function' ? src.toJSON() : { ...src };
    const usuario = plain.Usuario || plain.usuario || {};
    const persona = usuario.Persona || usuario.persona || null;
    const username = usuario.username || '';
    const nombre = persona?.nombre
        ? `${persona.nombre} ${persona.apellido || ''}`.trim()
        : (username || (plain.usuario_id ? `Usuario ${plain.usuario_id}` : '—'));

    return {
        ...plain,
        usuario_id: plain.usuario_id,
        rol_proyecto_id: plain.rol_proyecto_id,
        Usuario: usuario,
        RolProyecto: plain.RolProyecto || plain.rolProyecto || null,
        nombre,
        email: username,
    };
}

function* handleGetUsuariosProyecto({ proyectoId }) {
    try {
        const response = yield call(getUsuariosProyecto, proyectoId);
        const raw = response.data?.data || [];
        const data = raw.map(normalizeUsuarioProyectoItem);
        yield put({ type: types.GET_USUARIOS_PROYECTO_SUCCESS, data });
    } catch (e) {
        onError(e);
        yield put({ type: types.GET_USUARIOS_PROYECTO_ERROR, errorMessage: "Error al cargar usuarios asignados." });
    }
}

function* handleDeleteUsuarioProyecto({ usuarioId, proyectoId }) {
    try {
        yield call(deleteUsuarioProyecto, usuarioId, proyectoId);
        yield put({ type: types.DELETE_USUARIO_PROYECTO_SUCCESS, usuarioId });
        yield put({ type: types.GET_USUARIOS_PROYECTO_REQUEST, proyectoId });
    } catch (e) {
        onError(e);
        yield put({ type: types.DELETE_USUARIO_PROYECTO_ERROR, errorMessage: "Error al eliminar usuario del proyecto." });
    }
}

function* handleGetUserProjectRol({ usuarioId, proyectoId }) {
    try {
        const response = yield call(getUserProjectRol, usuarioId, proyectoId);
        yield put({ type: types.GET_USER_PROJECT_ROL_SUCCESS, data: response.data.data });
    } catch (e) {
        onError(e);
        yield put({ type: types.GET_USER_PROJECT_ROL_ERROR, errorMessage: "Error al cargar el rol del usuario." });
    }
}