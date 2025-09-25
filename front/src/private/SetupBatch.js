import React, { useEffect, useMemo, useCallback, useState } from "react";
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { onError } from "../libs/errorLib";
import { selectors as sessionSelectors } from "../reducers/session";
import { actions as opcionActions, selectors as opcionSelectors } from "../reducers/opcion";
import { actions as batchActions, selectors as batchSelectors } from "../reducers/batch";
import { actions as routesActions } from "../reducers/routes";
import LoaderButton from "../components/loaderButton/LoaderButton";

import "../css/Commons.css";
import "./SetupBatch.css";
import { LinkTable, SubRowAsync } from "../components/linkTable/LinkTable";

function SetupBatch({ dispatch, isLoading, usuario, opcionList, isCustom, batchSelectorIsLoading, message }) {
  const [showAlert, setShowAlert] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const tipoEvaluacionId = "1";

  const columns = useMemo(
    () => [
      {
        Header: () => null,
        id: 'expander',
        Cell: ({ row }) => (
          <span {...row.getToggleRowExpandedProps()}>
            {row.isExpanded ? '-' : '+' }
          </span>
        ),
        SubCell: () => null
      },
      {
        Header: 'Criterio de Priorización',
        accessor: 'criterio',
        id: 'criterio'
      },
      {
        Header: 'Puntaje de la Opción',
        accessor: 'puntos',
        SubCell: (cellProps) => (
          <>
          {cellProps.value - Math.floor(cellProps.value) !== 0 ? cellProps.value : Math.floor(cellProps.value)}
          </>
        )
      },
      {
        Header: 'Peso del Criterio',
        accessor: 'peso_limite',
        Cell: (cellProps) => (
          <>
          {cellProps.value - Math.floor(cellProps.value) !== 0
            ? cellProps.value !== undefined && cellProps.value + '%'
            : Math.floor(cellProps.value) + "%"}
          </>
        )
      },
      {
        Header: isCustom ? 'Editar' : '',
        id: 'editar',
        accessor: 'id',
        Cell: (cellProps) => (
          isCustom ?
          <>
            <button onClick={() => {
              dispatch(routesActions.goTo(`batch/criterio/${cellProps.value}`));
            }}>
              Editar
            </button>
          </>
          : <></>
        ),
        SubCell: (cellProps) => (
          isCustom ?
            String(cellProps.value).startsWith('C') ?
            <>
              <button onClick={() => {
              dispatch(routesActions.goTo(`batch/criterio/${String(cellProps.value.substring(1))}/opcion`));
              }}>
                Agregar
              </button>
            </>
            :
            <>
            <button onClick={() => {
            dispatch(routesActions.goTo(`batch/opcion/${cellProps.value}`));
            }}>
              Editar
            </button>
          </>
          : <></>
        )
      }
    ], [isCustom]
  );

  const data = useMemo(
    () => {
      return opcionList.map((criterio) => {
        if (isCustom == true) {
          const key = "C" + criterio.id;
          const hasDefault = criterio.OpcionCustom.filter(opcion => {
            return opcion.id == key;
          });
          if (hasDefault.length == 0) {
            const defaultItem = { id: key, criterio: "Agregar opción" };
            criterio.OpcionCustom.push(defaultItem);
          }
        }
        return criterio;
      });

    }, [isCustom, opcionList]
  );

  useEffect(() => {
    async function onLoad() {
      try {
        if (usuario !== null) {
          dispatch(batchActions.getBatchStatus(usuario.id));
          dispatch(opcionActions.getOpcionByTipoEvaluacion(tipoEvaluacionId, usuario.id));
        }
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  }, [isCustom]);

  useEffect(() => {
    function validateBatch() {
      if (isLoading) { setShowAlert(false); }
      else {
        if (message !== undefined && message !== null && !firstLoad) {
          setShowAlert(true);
        }
        setFirstLoad(false);
      }
    }

    validateBatch();
  }, [isLoading, message]);

  const renderRowSubComponent = useCallback(
    ({ row, rowProps, visibleColumns }) => (
      <SubRowAsync
        row={row}
        rowProps={rowProps}
        visibleColumns={visibleColumns}
      />
    ), [isCustom]
  );

  function handleEditCriterios() {
    try {
      dispatch(batchActions.startBatchSetup(tipoEvaluacionId, usuario.id));
    } catch (e) {
      onError(e);
    }
  }

  function handleAgregarCriterio() {
    try {
      dispatch(routesActions.goTo(`batch/criterio/`));
    } catch (e) {
      onError(e);
    }  
  }

  function handleFinalizeSetup() {
    try {
      dispatch(batchActions.updateBatchSetup(usuario.id, "1"));
    } catch (e) {
      onError(e);
    }
  }

  return (
    <div className="page-container">
    <hr className="separator" />
    <div className="setup-batch-form">
      <h1 className="orange">Batch - Selección de Criterios</h1>

      <br/>
        {showAlert && 
        <Alert variant="warning" onClose={() => setShowAlert(false)} dismissible> 
          {message}
        </Alert>
        }

      <br />
      {
        !isLoading &&
        <>
        <LinkTable 
          columns={columns}
          data={data}
          renderRowSubComponent={renderRowSubComponent}
        />

        <br />
        <div className="button-group">
          {
            isCustom !== true ?
              <LoaderButton
              isLoading={batchSelectorIsLoading}
              className="btn-primary"
              onClick={handleEditCriterios}
              >
                Editar Criterios
              </LoaderButton>
              :
              <LoaderButton
              className="btn-primary"
              onClick={handleAgregarCriterio}
              >
                Agregar Criterios
              </LoaderButton>

          }
          
          <LoaderButton
            className="btn-success"
            onClick={handleFinalizeSetup}
          >
            Finalizar configuración
          </LoaderButton>
        </div>

        <br /><br />
        </>
      }
    </div>
    </div>
  );
}

const mapStateToProps = state => ({
  opcionList: opcionSelectors.getOpcionList(state),
  opcionSelectorisLoading: opcionSelectors.getIsLoading(state),
  batchSelectorIsLoading: batchSelectors.getIsLoading(state),
  usuario: sessionSelectors.getUser(state),
  isCustom: opcionSelectors.getIsCustom(state),
  message: batchSelectors.getMessage(state),
});

export default connect(mapStateToProps)(SetupBatch);