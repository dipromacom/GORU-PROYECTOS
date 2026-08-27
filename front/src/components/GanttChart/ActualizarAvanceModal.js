import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import moment from "moment";
import "./ActualizarAvanceModal.css";

const ActualizarAvanceModal = ({
    show,
    onHide,
    tasks = [],
    selectedTaskIds = [],
    onApply,
}) => {
    // Alcance: 'all' | 'selected'
    const [alcance, setAlcance] = useState(selectedTaskIds.length > 0 ? "selected" : "all");

    // Fecha de corte / progreso (por defecto hoy en formato YYYY-MM-DD para input date)
    const [fechaActu, setFechaActu] = useState(moment().format("YYYY-MM-DD"));

    // Método de actualización:
    // 1: 'completar' -> Completar hasta la fecha de progreso (calcula % según tiempo transcurrido a la fecha)
    // 2: 'retraso' -> Defina el «Retraso de inicio» o mueva la porción restante a la fecha de progreso
    // 3: 'iniciar_despues' -> Defina el campo «Iniciar después del» o mueva la porción restante a la fecha de progreso
    const [metodo, setMetodo] = useState("completar");

    // Checkbox: Establecer "Fecha actu." como fecha de progreso
    const [establecerFechaProgreso, setEstablecerFechaProgreso] = useState(true);

    useEffect(() => {
        if (show) {
            setAlcance(selectedTaskIds.length > 0 ? "selected" : "all");
            setFechaActu(moment().format("YYYY-MM-DD"));
        }
    }, [show, selectedTaskIds]);

    const handleConfirm = () => {
        if (!fechaActu) {
            alert("Por favor seleccione una fecha válida.");
            return;
        }

        onApply({
            alcance,
            fechaActu,
            metodo,
            establecerFechaProgreso,
            selectedTaskIds,
        });

        onHide();
    };

    const targetTasksCount = alcance === "selected"
        ? (selectedTaskIds.length > 0 ? selectedTaskIds.length : tasks.filter(t => t.type !== "group").length)
        : tasks.filter(t => t.type !== "group").length;

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="actualizar-avance-modal"
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title>Actualizar avance</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* 1. Alcance */}
                <fieldset className="actualizar-avance-fieldset">
                    <legend className="actualizar-avance-legend">Alcance</legend>
                    <div className="actualizar-avance-radio-group">
                        <Form.Check
                            type="radio"
                            id="alcance-todas"
                            name="alcance"
                            label="Todas las tareas"
                            checked={alcance === "all"}
                            onChange={() => setAlcance("all")}
                        />
                        <Form.Check
                            type="radio"
                            id="alcance-seleccionadas"
                            name="alcance"
                            label={`Tareas seleccionadas (${selectedTaskIds.length})`}
                            checked={alcance === "selected"}
                            onChange={() => setAlcance("selected")}
                        />
                    </div>
                </fieldset>

                {/* 2. Fecha actu */}
                <div className="actualizar-avance-date-row">
                    <label htmlFor="fecha-actu-input" className="actualizar-avance-date-label">
                        Fecha actu.:
                    </label>
                    <Form.Control
                        id="fecha-actu-input"
                        type="date"
                        size="sm"
                        className="actualizar-avance-date-input"
                        value={fechaActu}
                        onChange={(e) => setFechaActu(e.target.value)}
                    />
                </div>

                {/* 3. Método de actualización */}
                <fieldset className="actualizar-avance-fieldset">
                    <legend className="actualizar-avance-legend">Método de actualización</legend>
                    <div className="actualizar-avance-radio-col">
                        <Form.Check
                            type="radio"
                            id="metodo-completar"
                            name="metodo"
                            label="Completar hasta la fecha de progreso"
                            checked={metodo === "completar"}
                            onChange={() => setMetodo("completar")}
                        />
                        <Form.Check
                            type="radio"
                            id="metodo-retraso"
                            name="metodo"
                            label="Defina el «Retraso de inicio» o mueva la porción restante a la fecha de progreso"
                            checked={metodo === "retraso"}
                            onChange={() => setMetodo("retraso")}
                        />
                        <Form.Check
                            type="radio"
                            id="metodo-iniciar-despues"
                            name="metodo"
                            label="Defina el campo «Iniciar después del» o mueva la porción restante a la fecha de progreso"
                            checked={metodo === "iniciar_despues"}
                            onChange={() => setMetodo("iniciar_despues")}
                        />
                    </div>
                </fieldset>

                {/* 4. Checkbox Establecer "Fecha actu." como fecha de progreso */}
                <Form.Check
                    type="checkbox"
                    id="chk-establecer-fecha"
                    className="mt-3 text-secondary small fw-semibold"
                    label='Establecer "Fecha actu." como fecha de progreso'
                    checked={establecerFechaProgreso}
                    onChange={(e) => setEstablecerFechaProgreso(e.target.checked)}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" size="sm" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="primary" size="sm" onClick={handleConfirm}>
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ActualizarAvanceModal;
