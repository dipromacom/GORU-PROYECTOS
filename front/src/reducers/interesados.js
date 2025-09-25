import moment from "moment";

export const types = {
    CREATE_INTERESTED_REQUEST: "interested/CREATE_INTERESTED_REQUEST",
    CREATE_INTERESTED_SUCCESS: "interested/CREATE_INTERESTED_SUCCESS",
    CREATE_INTERESTED_ERROR: "interested/CREATE_INTERESTED_ERROR",
    GET_INTERESTED_LIST_REQUEST: "interested/GET_INTERESTED_LIST_REQUEST",
    GET_INTERESTED_LIST_SUCCESS: "interested/GET_INTERESTED_LIST_SUCCESS",
    GET_INTERESTED_LIST_ERROR: "interested/GET_INTERESTED_LIST_ERROR",
    GET_INTERESTED_DETAIL_REQUEST: "interested/GET_INTERESTED_DETAIL_REQUEST",
    GET_INTERESTED_DETAIL_SUCCESS: "interested/GET_INTERESTED_DETAIL_SUCCESS",
    GET_INTERESTED_DETAIL_ERROR: "interested/GET_INTERESTED_DETAIL_ERROR",
};

export const actions = {
    createInterested: (payload) => ({
        type: types.CREATE_INTERESTED_REQUEST,
        payload,
    }),
    getInterestedList: (filter = {}) => ({
        type: types.GET_INTERESTED_LIST_REQUEST,
        filter,
    }),
    getInterestedDetail: (interestedId) => ({
        type: types.GET_INTERESTED_DETAIL_REQUEST,
        interestedId,
    }),
};

const defaultState = {
    isLoading: false,
    interestedList: [],
    interestedDetail: null,
    error: null,
};

export const selectors = {
    getIsLoading: ({ interested }) => interested.isLoading,
    getInterestedList: ({ interested }) => interested.interestedList,
    getInterestedDetail: ({ interested }) => interested.interestedDetail,
    getError: ({ interested }) => interested.error,
};

const interestedReducer = (state = defaultState, action = {}) => {
    const { interestedList, interestedDetail, error } = action;
    switch (action.type) {
        case types.CREATE_INTERESTED_REQUEST:
            return {
                ...state,
                isLoading: true,
            };
        case types.CREATE_INTERESTED_SUCCESS:
            return {
                ...state,
                isLoading: false,
                interestedList: [...state.interestedList, interestedDetail],
                error: null,
            };
        case types.CREATE_INTERESTED_ERROR:
            return {
                ...state,
                isLoading: false,
                error,
            };
        case types.GET_INTERESTED_LIST_REQUEST:
            return {
                ...state,
                isLoading: true,
            };
        case types.GET_INTERESTED_LIST_SUCCESS:
            return {
                ...state,
                isLoading: false,
                interestedList,
                error: null,
            };
        case types.GET_INTERESTED_LIST_ERROR:
            return {
                ...state,
                isLoading: false,
                interestedList: [],
                error,
            };
        case types.GET_INTERESTED_DETAIL_REQUEST:
            return {
                ...state,
                isLoading: true,
            };
        case types.GET_INTERESTED_DETAIL_SUCCESS:
            return {
                ...state,
                isLoading: false,
                interestedDetail,
                error: null,
            };
        case types.GET_INTERESTED_DETAIL_ERROR:
            return {
                ...state,
                isLoading: false,
                error,
            };
        default:
            return state;
    }
};

export default interestedReducer;
