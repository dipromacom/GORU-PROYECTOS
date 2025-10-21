export const types = {
  SET_MEMBRESIA_REQUEST: "usuario/SET_MEMBRESIA_REQUEST",
  SET_MEMBRESIA_SUCCESS: "usuario/SET_MEMBRESIA_SUCCESS",
  SET_MEMBRESIA_ERROR: "usuario/SET_MEMBRESIA_ERROR",
};

export const actions = {
  setMembresia: (usuarioId, value) => ({
    type: types.SET_MEMBRESIA_REQUEST,
    usuarioId, value
  })
};

const defaultState = {
  isLoading: false
};

const usuarioReducer = (state = defaultState, action = {}) => {
  switch (action.type) {
    case types.SET_MEMBRESIA_REQUEST:
      return {
        ...state,
        isLoading: true
      };
  
    case types.SET_MEMBRESIA_SUCCESS:
      return {
        ...state,
        isLoading: false
      };

    case types.SET_MEMBRESIA_ERROR:
      return {
        ...state,
        isLoading: false
      };

    default:
      return state;
  }
};

export default usuarioReducer;

export const selectors = {
  getIsLoading: ({ usuario }) => usuario.isLoading,
};