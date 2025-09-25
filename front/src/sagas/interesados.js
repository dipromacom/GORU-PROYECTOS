import { call, put, takeLatest } from "redux-saga/effects";
import { types, actions } from "./interestedReducer";
import * as Api from "../api";

// Saga para crear un interesado
function* createInterestedSaga(action) {
    try {
        const response = yield call(Api.createInteresadosBatch, action.payload); // Llamada a la API para crear interesado
        yield put({
            type: types.CREATE_INTERESTED_SUCCESS,
            interestedDetail: response.data,
        });
    } catch (error) {
        yield put({
            type: types.CREATE_INTERESTED_ERROR,
            error: error.message || "Error al crear interesado",
        });
    }
}

// Saga para obtener la lista de interesados
function* getInterestedListSaga(action) {
    try {
        const response = yield call(Api.getInteresadosByProjectId, action.filter); // Llamada a la API para obtener lista
        yield put({
            type: types.GET_INTERESTED_LIST_SUCCESS,
            interestedList: response.data,
        });
    } catch (error) {
        yield put({
            type: types.GET_INTERESTED_LIST_ERROR,
            error: error.message || "Error al obtener lista de interesados",
        });
    }
}

// Saga para obtener los detalles de un interesado
// function* getInterestedDetailSaga(action) {
//     try {
//         const response = yield call(Api.get, action.interestedId); // Llamada a la API para obtener detalle
//         yield put({
//             type: types.GET_INTERESTED_DETAIL_SUCCESS,
//             interestedDetail: response.data,
//         });
//     } catch (error) {
//         yield put({
//             type: types.GET_INTERESTED_DETAIL_ERROR,
//             error: error.message || "Error al obtener detalle del interesado",
//         });
//     }
// }

// Observadores de las acciones para las sagas
export default function* interestedSagas() {
    yield takeLatest(types.CREATE_INTERESTED_REQUEST, createInterestedSaga);
    yield takeLatest(types.GET_INTERESTED_LIST_REQUEST, getInterestedListSaga);
    // yield takeLatest(types.GET_INTERESTED_DETAIL_REQUEST, getInterestedDetailSaga);
}
