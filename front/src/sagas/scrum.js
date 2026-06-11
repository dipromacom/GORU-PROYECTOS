import { call, put, takeEvery } from 'redux-saga/effects';
import { types } from '../reducers/scrum';
import * as Api from '../api';
import { onError } from '../libs/errorLib';

const sagas = [
    takeEvery(types.FETCH_SCRUM_REQUEST, handleFetchScrum),
];

export default sagas;

function* handleFetchScrum({ projectId, includeArchived }) {
    try {
        const response = yield call(Api.getScrumOverview, projectId, { archivados: includeArchived ? '1' : '0' });
        const {
            success, epics, stories, archivedStories, sprints, stats, config, proyecto,
        } = response.data;

        if (success) {
            yield put({
                type: types.FETCH_SCRUM_SUCCESS,
                epics,
                stories,
                archivedStories: archivedStories || [],
                sprints,
                stats,
                config,
                proyecto,
            });
        } else {
            yield put({ type: types.FETCH_SCRUM_ERROR, error: 'No se pudo cargar Scrum' });
        }
    } catch (e) {
        onError(e);
        yield put({ type: types.FETCH_SCRUM_ERROR, error: e.message });
    }
}
