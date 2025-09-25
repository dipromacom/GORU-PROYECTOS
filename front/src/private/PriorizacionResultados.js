/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";
import LoaderButton from "../components/loaderButton/LoaderButton";
import { onError } from "../libs/errorLib";
import { selectors as sessionSelectors } from "../reducers/session";
import { selectors as evaluacionSelectors, actions as evaluacionActions } from "../reducers/evaluacion";
import { selectors as batchSelectors, actions as batchActions } from "../reducers/batch";
import { selectors as projectSelector, actions as projectActions } from "../reducers/project";
import { actions as routesActions } from "../reducers/routes";

import "../css/Commons.css";
import "./PriorizacionResultados.css";
import { SortTable } from "../components/sortTable/SortTable";

function PriorizacionResultados({ dispatch, isLoading, usuario, evaluacionList, closedBatches, isLoadingBatch, hasActiveBatch, activeBatch }) {

  const tipoEvaluacionId = "1";
  const [selectedBatch, setSelectedBatch] = useState("");

  const columns = useMemo(
    () => [
      {
        Header: 'Proyecto',
        accessor: 'proyecto',
      },
      {
        Header: 'Director de Proyecto',
        accessor: 'director',
      },
      {
        Header: 'Departamento',
        accessor: 'departamento',
      },
      {
        Header: 'Prioridad',
        accessor: 'prioridad',
      },
      {
        Header: 'Accion',
        accessor: 'accion'
      }
    ], []
  );

  function handleIniciarProyecto(event,projectId){
    event.preventDefault()
    dispatch(projectActions.startProject(projectId, true, false))
  }

  const data = useMemo(
    () => {
      return evaluacionList.map(evaluacion => {
        const persona = evaluacion.Proyecto.DirectorProyecto.Persona;
        const departamento = evaluacion.Proyecto.Departamento;
        return {
          proyecto: evaluacion.Proyecto.nombre,
          director: persona.nombre + ' ' + persona.apellido,
          departamento: departamento.nombre,
          prioridad: evaluacion.peso_total + '%',
          accion: evaluacion.Proyecto.estado==='C' || evaluacion.Proyecto.estado === null 
            ? <a href="" data-bs-toggle="tooltip" data-bs-title="Iniciar Proyecto" className="btn btn-lg play" 
                onClick={e => {
                  handleIniciarProyecto(e, evaluacion.Proyecto.id)
                }} /> 
            :<a/> 
        }
      })
    }, [evaluacionList]);

  useEffect(() => {
    async function onLoad() {
      try {
        if (usuario !== null) {
          dispatch(batchActions.userHasActiveBatch(usuario.id));
          dispatch(batchActions.getClosedBatches(usuario.id));
          dispatch(evaluacionActions.getEvaluacionResult(usuario.id, tipoEvaluacionId));
        }
      } catch(e) {
        onError(e);
      }
    }

    onLoad();
  }, []);

  useEffect(() => {
    function setDefaultBatch() {
      if (closedBatches.length) {
        setSelectedBatch(closedBatches[0].id);
      }
    }

    setDefaultBatch();
  }, [closedBatches])

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(routesActions.goTo("batch"));
  }

  const handleSelectBatch = (batchId) => {
    if (batchId !== undefined) {
      setSelectedBatch(batchId);
      dispatch(evaluacionActions.getEvaluacionResultByBatch(usuario.id, tipoEvaluacionId, batchId));
    }
  }

  function handleImprimir(event) {
    event.preventDefault();
    dispatch(routesActions.goTo(`batch/${selectedBatch}/print`));
  }

  function handleContinuar(event) {
    event.preventDefault();
    dispatch(batchActions.getBatchStatus(usuario.id));
  }


  return (
    <div className="page-container">
    <hr className="separator" />
    <div className="priorization-result-form">
      <h1 className="orange">Priorización de Proyectos - Resultados</h1>

    <br />
    <Form onSubmit={handleSubmit}>
      {
        (!isLoadingBatch && closedBatches.length) ?
        <Form.Group controlId="batch">
        <Form.Label>Batch</Form.Label>
        <Form.Control 
          as="select"
          className="form-select"
          value={selectedBatch}
          onChange={ e => handleSelectBatch(e.target.value) }
        >
          {
            closedBatches && closedBatches.map((batch) => {
              return (
                <option
                  key={batch.id}
                  value={batch.id}
                >
                  {batch.nombre}
                </option>
              )
            })
          }
        </Form.Control>
        </Form.Group>
        : <></>
      }

      {
        (!isLoading && data.length > 0)
          ? <SortTable 
              columns={columns}
              data={data}
            /> 
          : <span>
              <p>No hay resultados que mostrar</p>
            </span>
      }

      <br />

      <div className="button-group">
      {
        (!isLoadingBatch && hasActiveBatch != null && hasActiveBatch === false) 
        &&
        <LoaderButton
        type="submit"
        className="btn-success btn-save"
        >
        Crear Batch
        </LoaderButton>
      }

      {
        (!isLoading && data.length > 0) &&
        <LoaderButton
        onClick={handleImprimir}
        className="btn-primary btn-save"
        >
        Imprimir
        </LoaderButton>
      }
      
      </div>

      <br />
      <div>
      {
        (!isLoadingBatch && hasActiveBatch != null && hasActiveBatch === true) 
        &&
        <>
        <p>{`El batch que se encuentra activo es: ${activeBatch != null ? activeBatch.nombre : '' }`}</p>
        <LoaderButton
        className="btn-success btn-save"
        onClick={handleContinuar}
        >
        Continuar Batch
        </LoaderButton>
        </>
      }
      </div>

    </Form>
    </div>
    </div>
  );
}

const mapStateToProps = state => ({
  evaluacionList: evaluacionSelectors.getEvaluacionList(state),
  isLoading: evaluacionSelectors.getIsLoading(state),
  usuario: sessionSelectors.getUser(state),
  closedBatches: batchSelectors.getClosedBatches(state),
  isLoadingBatch: batchSelectors.getIsLoading(state),
  hasActiveBatch: batchSelectors.getHasActiveBatch(state),
  activeBatch: batchSelectors.getActiveBatch(state),
});

export default connect(mapStateToProps)(PriorizacionResultados);