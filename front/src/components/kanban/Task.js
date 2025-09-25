import React, { useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Button, Form, Card, ButtonGroup } from "react-bootstrap";
import useEditField from "./useEditField";
import InteresadoDropdown from "./InteresadoDropdown";
import './Task.css'

const Task = ({
    statusId,
    task,
    index,
    draggable = true,
    autoFocus = false,
    createTask,
    deleteTask,
    editTask,
    interesados = [] // <-- recibimos interesados desde Column
}) => {
    const {
        field,
        isEditing,
        setIsEditing,
        setField,
        inputRef,
        handleBlur,
        handleChange,
        onKeyPressed,
    } = useEditField({
        autoFocus,
        fieldId: task?.id,
        onCreate: (field) => createTask({ statusId, content: field }),
        onEdit: (id, field) => editTask({ id, content: field }),
    });

    const [actionHovered, setActionHovered] = useState(false);
    const [cardHovered, setCardHovered] = useState(false);

    useEffect(() => {
        if (autoFocus && inputRef?.current) inputRef.current.focus();
    }, [autoFocus, inputRef]);

    const renderEditingInput = () => (
        <Form.Control
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
            ref={inputRef}
            value={field}
            onKeyPress={onKeyPressed}
            onChange={handleChange}
            placeholder="Tarea"
            size="sm"
            as="textarea"
        />
    );

    const renderMenu = () => (
        <ButtonGroup className={`${cardHovered ? 'visible' : 'invisible'}`} aria-label="actions">
            <Button
                className={`edit ${actionHovered === 'edit' ? 'bg-warning' : ''}`}
                variant="outline-secondary"
                size="sm"
                onMouseEnter={() => setActionHovered('edit')}
                onMouseLeave={() => setActionHovered(null)}
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); setField(task?.content || ""); }}
            >
                <i className="bi bi-pencil-square"></i>
            </Button>
            <Button
                className={`delete ${actionHovered === 'delete' ? 'bg-danger' : ''}`}
                variant="outline-secondary"
                size="sm"
                onMouseEnter={() => setActionHovered('delete')}
                onMouseLeave={() => setActionHovered(null)}
                onClick={() => deleteTask({ id: task.id })}
            >
                <i className="bi bi-trash"></i>
            </Button>
        </ButtonGroup>
    );

    const renderTaskContent = ({ dragHandleProps = {} }) => (
        <Card className="kanban-task mt-2 mb-2" {...dragHandleProps}
            onMouseEnter={() => setCardHovered(true)}
            onMouseLeave={() => setCardHovered(false)}
        >
            <Card.Body>
                {isEditing || <div className="float-right">{renderMenu()}</div>}
                <div className="d-flex flex-column">
                    <div className="flex-fill">
                        {isEditing || autoFocus ? renderEditingInput() : <p style={{ userSelect: "none" }}>{task?.content}</p>}
                        {task?.priority && task?.priority !== "none" && <p style={{ marginTop: "8px" }}>{task.priority}</p>}
                    </div>
                    {/* InteresadoDropdown siempre visible */}
                    <InteresadoDropdown interesados={interesados} task={task} editTask={editTask} />
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <Draggable draggableId={task?.id || `task-${index}`} index={index} isDragDisabled={!draggable}>
            {({ draggableProps, dragHandleProps, innerRef }) => (
                <div
                    style={{
                        backgroundColor: "white",
                        marginBottom: "8px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        borderRadius: "4px",
                    }}
                    {...draggableProps}
                    ref={innerRef}
                >
                    {renderTaskContent({ dragHandleProps })}
                </div>
            )}
        </Draggable>
    );
};

export default React.memo(Task);