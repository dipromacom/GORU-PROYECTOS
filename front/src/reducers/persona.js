export const types = {
  UPDATE_PROFILE_REQUEST: "persona/UPDATE_PROFILE_REQUEST",
  UPDATE_PROFILE_SUCCESS: "persona/UPDATE_PROFILE_SUCCESS",
  UPDATE_PROFILE_ERROR: "persona/UPDATE_PROFILE_ERROR",
  GET_PROFILE_REQUEST: "persona/GET_PROFILE_REQUEST",
  GET_PROFILE_SUCCESS: "persona/GET_PROFILE_SUCCESS",
  GET_PROFILE_ERROR: "persona/GET_PROFILE_ERROR",
  CLEAR_MESSAGE: "persona/CLEAR_MESSAGE",
};

export const actions = {
  clearMessage: () => ({
    type: types.CLEAR_MESSAGE,
  }),
  updateProfile: (usuario, details) => ({
    type: types.UPDATE_PROFILE_REQUEST,
    usuario,
    details,
  }),
  getProfile: (usuarioId) => ({
    type: types.GET_PROFILE_REQUEST,
    usuarioId
  }),
};

const defaultState = {
  isLoading: false,
  persona: null,
  direccion: [],
  telefono: [],
  errorMessage: null,
};

const personaReducer = (state = defaultState, action = {}) => {
  const {
    persona, direccion, telefono,
  } = action;

  switch (action.type) {
    case types.UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        isLoading: true,
        errorMessage: null,
      };

    case types.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        persona: persona,
        direccion: direccion,
        telefono: telefono,
        errorMessage: "Perfil actualizado correctamente",
      };
    
    case types.UPDATE_PROFILE_ERROR:
      return {
        ...state,
        isLoading: false,
        persona: null,
        errorMessage: "Ocurrio un problema al actualizar el perfil",
      };

    case types.GET_PROFILE_REQUEST: 
      return {
        ...state,
        isLoading: true,
      };
    
    case types.GET_PROFILE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        persona: persona,
        direccion: direccion, 
        telefono: telefono,
      };

    case types.GET_PROFILE_ERROR:
      return {
        ...state,
        isLoading: false,
      };

    case types.CLEAR_MESSAGE:
      return {
        ...state,
        errorMessage: null
      }

    default:
      return state;
  }
};

export default personaReducer;

export const selectors = {
  getIsLoading: ({ persona }) => persona.isLoading,
  getPersona: ({ persona }) => persona.persona,
  getDireccion: ({ persona }) => persona.direccion,
  getTelefono: ({ persona }) => persona.telefono,
  getErrorMessage: ({ persona }) => persona.errorMessage,
};