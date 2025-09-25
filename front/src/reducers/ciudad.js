export const types = {
  GET_CIUDAD_BY_PAIS_REQUEST: "ciudad/GET_CIUDAD_BY_PAIS_REQUEST",
  GET_CIUDAD_BY_PAIS_SUCCESS: "ciudad/GET_CIUDAD_BY_PAIS_SUCCESS",
  GET_CIUDAD_BY_PAIS_ERROR: "ciudad/GET_CIUDAD_BY_PAIS_ERROR",
};

export const actions = {
  getCiudadByPais: (pais) => ({
    type: types.GET_CIUDAD_BY_PAIS_REQUEST,
    pais,
  }),
};

const defaultState = {
  isLoading: false,
  ciudadList: [],
  pais: null,
};

const ciudadReducer = (state = defaultState, action = {}) => {
  const {
    ciudadList
  } = action;

  switch (action.type) {
    case types.GET_CIUDAD_BY_PAIS_REQUEST:
      return {
        ...state,
        isLoading: true,
        ciudadList: [],
      };

    case types.GET_CIUDAD_BY_PAIS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        ciudadList: ciudadList,
      };

    case types.GET_CIUDAD_BY_PAIS_ERROR:
      return {
        ...state,
        isLoading: false,
        ciudadList: [],
      };
  
    default:
      return state;
  }
};

export default ciudadReducer;

export const selectors = {
  getIsLoading: ({ ciudad }) => ciudad.isLoading,
  getCiudadList: ({ ciudad }) => ciudad.ciudadList,
  getPais: ({ ciudad }) => ciudad.pais,
};