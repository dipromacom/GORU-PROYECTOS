import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/persona";
import { onError } from "../libs/errorLib";
import { getUsuarioById, updateProfile } from "../api";

const sagas = [
    takeLatest(types.GET_PROFILE_REQUEST, getProfile),
    takeLatest(types.UPDATE_PROFILE_REQUEST, updateProfileUser),
];

function* getProfile({ usuarioId }) {
    try {
        const response = yield call(getUsuarioById, usuarioId );
        const direccion = response.data.data.Persona.TipoDireccion;
        const telefono = response.data.data.Persona.TipoTelefono;
        const empresa = response.data?.data?.Empresa?.nombre;
        const persona = { ...response.data.data.Persona, empresa};
        delete persona.TipoDireccion;
        delete persona.TipoTelefono;
        
        
        yield put({ type: types.GET_PROFILE_SUCCESS, persona, direccion, telefono });
    } catch (e) {
        onError(e);
        yield put({ type: types.GET_PROFILE_ERROR });
    }
}

function* updateProfileUser({ usuario, details }) {
    try {
        const response = yield call(updateProfile, usuario, details);
        const direccion = response.data.data.TipoDireccion;
        const telefono = response.data.data.TipoTelefono;
        const persona = response.data.data;
        delete persona.TipoDireccion;
        delete persona.TipoTelefono;
        yield put({ type: types.UPDATE_PROFILE_SUCCESS, persona, direccion, telefono });
    } catch (e) {
        onError(e);
        yield put({ type: types.UPDATE_PROFILE_ERROR });
    }
}

export default sagas;