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
    interesados = [], // <-- recibimos interesados desde Column
    cerrado,
    requestCloseTask,
    ejecutado
}) => {

    // Función para manejar cambio de fecha límite
    const handleDeadlineChange = (e) => {
        if (!task?.id) return;
        editTask({
            ...task, 
            deadline: e.target.value
        });
    };

    const isClosed = !!task?.closed_at;

    const editHandler = cerrado ? () => { } : (id, field) => editTask({ id, content: field });
    const createHandler = cerrado ? () => { } : (field) => createTask({ statusId, content: field });
    
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
        onCreate: createHandler,
        onEdit: editHandler,
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
            style={{
                fontSize: '0.75rem',
                padding: '2px 5px',
                borderColor: isOverdue ? '#dc3545' : '#ced4da',
                color: isOverdue ? '#dc3545' : 'inherit'
            }}
            placeholder="Tarea"
            size="sm"
            as="textarea"
        />
    );

    const formatLocalDate = (dateStr) => {
        if (!dateStr) return "";
        // Dividimos la cadena para evitar que el constructor de Date aplique UTC
        const [year, month, day] = dateStr.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    const renderMenu = () => {
        if (cerrado || !task) return null;
        return (
            <ButtonGroup className={`${cardHovered ? 'visible' : 'invisible'}`} aria-label="actions">
                {/* Botón de Cierre (Solo si es ejecutado y no está cerrada) */}
                {ejecutado && !isClosed && (
                    <Button
                        variant="outline-success"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); requestCloseTask(task); }}
                        title="Cerrar Tarea"
                    >
                        <i className="bi bi-check-circle"></i>
                    </Button>
                )}
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
    };

    const renderTaskContent = ({ dragHandleProps = {} }) => (
        <Card className="kanban-task mt-2 mb-2" {...dragHandleProps}
            onMouseEnter={() => setCardHovered(true)}
            onMouseLeave={() => setCardHovered(false)}
        >
            <Card.Body>
                {(!isEditing && !cerrado) && <div className="float-right">{renderMenu()}</div>}
                <div className="d-flex flex-column">
                    <div className="flex-fill">
                        {isEditing || autoFocus ? renderEditingInput() : <p style={{ userSelect: "none" }}>{task?.content}</p>}
                        {task?.priority && task?.priority !== "none" && <p style={{ marginTop: "8px" }}>{task.priority}</p>}
                    </div>
                    {/* --- Campo Deadline --- */}
                    {task && (
                        <>
                            <div className="mt-2">
                                <small className="text-muted d-block">Fecha de Entrega (Deadline):</small>
                                <Form.Control
                                    type="date"
                                    size="sm"
                                    disabled={cerrado || isClosed}
                                    value={task?.deadline ? task.deadline.split('T')[0] : ""}
                                    onChange={handleDeadlineChange}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ fontSize: '0.75rem', padding: '2px 5px' }}
                                />
                            </div>
                            {/* Info de cierre si existe */}
                            {isClosed && (
                                <div className="mt-1">
                                    <span className="badge badge-success">
                                        Finalizado: {formatLocalDate(task.closed_at)}
                                    </span>
                                </div>
                            )}
                            <br></br>
                            {/* InteresadoDropdown siempre visible */}
                            <InteresadoDropdown interesados={interesados} task={task} editTask={cerrado ? () => { } : editTask} cerrado={cerrado} />
                        </>
                    )}    
                </div>
            </Card.Body>
        </Card>
    );

    const isOverdue = !isClosed && task?.deadline && new Date(task.deadline.split('T')[0] + 'T00:00:00') < new Date().setHours(0, 0, 0, 0);

    return (
        <Draggable draggableId={task?.id || `task-${index}`} index={index} isDragDisabled={!draggable || cerrado}>
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