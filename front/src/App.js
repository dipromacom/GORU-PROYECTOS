/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import Routes from "./Routes";
import "./css/Commons.css";
import './App.css';
import { onError } from "./libs/errorLib";

import { connect } from "react-redux";
import { actions as sessionActions, selectors as sessionSelectors } from "./reducers/session";

import { ConnectedRouter } from "connected-react-router";
import { history } from "./store";

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css'



function App({ dispatch, isValidatingSession }) {

  useEffect(() => {
    onLoad();
  }, []);

  async function onLoad() {
    try {
      dispatch(sessionActions.getCurrentSession());

    } catch(e) {
      onError(e);
    }
  }

  return (
    !isValidatingSession && (
      <div className="App">     
      <ConnectedRouter history={history}>
      <Routes />
      </ConnectedRouter>
    </div>
    )
  );
}

const mapStateToProps = state => ({
  isValidatingSession: sessionSelectors.getIsValidatingSession(state),
  isAuthenticated: sessionSelectors.getIsAuthenticated(state),
});

export default connect(mapStateToProps)(App);
