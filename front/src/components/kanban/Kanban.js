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
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToClose, setTaskToClose] = useState(null);
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  const [observacionCierre, setObservacionCierre] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

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
    setObservacionCierre("");
    setShowCloseModal(true);
  };

  const confirmCloseTask = () => {
    if (taskToClose) {
      dispatch(actions.editTask({
        ...taskToClose,
        closed_at: closingDate,
        observacion: observacionCierre || null
      }));

      dispatch(actions.syncKanban({ projectId: routeParams.id }));
    }
    setShowCloseModal(false);
    setTaskToClose(null);
    setObservacionCierre("");
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

  // --- Filtrado por fecha ---
  const filterTasksByDate = (tasks) => {
    if (dateFilter === "all") return tasks;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(t => {
      if (!t) return false;
      if (dateFilter === "overdue") {
        return !t.closed_at && t.deadline && new Date(t.deadline.split('T')[0] + 'T00:00:00') < today;
      }
      if (dateFilter === "today") {
        if (!t.deadline) return false;
        const dl = new Date(t.deadline.split('T')[0] + 'T00:00:00');
        return dl.getTime() === today.getTime();
      }
      if (dateFilter === "week") {
        if (!t.deadline) return false;
        const dl = new Date(t.deadline.split('T')[0] + 'T00:00:00');
        const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
        return dl >= today && dl <= nextWeek;
      }
      if (dateFilter === "open") {
        return !t.closed_at;
      }
      if (dateFilter === "month") {
        if (!t.deadline) return false;
        const dl = new Date(t.deadline.split('T')[0] + 'T00:00:00');
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return dl >= startOfMonth && dl <= endOfMonth;
      }
      return true;
    });
  };

  const filteredTasksByStatus = tasksByStatus.map(status => ({
    ...status,
    tasks: filterTasksByDate(status.tasks)
  }));

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
          <small className="text-muted d-block mt-1">
            Fórmula: Tareas movidas a "Cerrado" a tiempo / Tareas con fecha vencida a hoy
          </small>

        </div>
      )}
      {/* --- Barra de Filtros --- */}
      <div className="px-3 pt-3 pb-1 d-flex align-items-center gap-3 flex-wrap">
        <small className="fw-bold text-muted text-uppercase">Filtrar tareas:</small>
        <select
          className="form-select form-select-sm"
          style={{ maxWidth: '220px' }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">Todas las tareas</option>
          <option value="open">Solo abiertas</option>
          <option value="overdue">Vencidas (en rojo)</option>
          <option value="today">Vence hoy</option>
          <option value="week">Vencen esta semana</option>
          <option value="month">Vencen este mes</option>
        </select>
      </div>
      <Row className="flex-fill mt-3 overflow-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          {filteredTasksByStatus.map((status) => {
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
          <Form.Group className="mt-3">
            <Form.Label>Observación al cerrar (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese una observación sobre el cierre de la tarea..."
              value={observacionCierre}
              onChange={(e) => setObservacionCierre(e.target.value)}
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