export const types = {
  GET_TIPO_PROYECTO_REQUEST: "tipo_proyecto/GET_TIPO_PROYECTO_REQUEST",
  GET_TIPO_PROYECTO_SUCCESS: "ciudad/GET_TIPO_PROYECTO_SUCCESS",
  GET_TIPO_PROYECTO_ERROR: "ciudad/GET_TIPO_PROYECTO_ERROR",
};

export const actions = {
  getTipoProyecto: () => ({
    type: types.GET_TIPO_PROYECTO_REQUEST,
  }),
};

const defaultState = {
  isLoading: false,
  tipoProyectoList: [],
};

const tipoProyectoReducer = (state = defaultState, action = {}) => {
  const {
    tipoProyectoList
  } = action;

  switch (action.type) {
    case types.GET_TIPO_PROYECTO_REQUEST:
      return {
        ...state,
        isLoading: true,
        tipoProyectoList: [],
      };

    case types.GET_TIPO_PROYECTO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        tipoProyectoList,
      };

    case types.GET_TIPO_PROYECTO_ERROR:
      return {
        ...state,
        isLoading: false,
        tipoProyectoList: [],
      };
  
    default:
      return state;
  }
};

export default tipoProyectoReducer;

export const selectors = {
  getIsLoading: ({ tipoProyecto }) => tipoProyecto.isLoading,
  getTipoProyectoList: ({ tipoProyecto }) => tipoProyecto.tipoProyectoList,
};