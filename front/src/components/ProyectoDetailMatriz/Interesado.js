import { Button } from 'react-bootstrap';
import { Modal, Table, Form } from 'react-bootstrap';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useParams } from 'react-router-dom';
import TodoItem from '../todoList/TodoItem'
import { actions, selectors } from "../../reducers/project";
import './Interesado.css';

export const Interesado = ({ props, setToDos, Interesadoid, tareas, toDo, enableCheck = true, markAsDoneCallback }) => {
    const dispatch = useDispatch();
    const interesados = useSelector(state => state.project.interesados);

    const [doneTasks, setDoneTasks] = useState([]);
    const [undoneTasks, setUndoneTasks] = useState([]);

    const [isEditable, setIsEditable] = useState(false);
    const [errorFechas, setErrorFechas] = useState('');
    const [descripcionFechaNoDisponibilidad, setDescripcionFechaNoDisponibilidad] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const [idInteresado, setIdInteresado] = useState('');
    const [interesado, setInteresado] = useState('');
    const [rol, setRol] = useState('');
    const [cargo, setCargo] = useState('');
    const [companiaClasificacion, setCompaniaClasificacion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [otrosDatosContacto, setOtrosDatosContacto] = useState('');
    const [expectativasProyecto, setExpectativasProyecto] = useState('');
    const [fechasNoDisponibilidad, setFechasNoDisponibilidad] = useState([]);

    const [idEvaluacion, setIdEvaluacion] = useState('');
    const [compromiso, setCompromiso] = useState('');
    const [poder, setPoder] = useState('');
    const [influencia, setInfluencia] = useState('');
    const [conocimiento, setConocimiento] = useState('');
    const [interesActitud, setInteresActitud] = useState('');
    const [valoracion, setValoracion] = useState('');

    const [originalData, setOriginalData] = useState(null);

    // Cargar interesados al montar el componente
    useEffect(() => {
        if (Interesadoid) {
            dispatch(actions.getInteresadosRequest(Interesadoid));
        }
    }, [dispatch, Interesadoid]);

    // Actualizar tareas filtradas
    useEffect(() => {
        if (!toDo || toDo.length === 0) return;

        const filteredTasks = toDo.filter(task => task.id_interesado === Number(Interesadoid));
        setDoneTasks(filteredTasks.filter(task => task.done));
        setUndoneTasks(filteredTasks.filter(task => !task.done));
    }, [toDo, Interesadoid]);

    // Cargar datos cuando cambia `interesados`
    useEffect(() => {
        if (!interesados) return;

        setIdInteresado(interesados.codigo || '');
        setInteresado(interesados.nombre_interesado || '');
        setRol(interesados.rol || '');
        setCargo(interesados.cargo || '');
        setCompaniaClasificacion(interesados.compania_clasificacion || '');
        setTelefono(interesados.telefono || '');
        setEmail(interesados.email || '');
        setOtrosDatosContacto(interesados.otros_datos_contacto || '');
        setExpectativasProyecto(interesados.expectativas || '');
        setFechasNoDisponibilidad(interesados.NoDisponibilidad || []);
        setCompromiso(interesados?.EvaluacionInteresado?.[0]?.compromiso || '');
        setIdEvaluacion(interesados?.EvaluacionInteresado?.[0]?.id || '');
        setPoder(interesados?.EvaluacionInteresado?.[0]?.poder || '');
        setInfluencia(interesados?.EvaluacionInteresado?.[0]?.influencia || '');
        setConocimiento(interesados?.EvaluacionInteresado?.[0]?.conocimiento || '');
        setInteresActitud(interesados?.EvaluacionInteresado?.[0]?.interesActitud || '');
        setValoracion(interesados?.EvaluacionInteresado?.[0]?.valoracion || '');
        // console.log('Fechas de No Disponibilidad:', interesados.NoDisponibilidad);

        setOriginalData({
            interesado: interesados.nombre_interesado,
            rol: interesados.rol,
            cargo: interesados.cargo,
            companiaClasificacion: interesados.compania_clasificacion,
            telefono: interesados.telefono,
            email: interesados.email,
            otrosDatosContacto: interesados.otros_datos_contacto,
            expectativasProyecto: interesados.expectativas,
            fechasNoDisponibilidad: interesados.NoDisponibilidad || [],
            compromiso: interesados.EvaluacionInteresado?.[0]?.compromiso,
            poder: interesados.EvaluacionInteresado?.[0]?.poder,
            influencia: interesados.EvaluacionInteresado?.[0]?.influencia,
            conocimiento: interesados.EvaluacionInteresado?.[0]?.conocimiento,
            interesActitud: interesados.EvaluacionInteresado?.[0]?.interesActitud,
            valoracion: interesados.EvaluacionInteresado?.[0]?.valoracion

            
        });
    }, [interesados]);

    // Calcular valoración
    useEffect(() => {
        const total = (parseInt(compromiso) || 0) +
            (parseInt(poder) || 0) +
            (parseInt(influencia) || 0) +
            (parseInt(conocimiento) || 0);
        const interes = parseInt(interesActitud) || 0;
        setValoracion(total * interes);
    }, [compromiso, poder, influencia, conocimiento, interesActitud]);

    const markAsDone = id => {
        if (markAsDoneCallback) {
            markAsDoneCallback(id);
        } else if (toDo && setToDos) {
            setToDos(toDo.map(todo =>
                todo.id === id ? { ...todo, done: true } : todo
            ));
        }
    };

    const validarYAgregarFecha = () => {
        const fechaInicioObj = new Date(fechaInicio);
        const fechaFinObj = new Date(fechaFin);

        // Cálculo de días totales
        const diasTotales = Math.ceil((fechaFinObj - fechaInicioObj) / (1000 * 60 * 60 * 24)) + 1;

        if (!descripcionFechaNoDisponibilidad || !fechaInicio || !fechaFin) {
            setErrorFechas('Todos los campos son obligatorios.');
            return;
        }

        const newFecha = {
            descripcionFechaNoDisponibilidad,
            fechaInicio,
            fechaFin,
            diasTotales,  // Asegúrate de que esto esté incluido
            motivo: descripcionFechaNoDisponibilidad,  // O el valor que deseas para el motivo
        };
        
        // console.log(diasTotales);

        setFechasNoDisponibilidad([...fechasNoDisponibilidad, newFecha]);
        setDescripcionFechaNoDisponibilidad('');
        setFechaInicio('');
        setFechaFin('');
        setErrorFechas('');
    };


    const removeFechaNoDisponibilidad = index => {
        setFechasNoDisponibilidad(fechasNoDisponibilidad.filter((_, i) => i !== index));
    };

    const calculateTotalDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    };

    const toggleEditMode = () => {
        setIsEditable(!isEditable);
    };

    const handleSave = () => {
        if (!hasChanges()) {
             alert("No hay cambios para guardar.");
            return;
        }
        console.log(props);
        const updatedData = {
            id_interesado: Number(idInteresado),
            proyecto_id: interesados.proyecto_id, // 🔹 asegúrate que lo recibes del padre
            nombre_interesado: interesado,
            telefono,
            email,
            otrosDatos: otrosDatosContacto,
            codigo: idInteresado,
            rol,
            id_interesados: Interesadoid,
            cargo,
            companiaClasificacion,
            expectativasProyecto,
            fechasNoDisponibilidad,
            evaluacion: {
                id: idEvaluacion,
                compromiso,
                poder,
                influencia,
                conocimiento,
                interesActitud,
                valoracion
            },
            accionEstrategica: "",
            responsableEstrategia: ""
        };
        dispatch(actions.updateInterested(updatedData));
        setTimeout(() => {
            window.location.reload(); // Recarga la página después de 1 segundo
        }, 300);
        toggleEditMode();
    };

    const hasChanges = () => {
        if (!originalData) return false;
        return (
            interesado !== originalData.interesado ||
            rol !== originalData.rol ||
            cargo !== originalData.cargo ||
            companiaClasificacion !== originalData.companiaClasificacion ||
            telefono !== originalData.telefono ||
            email !== originalData.email ||
            !arraysAreEqual(fechasNoDisponibilidad, originalData.fechasNoDisponibilidad)
        );
    };

    const arraysAreEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((item, index) =>
            item.descripcionFechaNoDisponibilidad === arr2[index]?.descripcionFechaNoDisponibilidad &&
            item.fechaInicio === arr2[index]?.fechaInicio &&
            item.fechaFin === arr2[index]?.fechaFin
        );
    };


    return (
        <Form className="blue">

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Detalle del Interesado</h4>
                {!isEditable ? (
                    <Button variant="warning" onClick={toggleEditMode}>
                        Editar
                    </Button>
                ) : (
                    <div>
                        <Button variant="secondary" onClick={toggleEditMode} className="mr-2">Cancelar</Button>
                        <Button variant="success" onClick={handleSave}>Guardar</Button>
                    </div>
                )}
            </div>

            <div className="row">
                
                <div className="col-md-2">
                    <Form.Group controlId="idInteresado">
                        <Form.Label>ID</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="ID"
                            value={idInteresado ? `00${idInteresado.replace(/^0+/, '')}` : ''} // Formateamos correctamente
                            onChange={e => {
                                let valor = e.target.value.replace(/^0+/, ''); // Eliminamos ceros iniciales
                                setIdInteresado(valor); // Guardamos solo el número sin "00"
                            }}
                            readOnly={!isEditable}
                        />
                    </Form.Group>

                </div>
                
                <div className="col-md-4">
                    <Form.Group controlId="interesado">
                        <Form.Label>Interesado</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nombre del interesado"
                            value={interesado}
                            onChange={e => setInteresado(e.target.value)}
                            readOnly={!isEditable}
                            required
                        />
                    </Form.Group>
                </div>
                <div className="col-md-2">
                    <Form.Group controlId="rol">
                        <Form.Label>Rol</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Rol"
                            value={rol}
                            onChange={e => setRol(e.target.value)}
                            readOnly={!isEditable}
                            required
                        />
                    </Form.Group>
                </div>
                <div className="col-md-2">
                    <Form.Group controlId="cargo">
                        <Form.Label>Cargo</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Cargo"
                            value={cargo}
                            onChange={e => setCargo(e.target.value)}
                            readOnly={!isEditable}
                            required
                        />
                    </Form.Group>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <Form.Group controlId="companiaClasificacion">
                        <Form.Label>Compañía / Clasificación</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ingrese la compañía o clasificación"
                            value={companiaClasificacion}
                            onChange={e => setCompaniaClasificacion(e.target.value)}
                            readOnly={!isEditable}
                        />
                    </Form.Group>
                </div>
            </div>

            <h5>Contacto</h5>
            <div className="row">
                <div className="col-md-4">
                    <Form.Group controlId="telefono">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Ingrese el teléfono"
                            value={telefono}
                            onChange={e => setTelefono(e.target.value)}
                            readOnly={!isEditable}
                        />
                    </Form.Group>
                </div>

                <div className="col-md-4">
                    <Form.Group controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Ingrese el email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            readOnly={!isEditable}
                            required
                        />
                    </Form.Group>
                </div>
            </div>

            <div className="row">
                <div className="col-md-4">
                    <h5>Otros Datos Relevantes</h5>
                    <Form.Group controlId="otrosDatosContacto">
                        <Form.Label>Datos Relevantes</Form.Label>
                        <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder="Ingrese otros datos relevantes"
                        value={otrosDatosContacto}
                        onChange={e => setOtrosDatosContacto(e.target.value)}
                        readOnly={!isEditable}
                        />
                    </Form.Group>
                </div>
            </div>

            <div>
                <h5>Fechas de No Disponibilidad</h5>

                {/* Formulario para ingresar una nueva fecha de no disponibilidad (solo editable) */}
                {isEditable && (
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <Form.Group controlId="descripcion">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Vacaciones, permisos, viajes programados, etc."
                                    value={descripcionFechaNoDisponibilidad}
                                    onChange={e => setDescripcionFechaNoDisponibilidad(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-4">
                            <Form.Group controlId="fechaInicio">
                                <Form.Label>Fecha de Inicio</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fechaInicio}
                                    onChange={e => setFechaInicio(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-4">
                            <Form.Group controlId="fechaFin">
                                <Form.Label>Fecha de Fin</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fechaFin}
                                    onChange={e => setFechaFin(e.target.value)}
                                />
                            </Form.Group>
                        </div>

                        {errorFechas && (
                            <div className="col-md-12">
                                <div className="alert alert-danger" role="alert">
                                    {errorFechas}
                                </div>
                            </div>
                        )}

                        <div className="col-md-12">
                            <Button variant="primary" onClick={validarYAgregarFecha} className="mt-2">
                                Guardar Fecha
                            </Button>
                        </div>
                    </div>
                )}

                {/* Tabla de Fechas de No Disponibilidad */}
                {fechasNoDisponibilidad.length > 0 ? (
                    <Table striped bordered hover className="mt-4">
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Fecha de Inicio</th>
                                <th>Fecha de Fin</th>
                                {/*<th>Total Días</th>*/}
                            </tr>
                        </thead>
                        <tbody>
                            {fechasNoDisponibilidad.map((fecha, index) => (
                                <tr key={index}>
                                    <td>{fecha.motivo}</td>
                                    <td>{new Date(fecha.fechaInicio).toLocaleDateString()}</td>
                                    <td>{new Date(fecha.fechaFin).toLocaleDateString()}</td>
                                    {/*<td>{fecha.diasTotales}</td>*/}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                        <div className="alert alert-primary mt-4 text-center" role="alert">
                            <strong>El interesado no tiene registrado fechas</strong>
                        </div>
                )}

            </div>

                <Form.Group controlId="expectativasProyecto">
                    <h5>Expectativas sobre el Proyecto</h5>
                    <Form.Label>Expectativas del Proyecto</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Sin expectativas en este proyecto"
                        value={expectativasProyecto}
                        onChange={e => setExpectativasProyecto(e.target.value)}
                    readOnly={!isEditable}
                    />
                </Form.Group>

                {/* Evaluación */}
            <h5>Evaluación</h5>

            {isEditable || compromiso || poder || influencia || conocimiento || valoracion ? (
                <div className="row">
                    <div className="col-md-4">
                        <Form.Group controlId="compromiso">
                            <Form.Label>Compromiso (1-5)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Compromiso"
                                value={compromiso ?? ''} // Vacío si editable
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 5)) {
                                        setCompromiso(value);
                                    }
                                }}
                                readOnly={!isEditable}
                                required
                                min="1"
                                max="5"
                            />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                        <Form.Group controlId="poder">
                            <Form.Label>Poder (1-5)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Poder"
                                    value={poder ?? ''} // Vacío si editable
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 5)) {
                                        setPoder(value);
                                    }
                                }}
                                readOnly={!isEditable}
                                required
                                min={1}
                                max={5}
                            />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                        <Form.Group controlId="influencia">
                            <Form.Label>Influencia (1-5)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Influencia"
                                value={influencia ?? ''} // Vacío si editable
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 5)) {
                                        setInfluencia(value);
                                    }
                                }}
                                readOnly={!isEditable}
                                required
                                min={1}
                                max={5}
                            />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                        <Form.Group controlId="conocimiento">
                            <Form.Label>Conocimiento (1-5)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Conocimiento"
                                value={conocimiento ?? ''} // Vacío si editable
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 5)) {
                                        setConocimiento(value);
                                    }
                                }}
                                readOnly={!isEditable}
                                required
                                min={1}
                                max={5}
                            />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                        <Form.Group controlId="interesActitud">
                            <Form.Label>Interés - Actitud (1/-1)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Interés - Actitud"
                                value={interesActitud ?? ''} // Vacío si editable
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || (parseInt(value, 10) >= -1 && parseInt(value, 10) <= 1)) {
                                        setInteresActitud(value);
                                    }
                                }}
                                readOnly={!isEditable}
                                required
                                min={-1}
                                max={1}
                            />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                        <Form.Group controlId="valoracion">
                            <Form.Label>Valoración (1 - 30)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Valoración Calculada"
                                value={valoracion} // Valor fijo, no editable
                                readOnly
                            />
                        </Form.Group>
                    </div>
                </div>
                
            ) : (
                <p>El interesado no contiene datos en la evaluación</p>
            )}




            <h5>Acciones - Interesado</h5>

            {isEditable ? (
                <div className="alert alert-warning mt-2" role="alert">
                    Las acciones de cada interesado no pueden ser editadas.
                </div>
            ) : undoneTasks.filter(item => !item.done).length === 0 ? (
                <div className="alert alert-info mt-2" role="alert">
                    No hay tareas para este interesado. Puede agregarlas desde la pestaña de To-Do.
                </div>
            ) : (
                <ul className="pl-0" style={{ listStyleType: "none" }}>
                    {undoneTasks.filter(item => !item.done).map((item, idx) => (
                        <li key={item.id}>
                            <TodoItem
                                enableCheck={enableCheck}
                                {...item}
                                onComplete={() => markAsDone(item.id)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            {/* <Button
                variant="secondary"
                onClick={isEditable ? handleSave : toggleEditMode}
                className="mt-3"
            >
                {isEditable ? "Guardar" : "Editar"}
            </Button> */}
        </Form>
    );
};

export default Interesado;
