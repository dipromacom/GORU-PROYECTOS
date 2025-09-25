export const types = {
  GET_OPCION_BY_TIPO_EVALUACION_REQUEST: "opcion/GET_OPCION_BY_TIPO_EVALUACION_REQUEST",
  GET_OPCION_BY_TIPO_EVALUACION_SUCCESS: "opcion/GET_OPCION_BY_TIPO_EVALUACION_SUCCESS",
  GET_OPCION_BY_TIPO_EVALUACION_ERROR: "opcion/GET_OPCION_BY_TIPO_EVALUACION_ERROR",
};

export const actions = {
  getOpcionByTipoEvaluacion: (tipoEvaluacion, usuario) => ({
    type: types.GET_OPCION_BY_TIPO_EVALUACION_REQUEST,
    tipoEvaluacion,
    usuario,
  }),
};

const defaultState = {
  isLoading: true,
  opcionList: [],
  tipoEvaluacion: null,
  isCustom: null,
};

export const selectors = {
  getIsLoading: ({ opcion }) => opcion.isLoading,
  getOpcionList: ({ opcion }) => opcion.opcionList,
  getTipoEvaluacion: ({ opcion }) => opcion.tipoEvaluacion,
  getIsCustom: ({ opcion }) => opcion.isCustom,
};

const opcionReducer = (state = defaultState, action = {}) => {
  const {
    opcionList, isCustom
  } = action;

  switch (action.type) {
    case types.GET_OPCION_BY_TIPO_EVALUACION_REQUEST:
      return {
        ...state,
        isLoading: true,
        // opcionList: [],
      };

    case types.GET_OPCION_BY_TIPO_EVALUACION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        opcionList: opcionList,
        isCustom: isCustom
      };

    case types.GET_OPCION_BY_TIPO_EVALUACION_ERROR:
      return {
        ...state,
        isLoading: false,
        opcionList: [],
      };

    default:
      return state;
  }
};

export default opcionReducer;