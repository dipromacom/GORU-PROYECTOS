import { Button } from 'react-bootstrap'; // Importar correctamente el botón de react-bootstrap
import { Modal, Table, Form } from 'react-bootstrap';
import React from "react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch, connect } from 'react-redux';
import { useParams } from 'react-router-dom'
import { actions, selectors } from "../../reducers/project";
import './matrizComponents.css';
import TodoListForm from '../todoList/TodoListForm';
import ViewInteresados from './ViewInteresados';

export const CreateInteresados = ({ onNavigate, nombreinteresado, codInteresado, SetInteresado,  }) => {
    const dispatch = useDispatch();
    const routeParams = useParams();

    // console.log({nombreinteresado});
    const [interesActitud, setInteresActitud] = useState('');
    const [valoracion, setValoracion] = useState('');
    const [accionEstrategica, setAccionEstrategica] = useState('');
    const [expectativasProyecto, setExpectativasProyecto] = useState('');
    const [responsableEstrategia, setResponsableEstrategia] = useState('');
    const [numeracion, setNumeracion] = useState(1); // Estado para la numeración
    // const [idInteresado, setIdInteresado] = useState('');
    const [interesado, setInteresado] = useState('');
    const [codigo, setCodigo] = useState('');
    const [rol, setRol] = useState('');
    const [cargo, setCargo] = useState('');
    const [companiaClasificacion, setCompaniaClasificacion] = useState('');
    const [descripcionFechaNoDisponibilidad, setDescripcionFechaNoDisponibilidad] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    // const [diasTotales, setDiasTotales] = useState(null);
    const [errorFechas, setErrorFechas] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [compromiso, setCompromiso] = useState('');
    const [poder, setPoder] = useState('');
    const [influencia, setInfluencia] = useState('');
    const [conocimiento, setConocimiento] = useState('');
    const [otrosDatosContacto, setOtrosDatosContacto] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [showModal, setShowModal] = useState(false); // Estado para el modal
    const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal para confirmar que el interesado fue agregado
    const [fechasNoDisponibilidad, setFechasNoDisponibilidad] = useState([]);
    const [interesados, setInteresados] = useState([]); // Inicializa como un array vacío
    const [idInteresado, setIdInteresado] = useState('001');
    const handleCloseModal = () => setShowModal(false);
    const handleCloseConfirmModal = () => setShowConfirmModal(false);
    const [acciones, setAcciones] = useState([]);
    const [mostrarTabla, setMostrarTabla] = useState(false);  // Nuevo estado para mostrar la tabla
    const [fechaFinAccion, setFechaFinAccion] = useState('');
    const [fechaInicioAccion, setFechaInicioAccion] = useState('');
    const [verInteresados, setVerInteresados] = useState(false);
    const [mostrarInteresados, setMostrarInteresados] = useState(false); 


    useEffect(() => {
        const total = (parseInt(compromiso) || 0) +
            (parseInt(poder) || 0) +
            (parseInt(influencia) || 0) +
            (parseInt(conocimiento) || 0);
        const interes = parseInt(interesActitud) || 0;

        // Calcular la valoración multiplicando el total por el interés
        const valoracionCalculada = total * interes;

        // Asignar el valor calculado
        setValoracion(valoracionCalculada);
    }, [compromiso, poder, influencia, conocimiento, interesActitud]);

    const calcularFechaFin = () => {
        const fechaHoy = new Date();
        fechaHoy.setDate(fechaHoy.getDate() + 7); // Sumar 7 días
        const fechaFin = fechaHoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        return fechaFin;
    };

    const tileClassName = ({ date }) => {
        for (const accion of acciones) {
            const inicio = new Date(accion.fechaInicio);
            const fin = new Date(accion.fechaFinAccion);

            if (date >= inicio && date <= fin) {
                return 'active-date'; // Fecha activa
            } else if (date < inicio) {
                return 'future-date'; // Fecha futura
            } else if (date > fin) {
                return 'past-date'; // Fecha pasada
            }
        }
        return null;
    };

    const handleAddAccion = () => {
        if (!accionEstrategica) {
            alert('El campo "Acción Estratégica" está vacío. Por favor, complételo.');
        } else if (!interesado) {
            alert('El campo "Responsable" está vacío. Por favor, complételo.');
        } else if (!fechaFinAccion) {
            alert('El campo "Fecha Fin Acción" está vacío. Por favor, complételo.');
        } else {
            const nuevaAccion = {
                accion: accionEstrategica,
                responsable: interesado,
                fechaInicio: new Date().toISOString().split('T')[0], // Fecha actual (solo la parte de la fecha)
                fechaFinAccion: fechaFinAccion,
                diasRestantes: Math.ceil(
                    (new Date(fechaFinAccion) - new Date()) / (1000 * 60 * 60 * 24)
                ),
            };

            setAcciones([...acciones, nuevaAccion]);
            setAccionEstrategica('');
            setFechaInicioAccion('');
            setFechaFinAccion('');
            setMostrarTabla(true);
        }
    };

    const generarSiguienteCodigo = () => {
        const cantidad = nombreinteresado && nombreinteresado.length ? nombreinteresado.length : 0;
        const nuevoNumero = cantidad + 1;
        return nuevoNumero.toString().padStart(3, '0');
    };

    useEffect(() => {
        const nuevoCodigo = generarSiguienteCodigo();
        setIdInteresado(nuevoCodigo);
        setCodigo(nuevoCodigo);
    }, [nombreinteresado]);



    const validarYAgregarFecha = () => {
        const diasDiferencia = calcularDias(fechaInicio, fechaFin);

        if (!descripcionFechaNoDisponibilidad || !fechaInicio || !fechaFin) {
            setErrorFechas('Todos los campos de fecha deben ser completados.');
            return;
        }

        if (diasDiferencia < 0) {
            setErrorFechas('La fecha de fin no puede ser anterior a la fecha de inicio');
            return;
        }

        // Si es el mismo día, considerarlo como 1 día
        const diasTotales = diasDiferencia === 0 ? 1 : diasDiferencia;

        // Validar que no haya superposición de fechas
        for (let i = 0; i < fechasNoDisponibilidad.length; i++) {
            const fechaExistente = fechasNoDisponibilidad[i];
            if (fechasSolapadas(fechaExistente.fechaInicio, fechaExistente.fechaFin, fechaInicio, fechaFin)) {
                setErrorFechas('La fecha ingresada se ha Cruzado con una ya Registrada.');
                return;
            }
        }

        // Si todo es válido, agregar la nueva fecha
        setErrorFechas(''); // Limpiar el error si las fechas son correctas
        setFechasNoDisponibilidad([
            ...fechasNoDisponibilidad,
            { descripcionFechaNoDisponibilidad, fechaInicio, fechaFin, diasTotales }
        ]);

        // Limpiar los campos de entrada después de agregar la fecha
        setDescripcionFechaNoDisponibilidad('');
        setFechaInicio('');
        setFechaFin('');
    };


    const calcularDias = (inicio, fin) => {
        const fechaInicioObj = new Date(inicio);
        const fechaFinObj = new Date(fin);

        // Ajustar la fechaFinObj para incluir el final del día
        fechaFinObj.setHours(23, 59, 59, 999);

        const diferenciaTiempo = fechaFinObj - fechaInicioObj;
        const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24)); // Redondea hacia arriba

        return diferenciaDias;
    };

    const fechasSolapadas = (inicio1, fin1, inicio2, fin2) => {
        const fechaInicio1 = new Date(inicio1);
        const fechaFin1 = new Date(fin1);
        const fechaInicio2 = new Date(inicio2);
        const fechaFin2 = new Date(fin2);

        // Si las fechas se superponen
        return !(fechaFin1 < fechaInicio2 || fechaFin2 < fechaInicio1);
    };

    const removeFechaNoDisponibilidad = (index) => {
        const nuevasFechas = fechasNoDisponibilidad.filter((_, i) => i !== index);
        setFechasNoDisponibilidad(nuevasFechas);
    };

    const eliminarInteresado = (index) => {
        // Crea una nueva lista excluyendo el interesado que se quiere eliminar
        const nuevosInteresados = interesados.filter((_, i) => i !== index);
        setInteresados(nuevosInteresados); // Actualiza el estado
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const agregarInteresado = async (e) => {
        e.preventDefault();
        console.log('Formulario enviado');

        if (!interesado || !rol || !cargo || !telefono || !email) {
            setShowModal(true);
            return;
        }

        // Generar nuevo id para el interesado
        const nuevoCodInteresado = generarSiguienteCodigo();

        const payloadInteresado = {
            id_interesado: nuevoCodInteresado,
            proyecto_id: routeParams.id,
            nombre_interesado: interesado,
            telefono,
            email,
            otrosDatos: otrosDatosContacto,
            codigo: nuevoCodInteresado,
            rol,
            cargo,
            companiaClasificacion,
            expectativasProyecto,
            fechasNoDisponibilidad: fechasNoDisponibilidad.map(fecha => ({
                descripcion: fecha.descripcionFechaNoDisponibilidad,
                fechaInicio: fecha.fechaInicio,
                fechaFin: fecha.fechaFin,
            })),
            evaluacion: {
                compromiso,
                poder,
                influencia,
                conocimiento,
                interesActitud,
                valoracion,
            },
            accionEstrategica,
            responsableEstrategia,
        };

        // Actualizar la lista de interesados correctamente
        setInteresados(prev => {
            const updatedList = editIndex !== null
                ? prev.map((item, index) => index === editIndex ? payloadInteresado : item)
                : [...prev, payloadInteresado];

            return updatedList;
        });

        // Enviar el nuevo interesado a la API
        dispatch(actions.createInteresadoRequest(payloadInteresado));
        setTimeout(() => {
            window.location.reload(); // Recarga la página después de 1 segundo
        }, 1000);
        // Resetear el formulario
        resetInteresadoFormFields();
    };

    // Función para reiniciar los campos del formulario de interesados
    const resetInteresadoFormFields = () => {
        setIdInteresado('');
        setInteresado('');
        setRol('');
        setCargo('');
        setCompaniaClasificacion('');
        setTelefono('');
        setEmail('');
        setOtrosDatosContacto('');
        setExpectativasProyecto('');
        setCompromiso('');
        setPoder('');
        setInfluencia('');
        setConocimiento('');
        setInteresActitud('');
        setValoracion('');
        setAccionEstrategica('');
        setResponsableEstrategia('');
        setFechasNoDisponibilidad([]);
    };

    return (
        <>
            <Form className="blue">
                {/* Campos ID, Interesado, Código, Rol, Cargo, Compañía/Clasificación */}
                <div className="row">
                    <div className="col-md-2">
                        <Form.Group controlId="idInteresado">
                            <Form.Label>ID</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="ID"
                                value={idInteresado}
                                onChange={e => setIdInteresado(e.target.value)}
                                readOnly
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
                            />
                        </Form.Group>
                    </div>
                </div>

                {/* Contacto */}
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
                            />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email" // Validación nativa
                                placeholder="Ingrese el email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required // Asegura que el campo sea obligatorio
                            />
                            {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                                <small className="text-danger">Correo no válido</small>
                            )}
                            <Form.Control.Feedback type="invalid">
                                Por favor, ingrese un correo electrónico válido.
                            </Form.Control.Feedback>
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
                            />
                        </Form.Group>
                    </div>
                </div>

                {/* Fechas de No Disponibilidad */}
                <div>
                    <h5>Fechas de No Disponibilidad</h5>

                    {/* Formulario para ingresar una nueva fecha de no disponibilidad */}
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

                    {/* Tabla de Fechas de No Disponibilidad */}
                    {fechasNoDisponibilidad.length > 0 && (
                        <Table striped bordered hover className="mt-4">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Fecha de Inicio</th>
                                    <th>Fecha de Fin</th>
                                    <th>Total Días</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fechasNoDisponibilidad.map((fecha, index) => (
                                    <tr key={index}>
                                        <td>{fecha.descripcionFechaNoDisponibilidad}</td>
                                        <td>{fecha.fechaInicio}</td>
                                        <td>{fecha.fechaFin}</td>
                                        <td>{fecha.diasTotales}</td>
                                        <td>
                                            <Button variant="danger" onClick={() => removeFechaNoDisponibilidad(index)}>
                                                Eliminar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>

                {/* Expectativas sobre el Proyecto */}
                <Form.Group controlId="expectativasProyecto">
                    <h5>Expectativas sobre el Proyecto</h5>
                    <Form.Label>Expectativas del Proyecto</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Describa las expectativas sobre el proyecto"
                        value={expectativasProyecto}
                        onChange={e => setExpectativasProyecto(e.target.value)}
                    />
                </Form.Group>

                {/* Evaluación */}
                <h5>Evaluación</h5>
                <div className="row">
                    <div className="col-md-4">
                        <Form.Group controlId="compromiso">
                            <Form.Label>Compromiso (1-5)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="1-5"
                                value={compromiso}
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 5)) {
                                        setCompromiso(value);
                                    }
                                }}
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
                                placeholder="1-5"
                                value={poder}
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 5)) {
                                        setPoder(value);
                                    }
                                }}
                                min="1"
                                max="5"
                            />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                        <Form.Group controlId="influencia">
                            <Form.Label>Influencia (1-5)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="1-5"
                                value={influencia}
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 5)) {
                                        setInfluencia(value);
                                    }
                                }}
                                min="1"
                                max="5"
                            />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                        <Form.Group controlId="conocimiento">
                            <Form.Label>Conocimiento (1-5)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="1-5"
                                value={conocimiento}
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 5)) {
                                        setConocimiento(value);
                                    }
                                }}
                                min="1"
                                max="5"
                            />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                        <Form.Group controlId="interesActitud">
                            <Form.Label>Interes - Actitud (1/-1)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="1/-1"
                                value={interesActitud}
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || (parseInt(value, 10) >= -1 && parseInt(value, 10) <= 1)) {
                                        setInteresActitud(value);
                                    }
                                }}
                                min="-1"
                                max="1"
                            />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                        <Form.Group controlId="valoracion">
                            <Form.Label>Valoración (1 - 10)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Valoración Calculada"
                                value={valoracion}
                                readOnly  // Impide la edición manual
                            />
                        </Form.Group>
                    </div>


                    {/* Evaluación */}
                    <div className="alert alert-info" role="alert">
                        <h5 className="mb-3">
                            Acciones - Interesado
                        </h5>
                        <p>
                            Para agregar actividades a este interesado, primero asegúrese de haber creado el interesado correctamente.
                            Luego, podrá asignar las actividades correspondientes en la pestaña <strong>To Do</strong>.
                        </p>
                        <p>
                            <i className="fas fa-arrow-right"></i> Dirígete a la pestaña <strong>To Do</strong> para gestionar las actividades.
                        </p>
                        {/* <TodoListForm interesado={nombreinteresado} /> */}
                    </div>
                    <Button
                        type="button" // Evita el comportamiento predeterminado del formulario
                        variant="primary"
                        onClick={agregarInteresado}
                        className="mt-3 mb-3" // Agrega margen arriba y abajo
                    >
                        Agregar Interesado
                    </Button>
                </div>

                {/* Renderizar ViewInteresados sobre el actual */}
                {/* {mostrarInteresados && (
                    <div className="interesados-overlay">
                        <ViewInteresados />
                    </div>
                )} */}
                {/* Tabla de interesados */}

                {/* {interesados.length > 0 && (
                    <Table striped bordered hover className="mt-4">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Interesado</th>
                                <th>Rol</th>
                                <th>Cargo</th>
                                <th>Compañía / Clasificación</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interesados.map((interesado, index) => (
                                <tr key={index}>
                                    <td>{interesado.nuevoId}</td>
                                    <td>{interesado.interesado}</td>
                                    <td>{interesado.rol}</td>
                                    <td>{interesado.cargo}</td>
                                    <td>{interesado.companiaClasificacion}</td>
                                    <td>{interesado.telefono}</td>
                                    <td>{interesado.email}</td>
                                    <td>
                                        <Button variant="danger" onClick={() => eliminarInteresado(index)}>
                                            Eliminar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )} */}


            </Form>

            {/* Modal para mostrar mensaje */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Información Incompleta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Por favor, complete al menos la información principal del interesado: nombre, rol, cargo, teléfono y correo electrónico.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>


            {/* Modal para confirmar que el interesado ha sido agregado */}
            <Modal show={showConfirmModal} onHide={handleCloseConfirmModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Interesado Agregado</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    El interesado ha sido agregado exitosamente al proyecto.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseConfirmModal}>
                        Aceptar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

const mapStateToProps = state => ({
    isLoading: selectors.getIsLoading(state),
    // analisisAmbiental: selectors.getAnalysisData(state),
    // interesados: selectors.getInteresados(state),
    showNotification: selectors.getShowNotification(state)
});

export default connect(mapStateToProps)(CreateInteresados);