/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import TodoListForm from "./TodoListForm";
import TodoItem from "./TodoItem";
import './TodoList.css'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ProgressBar, Row, Col } from "react-bootstrap";
import moment from "moment";

const TodoList = ({ toDo = [], persona, usuario, setToDos, enableCheck = true, setTaskFilter, addTaskCallback, markAsDoneCallback, interesado, ejecutado, cerrado, onPerformanceChange = () => { } }) => {
    const [labels, setLabels] = useState([])

    const markAsDone = (id, closeDate, observacion) => {
        if (typeof markAsDoneCallback === 'function') {
            markAsDoneCallback(id, closeDate, observacion);
        } else if (typeof setToDos === 'function') {
            setToDos(prev => (prev || []).map(todo => {
                if (!todo) return todo;
                if (todo.id === id) {
                    return { ...todo, done: true, closeDate };
                }
                return todo;
            }));
        }
    }

    const deleteItemHandler = (id) => {
        if (typeof setToDos === 'function') {
            setToDos(prev => (prev || []).filter((item) => item?.id !== id));
        }
    };

    const performanceData = useMemo(() => {
        const hoy = moment().startOf('day');
        const tareas = toDo || [];

        if (tareas.length === 0) return 1.00;

        // 1. PV (Valor Planeado): Tareas que ya deberían estar listas a hoy
        const tareasQueDebianEstarListas = tareas.filter(t => {
            const fechaLimite = moment(t.dueDate || t.duedate).startOf('day');
            return fechaLimite.isSameOrBefore(hoy);
        }).length;

        // 2. EV (Valor Ganado): Tareas cerradas A TIEMPO
        const tareasCerradasATiempo = tareas.filter(t => {
            if (!t.done || !t.closeDate) return false;

            const fechaLimite = moment(t.dueDate || t.duedate).startOf('day');
            const fechaCierre = moment(t.closeDate).startOf('day');

            // Solo cuenta si se cerró antes o el mismo día del deadline
            return fechaCierre.isSameOrBefore(fechaLimite);
        }).length;

        // 3. Cálculo del Índice (Máximo 2.00)
        if (tareasQueDebianEstarListas === 0) {
            return tareasCerradasATiempo > 0 ? 2.00 : 1.00;
        }

        const spi = tareasCerradasATiempo / tareasQueDebianEstarListas;
        return Math.min(spi, 2.00);
    }, [toDo]);

    // Notificar el cambio de desempeño al componente padre (ProyectoDetail)
    useEffect(() => {
        if (ejecutado || cerrado) {
            onPerformanceChange('todo', performanceData);
        }
    }, [performanceData, ejecutado, cerrado]);

    return (
        <div className="todo-list mb-5">
            {!cerrado && (
                <TodoListForm
                    setToDos={setToDos}
                    persona={persona}
                    labels={labels}
                    setLabels={setLabels}
                    addTaskCallback={addTaskCallback}
                    interesado={interesado}
                />
            )}
            {/* BARRA DE DESEMPEÑO ESTILO HITOS/COSTOS */}
            {(ejecutado || cerrado) && (
                <div className="my-4">
                    <div className="d-flex justify-content-between small fw-bold mb-1 text-uppercase">
                        <span className="text-dark">
                            <i className="fas fa-tasks mr-2 text-primary"></i>
                            Desempeño de Tareas (SPI):
                        </span>
                        <span className={performanceData >= 1 ? "text-success" : "text-danger"}>
                            {performanceData.toFixed(2)}
                        </span>
                    </div>
                    <ProgressBar
                        now={performanceData * 100}
                        variant={performanceData >= 1 ? "success" : "warning"}
                        style={{ height: '20px', borderRadius: '5px' }}
                    />
                    <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
                        {performanceData >= 1
                            ? "Eficiencia óptima: Tareas al día o adelantadas."
                            : "Retraso detectado: Hay tareas cerradas fuera de fecha o pendientes vencidas."}
                    </div>
                    <small className="text-muted d-block" style={{ fontSize: '10px' }}>
                        Fórmula SPI: Tareas completadas a tiempo / Tareas que debían completarse hoy
                    </small>
                </div>
            )}
            {toDo && toDo.length > 0 ? (
                <div className="mt-3">
                    <h2>Tareas</h2>
                    <ul className="pl-0" style={{ listStyleType: 'none' }}>
                        {toDo.map((item) => (
                            <li key={item.id}>
                                {/* quitamos la clase dismissed desde aquí */}
                                <TodoItem
                                    enableCheck={enableCheck}
                                    {...item}
                                    onComplete={(id, closeDate, observacion) => markAsDone(id, closeDate, observacion)}
                                    onDelete={id => deleteItemHandler(id)}
                                    forceVisible // 🔹 nueva prop para evitar estilos raros
                                    cerrado={cerrado}
                                    setTaskFilter={setTaskFilter}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="pt-3 text-center">
                    <h2 className="mb-2">
                        <DotLottieReact
                            loop
                            autoplay
                            style={{ width: "300px", height: "300px", margin: "auto" }}
                            src="https://lottie.host/27602164-6ebf-41b6-b99a-fe19dd171d77/qcF7qMxLIS.json"
                        />
                        <br />
                        No hay tareas
                    </h2>
                </div>
            )}
        </div>
    )
}

export default TodoList
