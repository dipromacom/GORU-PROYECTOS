import { call, put, select, takeEvery } from "redux-saga/effects";
import { types, actions, selectors } from "../reducers/timesheet";
import * as Api from "../api";
import { onError } from "../libs/errorLib";

const sagas = [
    takeEvery(types.FETCH_TIMESHEET_REQUEST, handleFetchTimesheet),
    takeEvery(types.SAVE_TIMESHEET_REQUEST, handleSaveTimesheet),
    takeEvery(types.SUBMIT_TIMESHEET_REQUEST, handleSubmitTimesheet),
];

export default sagas;

const buildEntryList = (entriesMap, onlyPositive) => {
    const list = [];
    Object.keys(entriesMap || {}).forEach(key => {
        const [taskId, dateStr] = key.split('_');
        const item = entriesMap[key];
        if (!item) return;
        if (item.horas === undefined || item.horas === null || item.horas === '') return;

        const horas = parseFloat(item.horas || 0);
        if (onlyPositive && !(horas > 0)) return;

        list.push({
            task_id: taskId,
            project_id: item.project_id,
            fecha: dateStr,
            horas,
        });
    });
    return list;
};

function* refetchTimesheet(desde, hasta) {
    if (!desde || !hasta) return;
    try {
        const response = yield call(Api.getMyTimesheet, desde, hasta);
        const { success, data } = response.data;
        if (success) {
            yield put(actions.fetchTimesheetSuccess({ tasks: data.tasks, entries: data.entries }));
        } else {
            yield put(actions.fetchTimesheetError());
        }
    } catch (e) {
        onError(e);
        yield put(actions.fetchTimesheetError());
    }
}

function* handleFetchTimesheet({ desde, hasta }) {
    try {
        const response = yield call(Api.getMyTimesheet, desde, hasta);
        const { success, data } = response.data;
        if (success) {
            yield put(actions.fetchTimesheetSuccess({ tasks: data.tasks, entries: data.entries }));
        } else {
            yield put(actions.fetchTimesheetError());
        }
    } catch (e) {
        onError(e);
        yield put(actions.fetchTimesheetError());
    }
}

function* handleSaveTimesheet({ desde, hasta }) {
    try {
        const entriesMap = yield select(selectors.getEntries);
        const entryList = buildEntryList(entriesMap, false);

        yield call(Api.postSaveTimesheet, { entries: entryList });
        yield put(actions.saveTimesheetSuccess());
        yield call(refetchTimesheet, desde, hasta);
    } catch (e) {
        onError(e);
        yield put(actions.saveTimesheetError());
    }
}

function* handleSubmitTimesheet({ desde, hasta }) {
    try {
        const entriesMap = yield select(selectors.getEntries);
        const entryList = buildEntryList(entriesMap, true);

        yield call(Api.postSubmitTimesheet, { desde, hasta, entries: entryList });
        yield put(actions.submitTimesheetSuccess());
        yield call(refetchTimesheet, desde, hasta);
    } catch (e) {
        onError(e);
        yield put(actions.submitTimesheetError());
    }
}
