export const types = {
  GET_CRITERIO_REQUEST: "criterioCustom/GET_CRITERIO_REQUEST",
  GET_CRITERIO_SUCCESS: "criterioCustom/GET_CRITERIO_SUCCESS",
  GET_CRITERIO_ERROR: "criterioCustom/GET_CRITERIO_ERROR",
  UPDATE_CRITERIO_REQUEST: "criterioCustom/UPDATE_CRITERIO_REQUEST",
  UPDATE_CRITERIO_SUCCESS: "criterioCustom/UPDATE_CRITERIO_SUCCESS",
  UPDATE_CRITERIO_ERROR: "criterioCustom/UPDATE_CRITERIO_ERROR",
  DISABLE_CRITERIO_REQUEST: "criterioCustom/DISABLE_CRITERIO_REQUEST",
  DISABLE_CRITERIO_SUCCESS: "criterioCustom/DISABLE_CRITERIO_SUCCESS",
  DISABLE_CRITERIO_ERROR: "criterioCustom/DISABLE_CRITERIO_ERROR",
  ADD_CRITERIO_REQUEST: "criterioCustom/ADD_CRITERIO_REQUEST",
  ADD_CRITERIO_SUCCESS: "criterioCustom/ADD_CRITERIO_SUCCESS",
  ADD_CRITERIO_ERROR: "criterioCustom/ADD_CRITERIO_ERROR",
};

export const actions = {
  getCriterio: (id) => ({
    type: types.GET_CRITERIO_REQUEST,
    id
  }),
  updateCriterio: (id, descripcion, orden, pesoLimite) => ({
    type: types.UPDATE_CRITERIO_REQUEST,
    id, 
    descripcion,
    orden,
    pesoLimite
  }),
  disableCriterio: (id) => ({
    type: types.DISABLE_CRITERIO_REQUEST,
    id,
  }),
  addCriterio: (descripcion, orden, pesoLimite, usuario) => ({
    type: types.ADD_CRITERIO_REQUEST,
    descripcion,
    orden,
    pesoLimite,
    usuario,
  })
};

const defaultState = {
  isLoading: false,
  criterio: null,
  upated: null,
  created: null,
}

export const selectors = {
  getIsLoading: ({ criterioCustom }) => criterioCustom.isLoading,
  getCriterio: ({ criterioCustom }) => criterioCustom.criterio,
  getUpdated: ({ opcionCustom }) => opcionCustom.updated,
};

const criterioCustomReducer = (state = defaultState, action = {}) => {
  const { criterio } = action;

  switch (action.type) {
    case types.GET_CRITERIO_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case types.GET_CRITERIO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        criterio: criterio,
      };

    case types.GET_CRITERIO_ERROR:
      return {
        ...state,
        isLoading: false,
        criterio: null,
      };

    case types.UPDATE_CRITERIO_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    
    case types.UPDATE_CRITERIO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        updated: true,
      }

    case types.UPDATE_CRITERIO_ERROR:
      return {
        ...state,
        isLoading: false,
        updated: false,
      };

    case types.DISABLE_CRITERIO_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    
    case types.DISABLE_CRITERIO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        updated: true,
      };

    case types.DISABLE_CRITERIO_ERROR:
      return {
        ...state,
        isLoading: false,
        updated: false,
      };

    case types.ADD_CRITERIO_REQUEST:
      return {
        ...state,
        isLoading: true,
        created: null,
      };
    
    case types.ADD_CRITERIO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        created: true,
      }

    case types.ADD_CRITERIO_ERROR:
      return {
        ...state,
        isLoading: false,
        created: false,
      };
    

    default:
      return state;
    
  };
};

export default criterioCustomReducer;