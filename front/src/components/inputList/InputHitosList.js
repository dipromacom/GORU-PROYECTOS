import React from "react";
import { Form } from "react-bootstrap";
import InputTextListWithDate from "../inputList/InputTexListWithDate";
import InputHitosEjecutado from "./InputHitosEjecutado";

const InputHitosList = ({
    tiempoDuracion,
    setTiempoDuracion,
    tiempoFechasCriticas,
    setTiempoFechasCriticas,
    editMode,
    showDuration,
    ejecutado,
    onSummaryChange

}) => {

    const transformedFechasCriticas = React.useMemo(() => {
        if (ejecutado && tiempoFechasCriticas && tiempoFechasCriticas.length > 0) {
            // Comprobamos si el primer elemento es el formato antiguo (solo date/description)
            if (!tiempoFechasCriticas[0].hasOwnProperty('completado')) {
                return tiempoFechasCriticas.map(item => ({
                    ...item,
                    completado: false // Inicializa como no completado
                }));
            }
        }
        return tiempoFechasCriticas;
    }, [tiempoFechasCriticas, ejecutado]);

    return (
        <div>
            <h3>Tiempo / Plazo</h3>
            <Form.Group controlId="plazoProyecto">
                <Form.Label>Duración de Proyecto: {showDuration(tiempoDuracion)}</Form.Label>
                <Form.Control
                    disabled={!editMode}
                    autoFocus
                    autoComplete="off"
                    type="range"
                    value={tiempoDuracion}
                    onChange={e => setTiempoDuracion(e.target.value)}
                    min={1}
                    max={365 * 5}
                />
            </Form.Group>

            <Form.Group controlId="fechas-criticas">
                <Form.Label>Fechas Críticas</Form.Label>

                {ejecutado && tiempoFechasCriticas?.length > 0 ? (
                    // 🌟 MODO EJECUTADO
                    <InputHitosEjecutado
                        tiempoFechasCriticas={transformedFechasCriticas}
                        setTiempoFechasCriticas={setTiempoFechasCriticas}
                        editMode={editMode}
                        ejecutado={ejecutado}
                        onSummaryChange={onSummaryChange}

                    />
                ) : (
                    // 📝 MODO CREACIÓN/EDICIÓN (Formato simple)
                    <InputTextListWithDate
                        disabled={!editMode}
                        list={tiempoFechasCriticas}
                        setList={setTiempoFechasCriticas}
                        duration={tiempoDuracion}
                    />
                )}
            </Form.Group>
        </div>
    );
};

export default InputHitosList;