export const types = {
  SAVE_EVALUACION_REQUEST: "evaluacion/SAVE_EVALUACION_REQUEST",
  SAVE_EVALUACION_SUCCESS: "evaluacion/SAVE_EVALUACION_SUCCESS",
  SAVE_EVALUACION_ERROR: "evaluacion/SAVE_EVALUACION_ERROR",
  GET_EVALUACION_RESULT_REQUEST: "evaluacion/GET_EVALUACION_RESULT_REQUEST",
  GET_EVALUACION_RESULT_SUCCESS: "evaluacion/GET_EVALUACION_RESULT_SUCCESS",
  GET_EVALUACION_RESULT_ERROR: "evaluacion/GET_EVALUACION_RESULT_ERROR",
  GET_EVALUACION_RESULT_BY_BATCH_REQUEST: "evaluacion/GET_EVALUACION_RESULT_BY_BATCH_REQUEST",
  GET_EVALUACION_RESULT_BY_BATCH_SUCCESS: "evaluacion/GET_EVALUACION_RESULT_BY_BATCH_SUCCESS",
  GET_EVALUACION_RESULT_BY_BATCH_ERROR: "evaluacion/GET_EVALUACION_RESULT_BY_BATCH_ERROR",
  INIT: "evaluacion/INIT",
};

export const actions = {
  init: () => ({
    type: types.INIT
  }),
  saveEvaluacion: (usuarioId, opciones) => ({
    type: types.SAVE_EVALUACION_REQUEST,
    usuarioId,
    opciones,
  }),
  getEvaluacionResult: (usuarioId, tipoEvaluacionId) => ({
    type: types.GET_EVALUACION_RESULT_REQUEST,
    usuarioId,
    tipoEvaluacionId
  }),
  getEvaluacionResultByBatch: (usuarioId, tipoEvaluacionId, batchId) => ({
    type: types.GET_EVALUACION_RESULT_BY_BATCH_REQUEST,
    usuarioId,
    tipoEvaluacionId,
    batchId,
  }),
};

const defaultState = {
  isLoading: false,
  success: null,
  evaluacionList: [],
  errorMessage: null,
}

export const selectors = {
  getIsLoading: ({ evaluacion }) => evaluacion.isLoading,
  getSuccess: ({ evaluacion }) => evaluacion.success,
  getEvaluacionList: ({ evaluacion }) => evaluacion.evaluacionList,
  getErrorMessage: ({ evaluacion }) => evaluacion.errorMessage,
};

const evaluacionReducer = (state = defaultState, action = {}) => {
  const {
    evaluacionList,
    errorMessage,
  } = action;

  switch (action.type) {
    case types.SAVE_EVALUACION_REQUEST:
      return {
        ...state,
        isLoading: true,
        success: null,
        errorMessage: null,
      };

    case types.SAVE_EVALUACION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        errorMessage: null,
      };

    case types.SAVE_EVALUACION_ERROR:
      return {
        ...state,
        isLoading: false,
        success: false,
        errorMessage: errorMessage,
      };

    case types.GET_EVALUACION_RESULT_REQUEST:
    case types.GET_EVALUACION_RESULT_BY_BATCH_REQUEST:
      return {
        ...state,
        isLoading: true,
        evaluacionList: [],
      };

    case types.GET_EVALUACION_RESULT_SUCCESS:
    case types.GET_EVALUACION_RESULT_BY_BATCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        evaluacionList: evaluacionList,
      };

    case types.GET_EVALUACION_RESULT_ERROR:
    case types.GET_EVALUACION_RESULT_BY_BATCH_ERROR:
      return {
        ...state,
        isLoading: false,
        evaluacionList: []
      };
      

    case types.INIT:
      return {
        ...state,
        success: null,
        errorMessage: null,
      };
    
    default:
      return state;
  };
};

export default evaluacionReducer;