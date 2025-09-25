/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import LoaderButton from "../components/loaderButton/LoaderButton";
import Form from "react-bootstrap/Form";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { onError } from "../libs/errorLib";
import { connect } from "react-redux";
import { selectors as sessionSelectors } from "../reducers/session";
import { actions as opcionActions, selectors as opcionSelectors } from "../reducers/opcion";
import { actions as evaluacionActions, selectors as evaluacionSelectors } from "../reducers/evaluacion";
import { actions as batchActions, selectors as batchSelectors } from "../reducers/batch";
import { actions as routesActions } from "../reducers/routes";
import { CheckTable, SubRowAsync } from "../components/checkTable/CheckTable";
import "../css/Commons.css";
import "./PriorizacionProyectos.css";

function PriorizacionProyectos({ dispatch, isLoading, usuario, opcionList, success, closedBatch, evaluaciones, errorMessage }) {
  const [numeroProyecto, setNumeroProyecto] = useState("");
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [directorProyecto, setDirectorProyecto] = useState("");
  const [patrocinadorProyecto, setPatrocinadorProyecto] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [informacionBreve, setInformacionBreve] = useState("");
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);
  const [showAlert, setShowAlert]  = useState(false);
  const [messageAlert, setMessageAlert] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);


  const handleCloseConfirm1 = () => setShowConfirm1(false);
  const handleShowConfirm1 = () => setShowConfirm1(true);
  const handleCloseConfirm2 = () => setShowConfirm2(false);
  const handleShowConfirm2 = () => {
    setShowConfirm1(false);
    setShowConfirm2(true);
  }
  const handleCloseAlert = () => {
    setShowAlert(false);
    setMessageAlert("");
  }
  const handleShowAlert = () => setShowAlert(true);

  function validateForm() {
    return nombreProyecto.length > 0        
            && directorProyecto.length > 0 
            && patrocinadorProyecto.length > 0
            && departamento.length > 0 
            && informacionBreve.length > 0
            // && numeroProyecto.length > 0 
  }

  const handleCerrarBatch = () => {
    if (usuario !== undefined && usuario !== null) {
      dispatch(batchActions.closeBatch(usuario.id));
    }
  }

  const handleEvaluarOtro = () => {
    handleCloseConfirm1();
    cleanUpInputs();
  }

  const handleSuspender = () => {
    dispatch(routesActions.goTo("tools"));
  }

  function cleanUpInputs() {
    setNumeroProyecto("");
    setNombreProyecto("");
    setDirectorProyecto("");
    setPatrocinadorProyecto("");
    setDepartamento("");
    setInformacionBreve("");
  }

  const columns = useMemo(
    () => [
      {
        Header: () => null,
        id: 'expander',
        Cell: ({ row }) => (
          <span {...row.getToggleRowExpandedProps()}>
            {row.isExpanded ? '-' : '+'}
          </span>
        ),
        SubCell: () => null,
      },
      {
        Header: 'Criterio de Priorización',
        accessor: 'criterio',
      },
      {
        Header: 'Calificación',
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
          {cellProps.value - Math.floor(cellProps.value) !== 0 ? 
            cellProps.value !== undefined && cellProps.value + '%'
            : Math.floor(cellProps.value) + "%"}
          </>
        )
      },
    ], []
  );


  const data = useMemo(
    () => opcionList, [opcionList]
  );

  const renderRowSubComponent = useCallback(
    ({ row, rowProps, visibleColumns }) => (
      <SubRowAsync 
        row={row}
        rowProps={rowProps}
        visibleColumns={visibleColumns}
      />
    ), []
  );

  function validateCriterios() {
    let hasSelected = false;
    for (let criterioIndex = 0; criterioIndex < data.length && !hasSelected; criterioIndex++) {
      let criterio = data[criterioIndex];
      let opciones = criterio.Opcion !== undefined ? criterio.Opcion : criterio.OpcionCustom;
      for (let opcionIndex = 0; opcionIndex < opciones.length; opcionIndex++) {
        let opcion = opciones[opcionIndex];
        if (opcion !== undefined && opcion.selected === true) {
          hasSelected = true;
          break;
        }
      }
    }

    return hasSelected;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateCriterios()) {
      setMessageAlert("No ha seleccionado ninguna opción de la matriz de criterios");
      handleShowAlert();
      return;
    }
    
    const criterios = data.map(criterio => {
      let opciones = criterio.Opcion !== undefined ? criterio.Opcion : criterio.OpcionCustom;
      opciones = opciones.map(opcion => {
        return {
          id: opcion.id,
          selected: opcion.selected !== undefined ? opcion.selected : false
        };
      });

      return {
        id: criterio.id,
        opciones
      };
    });

    const payload = { 
      numeroProyecto,
      nombreProyecto,
      directorProyecto,
      patrocinadorProyecto,
      departamento,
      informacionBreve,
      opciones: criterios 
    };

    dispatch(evaluacionActions.saveEvaluacion(usuario.id, payload));
  }

  useEffect(() => {
    async function onLoad() {
      try {
        if (usuario !== null) {
          dispatch(batchActions.getBatchStatus(usuario.id));
          dispatch(opcionActions.getOpcionByTipoEvaluacion("1", usuario.id));
        }
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
    return function cleanUp() {
      dispatch(evaluacionActions.init());
    }

  }, []);

  useEffect(() => {
    async function showModal() {
      if (success) {
        handleShowConfirm1();
        dispatch(evaluacionActions.init());
        dispatch(opcionActions.getOpcionByTipoEvaluacion("1", usuario.id));
      } else {
        if (errorMessage != null && !firstLoad) {
          handleShowAlert();
          setMessageAlert(errorMessage);
        }
      }
      setFirstLoad(false);
    }

    showModal();

  }, [success]);

  useEffect(() => {
    function validateBatch() {
      if (closedBatch != null) {
        if (closedBatch) {
          handleCloseConfirm1();
          dispatch(routesActions.goTo("priorization/result"));
        }
      }
    }

    validateBatch();
  }, [closedBatch])

  useEffect(() => {
    function validateEvaluaciones() {
      if (evaluaciones > 0) {
        handleShowConfirm1();
      }
    }

    validateEvaluaciones();
  }, [evaluaciones]);

  return (
    <div className="page-container">
    <hr className="separator" />
    <div className="priorization-form">
      <h1 className="orange">Matriz de Priozación de Proyectos</h1>

      <br />
      <Form className="blue" onSubmit={handleSubmit}>
        {/* <Form.Group controlId="numeroProyecto">
          <Form.Label>Número de Proyecto</Form.Label>
          <Form.Control 
            autoFocus
            autoComplete="off"
            type="text"
            value={numeroProyecto}
            onChange={e => setNumeroProyecto(e.target.value)}
          />
        </Form.Group> */}

        <Form.Group controlId="proyecto">
          <Form.Label>Proyecto</Form.Label>
          <Form.Control 
            autoComplete="off"
            type="text"
            value={nombreProyecto}
            onChange={e => setNombreProyecto(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="directorProyecto">
          <Form.Label>Director del Proyecto</Form.Label>
          <Form.Control 
            autoComplete="off"
            type="text"
            value={directorProyecto}
            onChange={e => setDirectorProyecto(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="patrocinadorProyecto">
          <Form.Label>Patrocinador del Proyecto</Form.Label>
          <Form.Control 
            autoComplete="off"
            type="text"
            value={patrocinadorProyecto}
            onChange={e => setPatrocinadorProyecto(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="departamento">
          <Form.Label>Departamento</Form.Label>
          <Form.Control 
            autoComplete="off"
            type="text"
            value={departamento}
            onChange={e => setDepartamento(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="informacionBreve">
          <Form.Label>Información breve</Form.Label>
          <Form.Control 
            autoComplete="off"
            type="text"
            value={informacionBreve}
            onChange={e => setInformacionBreve(e.target.value)}
          />
        </Form.Group>

        <br />
        {
          !isLoading &&
          <CheckTable 
          columns={columns} 
          data={data} 
          renderRowSubComponent={renderRowSubComponent} />
        }

        <br />
 
        <LoaderButton
        type="submit"
        className="btn-success btn-save"
        disabled={!validateForm()}
      >
        Grabar Calificación
      </LoaderButton>
      </Form>

      <br /><br /><br /><br />
    </div>

    <Modal show={showConfirm1} onHide={handleCloseConfirm1} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title className="modal-font">Goru</Modal.Title>  
      </Modal.Header>

      <Modal.Body>
        ¿Desea evaluar otro proyecto o desea cerrar este batch?
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={handleEvaluarOtro}>
          Evaluar otro proyecto
        </Button>
        <Button variant="secondary" onClick={handleShowConfirm2}>
          Cerrar batch
        </Button>
      </Modal.Footer>

      <Modal.Body>
        O puede suspener la evaluación y retomarla en otro momento
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleSuspender}>
          Suspender
        </Button>
      </Modal.Footer>
    </Modal>

    <Modal show={showConfirm2} onHide={handleCloseConfirm2} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title className="modal-font">Goru</Modal.Title>  
      </Modal.Header>

      <Modal.Body>
        Una vez cerrado el batch no podra evaluar más proyectos. <br/>
        ¿Está seguro de cerrar el batch?
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={handleCloseConfirm2}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={handleCerrarBatch}>
          Cerrar batch
        </Button>
      </Modal.Footer>
    </Modal>

    <Modal show={showAlert} onHide={handleCloseAlert} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title className="modal-font">Goru</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {messageAlert}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseAlert}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
    </div>
  );
}

const mapStateToProps = state => ({
  opcionList: opcionSelectors.getOpcionList(state),
  isLoading: opcionSelectors.getIsLoading(state),
  usuario: sessionSelectors.getUser(state),
  success: evaluacionSelectors.getSuccess(state),
  closedBatch: batchSelectors.getClosed(state),
  evaluaciones: batchSelectors.getEvaluaciones(state),
  errorMessage: evaluacionSelectors.getErrorMessage(state),
});

export default connect(mapStateToProps)(PriorizacionProyectos);
