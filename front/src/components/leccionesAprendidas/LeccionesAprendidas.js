import React, { useState, useEffect } from "react";
import { Form, Modal, Button } from "react-bootstrap";
import moment from "moment";

const LeccionesAprendidas = ({ data, onSave }) => {
    const [texto, setTexto] = useState("");
    const [fechaCierre, setFechaCierre] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tempFecha, setTempFecha] = useState(moment().format("YYYY-MM-DD"));

    // EFECTO CRUCIAL: Sincroniza el estado local cuando la data llega del servidor
    useEffect(() => {
        if (data) {
            try {
                // Intentamos parsear si es un string JSON
                const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                setTexto(parsed.descripcion || "");
                setFechaCierre(parsed.fechaCierre || null);
            } catch (e) {
                // Si falla el parse (porque es texto plano antiguo), lo manejamos como descripción
                setTexto(data);
                setFechaCierre(null);
            }
        }
    }, [data]); // Se ejecuta cada vez que 'data' cambia (al cargar la página)

    const isLocked = !!fechaCierre;

    const handleSave = () => {
        onSave({
            descripcion: texto,
            fechaCierre: null
        });
    };

    const confirmCierre = () => {
        const finalPayload = {
            descripcion: texto,
            fechaCierre: tempFecha
        };
        onSave(finalPayload);
        setShowModal(false);
    };

    return (
        <div className="lecciones-aprendidas-container">
            <Form.Group controlId="leccionesText">
                <Form.Label className="font-weight-bold" style={{ color: '#0056b3' }}>
                    Descripción de Lecciones Aprendidas
                    {fechaCierre && (
                        <span className="text-danger ml-2">
                            (Cerrado el: {moment(fechaCierre).format('DD/MM/YYYY')})
                        </span>
                    )}
                </Form.Label>
                <Form.Control
                    as="textarea"
                    rows={10}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    disabled={isLocked}
                    placeholder="Escriba aquí las experiencias adquiridas..."
                />
            </Form.Group>

            <div className="d-flex mt-3 pb-5">
                {!isLocked && (
                    <>
                        <Button
                            variant="success"
                            className="mr-3"
                            onClick={handleSave}
                        >
                            Guardar Borrador
                        </Button>
                        <Button
                            variant="outline-danger"
                            onClick={() => setShowModal(true)}
                        >
                            Finalizar y Cerrar Lecciones
                        </Button>
                    </>
                )}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cerrar Lecciones Aprendidas</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Al cerrar, ya no podrá editar el contenido. Ingrese la fecha de cierre:</p>
                    <Form.Control
                        type="date"
                        value={tempFecha}
                        onChange={(e) => setTempFecha(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={confirmCierre}>Confirmar y Bloquear</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default LeccionesAprendidas;