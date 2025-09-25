import React, { useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import Task from "./Task";
import {
    Container,
    Button,
    Form,
    Dropdown,
    DropdownButton,
    Row,
    Col,
} from "react-bootstrap";

import AddNewTaskInput from "./AddNewTaskInput";
import useEditField from "./useEditField";

const Column = ({
    column,
    createStatus,
    deleteStatus,
    editStatus,
    createTask,
    deleteTask,
    editTask,
    interesados = []
}) => {
    const tasks = column?.tasks;
    const {
        field: statusTitle,
        isEditing: isEditingGroup,
        setIsEditing: setIsEditingGroup,
        setField: setStatusTitle,
        inputRef,
        handleBlur,
        handleChange,
        onKeyPressed,
    } = useEditField({
        fieldId: column?.id,
        onCreate: (field) => createStatus({ title: field }),
        onEdit: (id, field) => editStatus({ idField: id, title: field }),
    });

    const [isAddingNewTask, setIsAddingNewTask] = useState(false);

    const renderMenu = () => {
        return (
            <DropdownButton
                variant="outline-secondary"
                size="sm"
                id="dropdown-menu-align-right"
            >
                <Dropdown.Item
                    onClick={() => {
                        setIsEditingGroup(true);
                        setStatusTitle(column?.title || "");
                    }}
                >
                    Modificar Estado
                </Dropdown.Item>
                <Dropdown.Item
                    onClick={() => {
                        deleteStatus(column?.id || "")
                    }}
                >Quitar Estado</Dropdown.Item>
            </DropdownButton>
        );
    };

    const renderEditingInput = () => {
        return (
            <Form.Control
                onBlur={handleBlur}
                ref={inputRef}
                value={statusTitle}
                onKeyPress={onKeyPressed}
                onChange={handleChange}
                placeholder="Status name"
            />
        );
    };

    const renderEmptyColumnHeader = () => {
        return (
            <Row className="mb-4 px-2 justify-content-between align-items-center">
                {isEditingGroup ? (
                    renderEditingInput()
                ) : (
                    <Button
                        onClick={() => setIsEditingGroup(true)}
                        size="sm"
                    >
                        <i className="bi bi-plus" />
                        Agregar Estado
                    </Button>
                )}
            </Row>
        );
    };

    const renderHeader = ({ title }) => {
        return (
            <div className="mb-4 d-flex px-2 justify-content-between align-items-center">
                {isEditingGroup ? (
                    renderEditingInput()
                ) : (
                    <h5 className="text-uppercase font-weight-bold">{title}</h5>
                )}
                {renderMenu()}
            </div>
        );
    };

    const renderTaskList = (columnObj) => {
        return (
            <Droppable droppableId={columnObj.id}>
                {({ droppableProps, innerRef, placeholder }) => (
                    <div style={{ minHeight: 200 }} ref={innerRef} {...droppableProps}>
                        {column &&
                            tasks &&
                            tasks.map((task, index) => (
                                <Task
                                    statusId={column.id}
                                    createTask={createTask}
                                    deleteTask={deleteTask}
                                    editTask={editTask}
                                    key={task?.id}
                                    task={task}
                                    index={index}
                                    interesados={interesados}
                                />
                            ))}
                        {column && isAddingNewTask && (
                            <Task
                                statusId={column.id}
                                createTask={(args) => {
                                    createTask(args);
                                    setIsAddingNewTask(false);
                                }}
                                deleteTask={deleteTask}
                                editTask={editTask}
                                draggable={false}
                                autoFocus
                                key={`${column.id}/task-${tasks?.length || 0}`}
                                index={tasks?.length || 0}
                            />
                        )}
                        {placeholder}

                        {column && !isAddingNewTask && (
                            <AddNewTaskInput
                                key={`${column.id}`}
                                onClick={() => setIsAddingNewTask(true)}
                            />
                        )}

                    </div>
                )}
            </Droppable>
        );
    };

    return (
        <Container fluid style={{ minHeight: "60vh", minWidth: 200, padding: "1rem" }}>
            {column ? renderHeader(column) : renderEmptyColumnHeader()}
            {column && tasks && renderTaskList(column)}
        </Container>
    );
};

export default Column;