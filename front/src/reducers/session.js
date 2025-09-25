export const types = {
  LOGIN_REQUEST: "session/LOGIN_REQUEST",
  LOGIN_SUCCESS: "session/LOGIN_SUCESS",
  LOGIN_ERROR: "session/LOGIN_ERROR",

  LOGOUT_REQUEST: "session/LOGOUT_REQUEST",
  LOGOUT_SUCCESS: "session/LOGOUT_SUCCESS",
  LOGOUT_ERROR: "session/LOGOUT_ERROR",

  SIGN_UP_REQUEST: "session/SIGN_UP_REQUEST",
  SIGN_UP_SUCCESS: "session/SIGN_UP_SUCCESS",
  SIGN_UP_ERROR: "session/SIGN_UP_ERROR",

  CONFIRM_SIGN_UP_REQUEST: "session/CONFIRM_SIGN_UP_REQUEST",

  GET_CURRENT_SESSION_REQUEST: "session/GET_CURRENT_SESSION",
  GET_CURRENT_SESSION_SUCCESS: "session/GET_CURRENT_SUCCESS",
  GET_CURRENT_SESSION_FINISH: "session/GET_CURRENT_SESSION_FINISH",

  SET_MEMBRESIA_REQUEST: "session/SET_MEMBRESIA_REQUEST",
  SET_MEMBRESIA_SUCCESS: "session/SET_MEMBRESIA_SUCCESS",

  VALIDATE_EMAIL_REQUEST: "session/VALIDATE_EMAIL_REQUEST",
  VALIDATE_EMAIL_SUCCESS: "session/VALIDATE_EMAIL_SUCCESS",
  VALIDATE_EMAIL_ERROR: "session/VALIDATE_EMAIL_ERROR",

  SEND_CODE_REQUEST: "session/SEND_CODE_REQUEST",
  SEND_CODE_SUCCESS: "session/SEND_CODE_SUCCESS",
  SEND_CODE_ERROR: "session/SEND_CODE_ERROR",

  RECOVER_ACCOUNT_REQUEST: "session/RECOVER_ACCOUNT_REQUEST",
  RECOVER_ACCOUNT_SUCCESS: "session/RECOVER_ACCOUNT_SUCCESS",
  RECOVER_ACCOUNT_ERROR: "session/RECOVER_ACCOUNT_ERROR",

  RESET_CODE: "session/RESET_CODE",

};

export const actions = {
  login: (email, password) => ({
    type: types.LOGIN_REQUEST,
    email,
    password,
  }),
  logout: () => ({
    type: types.LOGOUT_REQUEST,
  }),
  signUp: (email, password) => ({
    type: types.SIGN_UP_REQUEST,
    email,
    password
  }),
  confirmSignUp: (email, confirmationCode) => ({
    type: types.CONFIRM_SIGN_UP_REQUEST,
    email,
    confirmationCode
  }),
  getCurrentSession: () => ({
    type: types.GET_CURRENT_SESSION_REQUEST
  }),
  validateEmail: (email) => ({
    type: types.VALIDATE_EMAIL_REQUEST,
    email,
  }),
  sendCode: (email) => ({
    type: types.SEND_CODE_REQUEST,
    email,
  }),
  recoverAccount: (email, code, password) => ({
    type: types.RECOVER_ACCOUNT_REQUEST,
    email,
    code,
    password,
  }),
  resetCode: () => ({
    type: types.RESET_CODE
  })
};

const defaultState =  {
  isAuthenticated: null,
  isAuthenticating: false,
  isValidatingSession: false,
  userAws: null,
  userSystem: null,
  jwtToken: null,
  emailAvailable: null,
  errorMessage: null,
  codeSent: null
};

const sessionReducer = (state = defaultState, action = {}) => {
  const { 
    userAws,
    userSystem,
    jwtToken,
    emailAvailable,
    errorMessage,
   } = action;

  switch (action.type) {
    case types.LOGIN_REQUEST:
      return {
        ...state,
        isAuthenticated: false,
        isAuthenticating: true,
        errorMessage: "",
      };

    case types.LOGIN_SUCCESS:
      return {
        ...state,
        userAws: userAws,
        userSystem: userSystem,
        jwtToken: jwtToken,
        isAuthenticated: true,
        isAuthenticating: false,
        errorMessage: "",
      };

    case types.LOGIN_ERROR:
      return {
        ...state,
        userAws: null,
        userSystem: null,
        isAuthenticated: false,
        isAuthenticating: false,
        errorMessage: errorMessage,
      };

    case types.LOGOUT_REQUEST:
      return {
        ...state,
        isAuthenticated:  true,
      };

    case types.LOGOUT_SUCCESS:
      return {
        ...state,
        isAuthenticated:  false,
        isAuthenticating: false,
        userAws: null,
        userSystem: null
      };

    case types.LOGOUT_ERROR:
      return {
        ...state,
        isAuthenticated:  true,
      };

    case types.SIGN_UP_REQUEST:
      return {
        ...state,
        userAws: null,
        userSystem: null,
        isAuthenticating: true,
        errorMessage: "",
      };

    case types.SIGN_UP_SUCCESS:
      return {
        ...state,
        userAws: userAws,
        userSystem: userSystem,
        isAuthenticating: false,
        errorMessage: "",
      };

    case types.SIGN_UP_ERROR: 
      return {
        ...state,
        userAws: null,
        userSystem: null,
        isAuthenticating: false,
        errorMessage: errorMessage,
      };

    case types.CONFIRM_SIGN_UP_REQUEST:
      return {
        ...state
      };

    case types.GET_CURRENT_SESSION_REQUEST:
      return {
        ...state,
        isValidatingSession: true,
        isAuthenticated: null
      }

    case types.GET_CURRENT_SESSION_SUCCESS:
      return {
        ...state,
        isValidatingSession: false,
        isAuthenticated: true
      };

    case types.GET_CURRENT_SESSION_FINISH:
      return {
        ...state,
        isValidatingSession: false,
      };

    case types.VALIDATE_EMAIL_REQUEST:
      return state;

    case types.VALIDATE_EMAIL_SUCCESS:
      return {
        ...state,
        emailAvailable: emailAvailable,
      };
    
    case types.VALIDATE_EMAIL_ERROR:
      return {
        ...state,
        emailAvailable: false,
      };

    case types.SEND_CODE_REQUEST:
      return {
        ...state,
        userAws: null,
        userSystem: null,
        isAuthenticating: true,
        isAuthenticated: false,
        errorMessage: null,
      };

    case types.SEND_CODE_SUCCESS:
      return {
        ...state,
        userAws: userAws,
        isAuthenticating: false,
        codeSent: true,
      };

    case types.SEND_CODE_ERROR:
      return {
        ...state,
        isAuthenticating: false,
        codeSent: false,
      };

    case types.RECOVER_ACCOUNT_REQUEST:
      return {
        ...state,
        userAws: null,
        userSystem: null,
        isAuthenticating: true,
        isAuthenticated: false,
        errorMessage: null,
      }
    
    case types.RECOVER_ACCOUNT_SUCCESS:
      return {
        ...state,
        isAuthenticating: false,
        errorMessage: null,
      };

    case types.RECOVER_ACCOUNT_ERROR:
      return {
        ...state,
        isAuthenticating: false,
        errorMessage: errorMessage,
      };

    case types.RESET_CODE:
      return {
        ...state,
        codeSent: null,
      };

    default:
      return state;
  }

};

export default sessionReducer;

export const selectors = {
  getIsAuthenticated: ({ session }) => session.isAuthenticated,
  getIsAuthenticating: ({ session }) => session.isAuthenticating,
  getAwsUser: ({ session }) => session.userAws,
  getUser: ({ session }) => session.userSystem,
  getIsValidatingSession: ({ session }) =>  session.isValidatingSession,
  getJwtToken: ({ session }) => session.jwtToken,
  getEmailAvailable: ({ session }) => session.emailAvailable,
  getErrorMessage: ({ session }) => session.errorMessage,
  getCodeSent: ({ session }) => session.codeSent,
};