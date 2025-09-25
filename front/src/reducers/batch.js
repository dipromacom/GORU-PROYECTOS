
export const types = {
  CREATE_BATCH_REQUEST: "batch/CREATE_BATCH_REQUEST",
  CREATE_BATCH_SUCCESS: "batch/CREATE_BATCH_SUCCESS",
  CREATE_BATCH_ERROR: "batch/CREATE_BATCH_ERROR",
  USER_HAS_ACTIVE_BATCH_REQUEST: "batch/USER_HAS_ACTIVE_BATCH_REQUEST",
  USER_HAS_ACTIVE_BATCH_SUCCESS: "batch/USER_HAS_ACTIVE_BATCH_SUCCESS",
  USER_HAS_ACTIVE_BATCH_ERROR: "batch/USER_HAS_ACTIVE_BATCH_ERROR",
  START_BATCH_SETUP_REQUEST: "batch/START_BATCH_SETUP_REQUEST",
  START_BATCH_SETUP_SUCCESS: "batch/START_BATCH_SETUP_SUCCESS",
  START_BATCH_SETUP_ERROR: "batch/START_BATCH_SETUP_ERROR",
  GET_BATCH_STATUS_REQUEST: "batch/GET_BATCH_STATUS_REQUEST",
  GET_BATCH_STATUS_SUCCESS: "batch/GET_BATCH_STATUS_SUCCESS",
  GET_BATCH_STATUS_ERROR: "batch/GET_BATCH_STATUS_ERROR",
  UPDATE_BATCH_SETUP_REQUEST: "batch/UPDATE_BATCH_SETUP_REQUEST",
  UPDATE_BATCH_SETUP_SUCCESS: "batch/UPDATE_BATCH_SETUP_SUCCESS",
  UPDATE_BATCH_SETUP_ERROR: "batch/UPDATE_BATCH_SETUP_ERROR",
  CLOSE_BATCH_REQUEST: "batch/CLOSE_BATCH_REQUEST",
  CLOSE_BATCH_SUCCESS: "batch/CLOSE_BATCH_SUCCESS",
  CLOSE_BATCH_ERROR: "batch/CLOSE_BATCH_ERROR",
  GET_CLOSED_BATCHES_REQUEST: "batch/GET_CLOSED_BATCHES_REQUEST",
  GET_CLOSED_BATCHES_SUCCESS: "batch/GET_CLOSED_BATCHES_SUCCESS",
  GET_CLOSED_BATCHES_ERROR: "batch/GET_CLOSED_BATCHES_ERROR",
  GET_BATCH_DETAILS_REQUEST: "batch/GET_BATCH_DETAILS_REQUEST",
  GET_BATCH_DETAILS_SUCCESS: "batch/GET_BATCH_DETAILS_SUCCESS",
  GET_BATCH_DETAILS_ERROR: "batch/GET_BATCH_DETAILS_ERROR",
  GET_BATCH_BY_PROJECT_ID_REQUEST: "batch/GET_BATCH_BY_PROJECT_ID_REQUEST",
  GET_BATCH_BY_PROJECT_ID_SUCCESS: "batch/GET_BATCH_BY_PROJECT_ID_SUCCESS",
  GET_BATCH_BY_PROJECT_ID_ERROR: "batch/GET_BATCH_BY_PROJECT_ID_ERROR",
  INIT: "bach/INIT",
};

export const actions = {
  createBatch: (nombre, descripcion, usuario) => ({
    type: types.CREATE_BATCH_REQUEST,
    nombre,
    descripcion,
    usuario,
  }),
  userHasActiveBatch: (usuario) => ({
    type: types.USER_HAS_ACTIVE_BATCH_REQUEST,
    usuario,
  }),
  startBatchSetup: (tipoEvaluacion, usuario) => ({
    type: types.START_BATCH_SETUP_REQUEST,
    tipoEvaluacion,
    usuario
  }),
  init: () => ({
    type: types.INIT
  }),
  getBatchStatus: (usuario) => ({
    type: types.GET_BATCH_STATUS_REQUEST,
    usuario,
  }),
  updateBatchSetup: (usuario, tipoEvaluacionId) => ({
    type: types.UPDATE_BATCH_SETUP_REQUEST,
    usuario,
    tipoEvaluacionId,
  }),
  closeBatch: (usuario) => ({
    type: types.CLOSE_BATCH_REQUEST,
    usuario,
  }),
  getClosedBatches: (usuario) => ({
    type: types.GET_CLOSED_BATCHES_REQUEST,
    usuario,
  }),
  getBatchDetails: (batchId, usuarioId) => ({
    type: types.GET_BATCH_DETAILS_REQUEST,
    batchId,
    usuarioId
  }),
  getBatchByProjectId: (projectId) => ({
    type: types.GET_BATCH_BY_PROJECT_ID_REQUEST,
    projectId
  })
  
};

const defaultState = {
  isLoading: false,
  hasActiveBatch: null,
  activeBatch: null,
  created: null,
  setupTerminado: null,
  message: null,
  closed: null,
  evaluaciones: 0,
  closedBatches: [],
  evaluacionList: [],
  details:  null,
  batchParentProject: null,
};

export const selectors = {
  getIsLoading: ({ batch }) => batch.isLoading,
  getCreated: ({ batch }) => batch.created,
  getMessage: ({ batch }) => batch.message,
  getClosed: ({ batch }) => batch.closed,
  getEvaluaciones: ({ batch } ) => batch.evaluaciones,
  getClosedBatches: ({ batch}) => batch.closedBatches,
  getHasActiveBatch: ({ batch }) => batch.hasActiveBatch,
  getDeatils: ({ batch }) => batch.details,
  getEvaluacionList: ({ batch }) => batch.evaluacionList,
  getActiveBatch: ({ batch }) => batch.activeBatch,
  getBatchParent: ({ batch }) => batch.batchParentProject,
};

const batchReducer = (state = defaultState, action = {}) => {
  const { hasBatch, success, 
    setupTerminado, message, evaluaciones, 
    closedBatch, closedBatches, details, evaluacionList, activeBatch, batchParentProject } = action;

  switch (action.type) {
    case types.CREATE_BATCH_REQUEST:
      return {
        ...state,
        isLoading: true,
        created: null,
      };

    case types.CREATE_BATCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        created: success,
      };

    case types.CREATE_BATCH_ERROR:
      return {
        ...state,
        isLoading: false,
      };

    case types.USER_HAS_ACTIVE_BATCH_REQUEST:
      return {
        ...state,
        isLoading: true,
        hasActiveBatch: null,
        activeBatch: null,
      };

    case types.USER_HAS_ACTIVE_BATCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        hasActiveBatch: hasBatch,
        activeBatch: activeBatch,
      };

    case types.USER_HAS_ACTIVE_BATCH_ERROR:
      return {
        ...state,
        isLoading: false,
      };

    case types.START_BATCH_SETUP_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case types.START_BATCH_SETUP_SUCCESS:
    case types.START_BATCH_SETUP_ERROR:
      return {
        ...state,
        isLoading: false,
      };
    
    case types.GET_BATCH_STATUS_REQUEST:
      return {
        ...state,
        isLoading: true,
        setupTerminado: null,
        evaluaciones: 0,
        closeBatch: null,
        hasActiveBatch: null,
      };

    case types.GET_BATCH_STATUS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        setupTerminado: setupTerminado,
        hasActiveBatch: hasBatch,
        evaluaciones: evaluaciones,
        closedBatch: closedBatch,
      };

    case types.GET_BATCH_STATUS_ERROR:
      return {
        ...state,
        isLoading: false,
        evaluaciones: 0,
      };

    case types.UPDATE_BATCH_SETUP_REQUEST:
      return {
        ...state,
        isLoading: true,
        message: "",
      };

    case types.UPDATE_BATCH_SETUP_SUCCESS:
    case types.UPDATE_BATCH_SETUP_ERROR:
      return {
        ...state,
        isLoading: false,
        message: message,
      };

    case types.CLOSE_BATCH_REQUEST:
      return {
        ...state
      };
    
    case types.CLOSE_BATCH_SUCCESS:
      return {
        ...state,
        closed: true,
      };

    case types.CLOSE_BATCH_SUCCESS:
      return {
        ...state,
        closed: false,
      };
    
    case types.GET_CLOSED_BATCHES_REQUEST:
      return {
        ...state,
        closedBatches: [],
        isLoading: true,
      };

    case types.GET_CLOSED_BATCHES_SUCCESS:
      return {
        ...state,
        closedBatches: closedBatches,
        isLoading: false,
      };

    case types.GET_CLOSED_BATCHES_ERROR:
      return {
        ...state,
        closedBatches: [],
        isLoading: false,
      };

      case types.GET_BATCH_DETAILS_REQUEST:
        return {
          ...state,
          details: null,
          evaluacionList: [],
          isLoading: true,
        };
  
      case types.GET_BATCH_DETAILS_SUCCESS:
        return {
          ...state,
          details: details,
          evaluacionList: evaluacionList,
          isLoading: false,
        };
  
      case types.GET_BATCH_DETAILS_ERROR:
        return {
          ...state,
          details: null,
          evaluacionList: [],
          isLoading: false,
        };
      case types.GET_BATCH_BY_PROJECT_ID_REQUEST: 
        return {
          ... state,
          isLoading: true
        };
      case types.GET_BATCH_BY_PROJECT_ID_SUCCESS: 
        return {
          ... state,
          isLoading: false,
          batchParentProject
        };
      case types.GET_BATCH_BY_PROJECT_ID_ERROR: 
        return {
          ... state,
          isLoading: false,
          batchParentProject: {}
        };
      
    case types.INIT: 
      return defaultState;
    
    default:
      return state;
  };
};

export default batchReducer;