import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom'

import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { Container, Row, Col, Modal, Button, ProgressBar } from "react-bootstrap"; // Importing Bootstrap components
import { actions, selectors } from "../../reducers/kanban";
import { connect } from "react-redux";

import Form from "react-bootstrap/Form";

const Kanban = ({ dispatch, tasksByStatus, interesados, cerrado, ejecutado, onSummaryChange = () => { } }) => {
  const routeParams = useParams();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false); // Nuevo modal cierre
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToClose, setTaskToClose] = useState(null); // Tarea a cerrar
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  
  const moveTask = ({ source, destination, draggableId }) => {
    dispatch(actions.moveTask({ source, destination, draggableId }))
    dispatch(actions.syncKanban({ projectId: routeParams.id }))
  }
  const createStatus = ({ title }) => {
    dispatch(actions.createStatus(title))
    dispatch(actions.syncKanban({ projectId: routeParams.id }))
  }
  const deleteStatus = (idStatus) => {
    dispatch(actions.deleteStatus(idStatus))
    dispatch(actions.syncKanban({ projectId: routeParams.id }))
  }
  const editStatus = ({ idField, title }) => {
    dispatch(actions.editStatus({ idField, title }))
    dispatch(actions.syncKanban({ projectId: routeParams.id }))
  }
  const createTask = ({ content, priority, statusId, interesadoId }) => {
    dispatch(actions.createTask({ content, priority, statusId, interesadoId }))
    dispatch(actions.syncKanban({ projectId: routeParams.id }))
  }
  const editTask = (params) => {
    dispatch(actions.editTask(params));
    dispatch(actions.syncKanban({ projectId: routeParams.id }));
  };

  // --- Lógica de Eficiencia ---
  const calculateEfficiency = () => {
    const allTasks = tasksByStatus.flatMap(s => s.tasks).filter(t => !!t);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar hoy para comparar

    // Consideramos tareas relevantes: las que tienen deadline O ya están cerradas
    const relevantTasks = allTasks.filter(t => t.deadline || t.closed_at);

    if (relevantTasks.length === 0) return 0;

    let successfulTasks = 0;
    let failedTasks = 0;

    relevantTasks.forEach(t => {
      const deadline = t.deadline ? new Date(t.deadline.split('T')[0] + 'T00:00:00') : null;
      const closedAt = t.closed_at ? new Date(t.closed_at.split('T')[0] + 'T00:00:00') : null;

      if (closedAt) {
        // Caso 1: Está cerrada. ¿Fue a tiempo?
        if (!deadline || closedAt <= deadline) {
          successfulTasks++;
        } else {
          // Se cerró pero tarde (según tu punto 3)
          failedTasks++;
        }
      } else if (deadline && deadline < today) {
        // Caso 2: No está cerrada y el plazo ya venció
        failedTasks++;
      }
    });

    const totalEvaluated = successfulTasks + failedTasks;
    if (totalEvaluated === 0) return 0;

    return Number((successfulTasks / totalEvaluated).toFixed(2));
  };

  const efficiency = calculateEfficiency();

  // 2. Efecto para reportar el valor al padre (ProyectoDetail)
  useEffect(() => {
    if (ejecutado || cerrado) {
      onSummaryChange('eficiencia', efficiency);
    }
  }, [efficiency, ejecutado, cerrado, onSummaryChange]);

  // --- Funciones de Cierre ---
  const requestCloseTask = (task) => {
    setTaskToClose(task);
    setShowCloseModal(true);
  };

  const confirmCloseTask = () => {
    if (taskToClose) {
      dispatch(actions.editTask({
        ...taskToClose,
        closed_at: closingDate
      }));

      dispatch(actions.syncKanban({ projectId: routeParams.id }));
    }
    setShowCloseModal(false);
    setTaskToClose(null);
  };

  const requestDeleteTask = ({ id }) => {
    setTaskToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteTask = () => {
      if (taskToDelete) {
          dispatch(actions.deleteTask({ id: taskToDelete }));
          dispatch(actions.syncKanban({ projectId: routeParams.id }));
        }
      setShowDeleteModal(false);
      setTaskToDelete(null);
  };

  const handleDragEnd = (result) => {
    if (cerrado) return; // 👈 Evita cualquier acción de arrastre si está cerrado
    moveTask(result);
  }

  /*const deleteTask = ({ id }) => {
    dispatch(actions.deleteTask({ id }))
    dispatch(actions.syncKanban({ projectId: routeParams.id }))
  }*/

  /*useEffect(()=>{
    dispatch(actions.syncKanban({...routeParams,projectId: routeParams.id}))
  },[tasksByStatus])*/

  useEffect(() => {
    dispatch(actions.fetch({ projectId: routeParams.id }));
  }, [dispatch, routeParams.id]);

  return (
    <Container fluid className="h-100 d-flex flex-column kanban">
      {/* --- Barra de Eficiencia --- */}
      {(ejecutado || cerrado) && (
        <div className="mt-3 px-3">
          <small className="font-weight-bold">ÍNDICE DE EFICIENCIA (KANBAN)</small>
          <ProgressBar
            now={efficiency * 100}
            label={`${efficiency.toFixed(2)}`}
            variant={efficiency >= 1 ? "success" : efficiency >= 0.6 ? "warning" : "danger"}
            className="mt-1"
            style={{ height: '20px' }}
          />
        </div>
      )}
      <Row className="flex-fill mt-3 overflow-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          {tasksByStatus.map((status) => {
            const column = status;
            return (
              <Col key={column.id} clasNamesName="p-2">
                <Column
                  column={column}
                  createStatus={createStatus}
                  deleteStatus={deleteStatus}
                  editStatus={editStatus}
                  createTask={createTask}
                  editTask={editTask}
                  //deleteTask={deleteTask}
                  deleteTask={requestDeleteTask}
                  interesados={interesados}
                  cerrado={cerrado}
                  requestCloseTask={requestCloseTask}
                  ejecutado={ejecutado}
                />
              </Col>
            );
          })}
          <Col key="new-column" className="p-2">
            <Column
              createStatus={createStatus}
              cerrado={cerrado}
            />
          </Col>
        </DragDropContext>
      </Row>

      {/* Modal de confirmación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
              <Modal.Title>Confirmar eliminación</Modal.Title>
            </Modal.Header>
          <Modal.Body>
              ¿Está seguro que desea borrar esta tarea?
            </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </Button>
              <Button variant="danger" onClick={confirmDeleteTask}>
                  Borrar
                </Button>
            </Modal.Footer>
        </Modal>
      {/* --- Modal de Cierre de Tarea --- */}    
      <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cerrar Tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Está seguro que desea cerrar la tarea: <strong>{taskToClose?.content}</strong>?</p>
          <Form.Group>
            <Form.Label>Fecha de finalización real:</Form.Label>
            <Form.Control
              type="date"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCloseModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={confirmCloseTask}>Confirmar Cierre</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

const mapStateToProps = state => ({
  tasksByStatus: selectors.getTaskByStatus(state)
})

export default connect(mapStateToProps)(Kanban);