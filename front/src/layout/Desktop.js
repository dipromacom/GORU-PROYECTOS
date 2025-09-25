/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from "react";
import "./Desktop.css";
import Menu  from "../components/menu/Menu";
import TopMenu from "../components/topMenu/TopMenu";
import { Route } from "react-router-dom";
import { connect } from "react-redux";
import { selectors as sessionSelectors } from "../reducers/session";
import { selectors as projectSelector } from "../reducers/project";
import { actions as routesActions } from "../reducers/routes";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from "../components/spinner/Spinner";

function Desktop({ dispatch, component, isAuthenticated, isLoading, ...props }) {

  useEffect(() => {
    function validateSession(){
      if (isAuthenticated != null) {
        if (isAuthenticated === false) {
         dispatch(routesActions.goTo(""));
       }
     }
    }

    validateSession();
  }, [isAuthenticated]);

    const getLayout = () => {
        const ParentContainer = component;

        return (
            <>
            
            <div className="Desktop">
            
            <div className="float-left left-menu">
                <Menu></Menu>
            </div>

            <div className="float-left main-container">
                <TopMenu></TopMenu>

                
                {component !== undefined && component !== null && (
                  <>
                  {isLoading && <Spinner />}
                  <ParentContainer />
                  </>
                  )}
            </div>

            <ToastContainer pauseOnHover={false} pauseOnFocusLoss={false} />
            </div>
            </>
        );
    }

    return (
        <Route
                {...props}
                render={() => {
                    return <>{getLayout()}</>;
                }}
            />
    );
}

const mapStateToProps = state => ({
  isAuthenticated: sessionSelectors.getIsAuthenticated(state),
  isLoading: projectSelector.getIsLoading(state)
});

export default connect(mapStateToProps)(Desktop);