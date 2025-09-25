export const types = {
  GO_TO_PROFILE: "routes/GO_TO_PROFILE",
  GO_TO: "routes/GO_TO",
};

export const actions = {
  goToProfile: () => ({
    type: types.GO_TO_PROFILE
  }),
  goTo: (page) => ({
    type: types.GO_TO,
    page
  }),
};

const defaultState = {};

const routesSession = (state = defaultState, action = {}) => {
  switch (action.type) {
    case types.GO_TO_PROFILE:
      return state;

    case types.GO_TO:
      return state;
  
    default:
      return state;
  }
};

export default routesSession;
