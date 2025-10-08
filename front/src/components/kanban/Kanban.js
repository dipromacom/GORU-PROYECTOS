import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom'

import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { Container, Row, Col, Modal, Button } from "react-bootstrap"; // Importing Bootstrap components
import { actions, selectors } from "../../reducers/kanban";
import { connect } from "react-redux";

const Kanban = ({ dispatch, tasksByStatus, interesados }) => {
  console.log(interesados);
  const routeParams = useParams();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
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
  const editTask = ({ id, content, priority, interesadoId }) => {
    dispatch(actions.editTask({ id, content, priority, interesadoId }))
    dispatch(actions.syncKanban({ projectId: routeParams.id }))
  }

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
      <Row className="flex-fill mt-3 overflow-auto">
        <DragDropContext onDragEnd={moveTask}>
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
                />
              </Col>
            );
          })}
          <Col key="new-column" className="p-2">
            <Column
              createStatus={createStatus}
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
    </Container>
  );
}

const mapStateToProps = state => ({
  tasksByStatus: selectors.getTaskByStatus(state)
})

export default connect(mapStateToProps)(Kanban);