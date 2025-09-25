export const types = {
  SEND_MAIL_REQUEST: "contacto/SEND_MAIL_REQUEST",
  SEND_MAIL_SUCCESS: "contacto/SEND_MAIL_SUCCESS",
  SEND_MAIL_ERROR: "contacto/SEND_MAIL_ERROR",
};

export const actions = {
  sendMail: (email, motivo, mensaje) => ({
    type: types.SEND_MAIL_REQUEST,
    email,
    motivo,
    mensaje
  })
};

const defaultState = {
  isLoading: false,
  success: false
}

export const selectors = {
  getIsLoading: ({ contacto }) => contacto.isLoading,
  getSuccess: ({ contacto }) => contacto.success,
};

const contactoReducer = (state = defaultState, action = {}) => {
  switch (action.type) {
    case types.SEND_MAIL_REQUEST:
      return {
        ...state,
        isLoading: true,
        success: false
      };

    case types.SEND_MAIL_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true
      };

    case types.SEND_MAIL_ERROR:
      return {
        ...state,
        isLoading: false,
        success: false,
      };
    
    default:
      return state;
  };
};

export default contactoReducer;