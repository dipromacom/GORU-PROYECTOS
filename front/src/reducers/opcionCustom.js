import { type } from "os";

export const types = {
  GET_OPCION_REQUEST: "criterioCustom/GET_OPCION_REQUEST",
  GET_OPCION_SUCCESS: "criterioCustom/GET_OPCION_SUCCESS",
  GET_OPCION_ERROR: "criterioCustom/GET_OPCION_ERROR",
  UPDATE_OPCION_REQUEST: "criterioCustom/UPDATE_OPCION_REQUEST",
  UPDATE_OPCION_SUCCESS: "criterioCustom/UPDATE_OPCION_SUCCESS",
  UPDATE_OPCION_ERROR: "criterioCustom/UPDATE_OPCION_ERROR",
  DISABLE_OPCION_REQUEST: "criterioCustom/DISABLE_OPCION_REQUEST",
  DISABLE_OPCION_SUCCESS: "criterioCustom/DISABLE_OPCION_SUCCESS",
  DISABLE_OPCION_ERROR: "criterioCustom/DISABLE_OPCION_ERROR",
  ADD_OPCION_REQUEST: "criterioCustom/ADD_OPCION_REQUEST",
  ADD_OPCION_SUCCESS: "criterioCustom/ADD_OPCION_SUCCESS",
  ADD_OPCION_ERROR: "criterioCustom/ADD_OPCION_ERROR",
};

export const actions = {
  getOpcion: (id) => ({
    type: types.GET_OPCION_REQUEST,
    id,
  }),
  updateOpcion: (id, descripcion, orden, puntos) => ({
    type: types.UPDATE_OPCION_REQUEST,
    id, 
    descripcion,
    orden,
    puntos
  }),
  disableOpcion: (id) => ({
    type: types.DISABLE_OPCION_REQUEST,
    id,
  }),
  addOpcion: (descripcion, orden, puntos, criterioId) => ({
    type: types.ADD_OPCION_REQUEST,
    descripcion,
    orden,
    puntos,
    criterioId,
  }),
};

const defaultState = {
  isLoading: false,
  opcion: null,
  upated: null,
  created: null,
}

export const selectors = {
  getIsLoading: ({ opcionCustom }) => opcionCustom.isLoading,
  getOpcion: ({ opcionCustom }) => opcionCustom.opcion,
  getUpdated: ({ opcionCustom }) => opcionCustom.updated,
};

const criterioOpcionReducer = (state = defaultState, action = {}) => {
  const { opcion } = action;

  switch (action.type) {
    case types.GET_OPCION_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case types.GET_OPCION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        opcion: opcion,
      };

    case types.GET_OPCION_ERROR:
      return {
        ...state,
        isLoading: false,
        opcion: null,
      };

    case types.UPDATE_OPCION_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    
    case types.UPDATE_OPCION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        updated: true,
      };

    case types.UPDATE_OPCION_ERROR:
      return {
        ...state,
        isLoading: false,
        updated: false,
      };

    case types.DISABLE_OPCION_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    
    case types.DISABLE_OPCION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        updated: true,
      };

    case types.DISABLE_OPCION_ERROR:
      return {
        ...state,
        isLoading: false,
        updated: false,
      };

    case types.ADD_OPCION_REQUEST:
      return {
        ...state,
        isLoading: true,
        created: null,
      };
    
    case types.ADD_OPCION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        created: true,
      };

    case types.ADD_OPCION_ERROR:
      return {
        ...state,
        isLoading: false,
        created: false,
      };

    default:
      return state;
    
  };
};

export default criterioOpcionReducer;