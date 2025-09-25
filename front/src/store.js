import { createStore, compose, applyMiddleware } from "redux";
import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";
import createSagaMiddleware from "redux-saga";
import createRootReducer from "./reducers";
import rootSaga from "./sagas";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const history = createBrowserHistory()

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

const appReducer = createRootReducer(history);

const rootReducer = (state, action) => {
  if (action.type === 'session/LOGOUT_SUCCESS') {
    storage.removeItem('persist:root');
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
}

const persistedReducer = persistReducer({
  key: 'root',
  storage
}, rootReducer);

const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware)));

const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

export { store, history, persistor };