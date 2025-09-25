import React from "react";
import { actions as routesActions } from "../../reducers/routes";
import { connect } from "react-redux";
import { selectors as batchSelectors, actions as batchActions } from "../../reducers/batch";
import { selectors as sessionSelectors } from "../../reducers/session";
import "./WidgetTool.css";
import "../../css/Commons.css";

function WidgetTool({
    dispatch,
    title,
    description,
    hasDisccount,
    redirecTo,
    disabled,
    usuario,
    externalUrl
}) {
    
    function handlePayClick() {
        if (redirecTo === "batch") {
          dispatch(batchActions.getBatchStatus(usuario.id))
        } else if (externalUrl) { 
            window.open(externalUrl, "_blank");
        } else { 
            dispatch(routesActions.goTo(redirecTo));
        }
    }

    return (
        <div className="widget">
        <div className="widget-container">
            <h3 className="orange">{title}</h3>

            <div className="description-container">
                <p className="blue">
                {description}
                </p>
            </div>

            {
                !hasDisccount ? 

                    <div className="center">
                    <button type="button" className="btn btn-success btn-pagar" onClick={handlePayClick} disabled={disabled}>
                        Ingresar
                    </button>
                    </div> :

                    <div className="actions-placeholder">
                    <button type="button" className="btn btn-success btn-pagar" onClick={handlePayClick} disabled={disabled}>
                        Ingresar
                        </button>
                    <p className="green">Pagar cód. descuento</p>
                    </div>

            }
        </div>
        </div>
    );
}

const mapStateToProps = state => ({
  isLoading: batchSelectors.getIsLoading(state),
  usuario: sessionSelectors.getUser(state),
});

export default connect(mapStateToProps)(WidgetTool);