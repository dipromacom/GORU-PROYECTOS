import moment from 'moment';

export const types = {
    FETCH_TIMESHEET_REQUEST: "timesheet/FETCH_TIMESHEET_REQUEST",
    FETCH_TIMESHEET_SUCCESS: "timesheet/FETCH_TIMESHEET_SUCCESS",
    FETCH_TIMESHEET_ERROR: "timesheet/FETCH_TIMESHEET_ERROR",

    SAVE_TIMESHEET_REQUEST: "timesheet/SAVE_TIMESHEET_REQUEST",
    SAVE_TIMESHEET_SUCCESS: "timesheet/SAVE_TIMESHEET_SUCCESS",
    SAVE_TIMESHEET_ERROR: "timesheet/SAVE_TIMESHEET_ERROR",

    SUBMIT_TIMESHEET_REQUEST: "timesheet/SUBMIT_TIMESHEET_REQUEST",
    SUBMIT_TIMESHEET_SUCCESS: "timesheet/SUBMIT_TIMESHEET_SUCCESS",
    SUBMIT_TIMESHEET_ERROR: "timesheet/SUBMIT_TIMESHEET_ERROR",

    UPDATE_ENTRY: "timesheet/UPDATE_ENTRY",
    CLEAR_ALERT: "timesheet/CLEAR_ALERT",
    CLEAN: "timesheet/CLEAN",
};

export const actions = {
    fetchTimesheet: ({ desde, hasta }) => ({
        type: types.FETCH_TIMESHEET_REQUEST,
        desde,
        hasta,
    }),

    fetchTimesheetSuccess: ({ tasks, entries }) => ({
        type: types.FETCH_TIMESHEET_SUCCESS,
        tasks,
        entries,
    }),

    fetchTimesheetError: () => ({
        type: types.FETCH_TIMESHEET_ERROR,
    }),

    saveTimesheet: ({ desde, hasta }) => ({
        type: types.SAVE_TIMESHEET_REQUEST,
        desde,
        hasta,
    }),

    saveTimesheetSuccess: () => ({
        type: types.SAVE_TIMESHEET_SUCCESS,
    }),

    saveTimesheetError: () => ({
        type: types.SAVE_TIMESHEET_ERROR,
    }),

    submitTimesheet: ({ desde, hasta }) => ({
        type: types.SUBMIT_TIMESHEET_REQUEST,
        desde,
        hasta,
    }),

    submitTimesheetSuccess: () => ({
        type: types.SUBMIT_TIMESHEET_SUCCESS,
    }),

    submitTimesheetError: () => ({
        type: types.SUBMIT_TIMESHEET_ERROR,
    }),

    updateEntry: (key, entry) => ({
        type: types.UPDATE_ENTRY,
        key,
        entry,
    }),

    clearAlert: () => ({
        type: types.CLEAR_ALERT,
    }),

    clean: () => ({
        type: types.CLEAN,
    }),
};

export const selectors = {
    getTasks: ({ timesheet }) => timesheet.tasks || [],
    getEntries: ({ timesheet }) => timesheet.entries || {},
    getLoading: ({ timesheet }) => timesheet.loading,
    getSaving: ({ timesheet }) => timesheet.saving,
    getSubmitting: ({ timesheet }) => timesheet.submitting,
    getAlert: ({ timesheet }) => timesheet.alertMessage,
};

const defaultState = {
    tasks: [],
    entries: {},
    loading: false,
    saving: false,
    submitting: false,
    alertMessage: null,
};

const buildEntriesMap = (entries) => {
    const map = {};
    (entries || []).forEach(e => {
        const dateStr = moment(e.fecha).format('YYYY-MM-DD');
        const key = `${e.task_id}_${dateStr}`;
        map[key] = {
            horas: parseFloat(e.horas || 0),
            estado: e.estado,
            fecha_envio: e.fecha_envio,
            project_id: e.project_id,
        };
    });
    return map;
};

const timesheetReducer = (state = defaultState, action = {}) => {
    switch (action.type) {
        case types.FETCH_TIMESHEET_REQUEST:
            return { ...state, loading: true, alertMessage: null };

        case types.FETCH_TIMESHEET_SUCCESS:
            return {
                ...state,
                loading: false,
                tasks: action.tasks || [],
                entries: buildEntriesMap(action.entries),
            };

        case types.FETCH_TIMESHEET_ERROR:
            return {
                ...state,
                loading: false,
                alertMessage: {
                    type: 'danger',
                    text: 'Ocurrió un error al cargar la información de la hoja de tiempos.'
                }
            };

        case types.SAVE_TIMESHEET_REQUEST:
            return { ...state, saving: true, alertMessage: null };

        case types.SAVE_TIMESHEET_SUCCESS:
            return {
                ...state,
                saving: false,
                alertMessage: { type: 'success', text: 'Borrador guardado correctamente.' }
            };

        case types.SAVE_TIMESHEET_ERROR:
            return {
                ...state,
                saving: false,
                alertMessage: { type: 'danger', text: 'Error al guardar los cambios en la hoja de tiempos.' }
            };

        case types.SUBMIT_TIMESHEET_REQUEST:
            return { ...state, submitting: true, alertMessage: null };

        case types.SUBMIT_TIMESHEET_SUCCESS:
            return {
                ...state,
                submitting: false,
                alertMessage: {
                    type: 'success',
                    text: '¡Horas enviadas con éxito! El progreso en los proyectos asociados se ha actualizado.'
                }
            };

        case types.SUBMIT_TIMESHEET_ERROR:
            return {
                ...state,
                submitting: false,
                alertMessage: { type: 'danger', text: 'Ocurrió un problema al enviar las horas del periodo.' }
            };

        case types.UPDATE_ENTRY:
            return {
                ...state,
                entries: { ...state.entries, [action.key]: action.entry },
            };

        case types.CLEAR_ALERT:
            return { ...state, alertMessage: null };

        case types.CLEAN:
            return defaultState;

        default:
            return state;
    }
};

export default timesheetReducer;
