import { Card, Form, Modal, Button } from 'react-bootstrap';
import './TodoItem.css';
import { CriticalBadgeFromText } from '../badge/Badge';
import { useState } from 'react';
import moment from 'moment';

const TodoItem = ({
    id, title, description, prioridad, interesado, label, done,
    onComplete, dueDate, duedate, onDelete, enableCheck, interesadoId,
    close // 🔹 nuevo prop que viene desde la API
}) => {
    const [doneItem, setDoneItem] = useState(done);
    const [hover, setHover] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [closeDate, setCloseDate] = useState("");

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setCloseDate("");
        setShowModal(false);
    };

    const handleConfirmClose = () => {
        
        const fechaInicio = moment(dueDate || duedate).format("YYYY-MM-DD");

        if (closeDate < fechaInicio) {
            alert("La fecha de cierre no puede ser menor a la fecha de inicio de la tarea.");
            return;
        }
        
        const closedTask = {
            id,
            close: true,
            closeDate
        };
        console.log("✅ Tarea cerrada:", closedTask);

        setDoneItem(true);
        onComplete(id, closeDate);
        setShowModal(false);
    };

    const deleteItem = (id) => {
        onDelete(id);
    };

    return (
        <>
            <Card className="todo-item my-3">
                <div className='m-2 p-2'>
                    <div className='d-inline-flex w-100 align-items-center'>

                        {/* Hover solo controla la papelera */}
                        {/*<div className="m-2"
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            style={{ cursor: "pointer" }}
                        >
                            {enableCheck && (
                                hover ? (
                                    <i
                                        className="bi bi-trash text-danger"
                                        onClick={() => {
                                            const userConfirm = window.confirm("¿Está seguro que quiere eliminar la tarea?");
                                            if (userConfirm) {
                                                deleteItem(id);
                                            }
                                        }}
                                    />
                                ) : (
                                    <i className="bi bi-square text-muted" />
                                )
                            )}
                        </div>*/}

                        {/* Info de la tarea */}
                        <div className='flex-fill px-2'>
                            <div className='title'>{title}</div>
                            <div>{description}</div>
                            <div className='d-inline-flex w-100 lighter'>
                                <div className='flex-fill'>
                                    <i className='bi bi-calendar mr-2'></i>
                                    {moment(dueDate || duedate, 'YYYY-MM-DD').fromNow()}
                                </div>
                                <div className='flex-fill'>
                                    <CriticalBadgeFromText value={prioridad} />
                                </div>
                                <div className='flex-fill'>
                                    {label &&
                                        <div>
                                            <i className='bi bi-tag mr-2' />{label}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        {/* 🔹 Botón cerrar tarea */}
                        {!doneItem && (
                            <Button
                                variant={close ? "secondary" : "outline-success"}
                                size="sm"
                                className="ml-2"
                                onClick={!close ? handleOpenModal : undefined}
                                disabled={close} // 🔹 desactivado si viene cerrada
                            >
                                {close ? "Cerrada" : "Cerrar tarea"}
                            </Button>
                        )}

                        {!enableCheck && (
                            <span
                                className="bi bi-x-lg pull-end"
                                onClick={() => deleteItem(id)}
                            ></span>
                        )}
                    </div>

                    {/* Mostrar responsable */}
                    <div className='flex-fill mt-2'>
                        {interesado ? (
                            <div>
                                <strong>Responsable:</strong> {interesado}
                            </div>
                        ) : (
                            <div>
                                <strong>Responsable:</strong> sin responsable designado
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Modal seleccionar fecha */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Cerrar tarea</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Seleccione la fecha de cierre</Form.Label>
                        <Form.Control
                            type="date"
                            value={closeDate}
                            min={dueDate || duedate ? moment(dueDate || duedate).format("YYYY-MM-DD") : undefined}
                            onChange={(e) => setCloseDate(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirmClose}
                        disabled={!closeDate}
                    >
                        Aceptar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TodoItem;