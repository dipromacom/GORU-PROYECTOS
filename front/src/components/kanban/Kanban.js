import React, { useEffect } from "react";
import { useParams } from 'react-router-dom'

import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { Container, Row, Col } from "react-bootstrap"; // Importing Bootstrap components
import { actions, selectors } from "../../reducers/kanban";
import { connect } from "react-redux";

const Kanban = ({ dispatch, tasksByStatus, interesados }) => {
  const routeParams = useParams();
  
  const moveTask = ({ source, destination, draggableId }) => {
    dispatch(actions.moveTask({ source, destination, draggableId }))
  }
  const createStatus = ({ title }) => {
    dispatch(actions.createStatus(title))
  }
  const deleteStatus = (idStatus) => {
    dispatch(actions.deleteStatus(idStatus))
  }
  const editStatus = ({ idField, title }) => {
    dispatch(actions.editStatus({ idField, title }))
  }
  const createTask = ({ content, priority, statusId, interesadoId }) => {
    dispatch(actions.createTask({ content, priority, statusId, interesadoId }))
  }
  const editTask = ({ id, content, priority, interesadoId }) => {
    dispatch(actions.editTask({ id, content, priority, interesadoId }))
  }

  const deleteTask = ({ id }) => {
    dispatch(actions.deleteTask({ id }))
  }

  useEffect(()=>{
    dispatch(actions.syncKanban({...routeParams,projectId: routeParams.id}))
  },[tasksByStatus])

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
                  deleteTask={deleteTask}
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
    </Container>
  );
}

const mapStateToProps = state => ({
  tasksByStatus: selectors.getTaskByStatus(state)
})

export default connect(mapStateToProps)(Kanban);