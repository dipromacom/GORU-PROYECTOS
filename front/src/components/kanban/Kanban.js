import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom'

import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { Container, Row, Col, Modal, Button, ProgressBar } from "react-bootstrap"; // Importing Bootstrap components
import { actions, selectors } from "../../reducers/kanban";
import { connect } from "react-redux";

import Form from "react-bootstrap/Form";

const Kanban = ({ dispatch, tasksByStatus, interesados, cerrado, ejecutado, onPerformanceChange = () => { } }) => {
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
    today.setHours(0, 0, 0, 0);

    // EV (Valor Ganado): Tareas cerradas a tiempo o antes
    const successfulTasks = allTasks.filter(t => {
      if (!t.closed_at) return false;
      const closedAt = new Date(t.closed_at.split('T')[0] + 'T00:00:00');
      const deadline = t.deadline ? new Date(t.deadline.split('T')[0] + 'T00:00:00') : null;

      // Si no tiene deadline pero se cerró, cuenta como éxito. 
      // Si tiene deadline, debe ser menor o igual.
      return !deadline || closedAt <= deadline;
    }).length;

    // PV (Valor Planeado): Tareas que ya deberían estar listas a hoy
    const shouldBeDone = allTasks.filter(t => {
      if (!t.deadline) return false;
      const deadline = new Date(t.deadline.split('T')[0] + 'T00:00:00');
      return deadline <= today;
    }).length;

    // --- LÓGICA DE CÁLCULO SPI ---
    if (shouldBeDone === 0) {
      // Si no vencía nada hoy pero ya terminaste tareas: 2.00
      // Si no vencía nada y no has hecho nada: 1.00
      return successfulTasks > 0 ? 2.00 : 1.00;
    }

    const spi = successfulTasks / shouldBeDone;
    return Number(Math.min(spi, 2.00).toFixed(2));
  };

  const efficiency = calculateEfficiency();

  // 2. Efecto para reportar el valor al padre (ProyectoDetail)
  useEffect(() => {
    if (ejecutado || cerrado) {
      onPerformanceChange('eficiencia', efficiency);
    }
  }, [efficiency, ejecutado, cerrado, onPerformanceChange]);

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
        <div className="mt-4 px-3" >
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="fw-bold text-muted text-uppercase">
              Índice de Desempeño (Kanban)
            </small>
            <span
              className={`fw-bold text-${efficiency >= 1 ? "success" : efficiency >= 0.6 ? "warning" : "danger"}`}
              style={{ fontSize: '1.2rem' }}
            >
              {efficiency.toFixed(2)}
            </span>
          </div>
          <ProgressBar
            now={Math.min((efficiency / 1) * 100, 100)} // Se llena al 100% si llega a 1.0
            variant={efficiency >= 1 ? "success" : efficiency >= 0.6 ? "warning" : "danger"}
            style={{ height: '20px', borderRadius: '5px' }}
            className="shadow-sm"
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