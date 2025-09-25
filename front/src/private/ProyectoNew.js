/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import LoaderButton from "../components/loaderButton/LoaderButton";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse"
import { Row, Col, InputGroup, DropdownButton, Dropdown } from "react-bootstrap"
import "./ProyectoNew.css"
import { actions, selectors } from "../reducers/project";
import { selectors as sessionSelectors } from "../reducers/session";
import { Button } from 'react-bootstrap';
import { Tabs, Card, Tab, Nav, Table } from 'react-bootstrap';
import { TabContainer } from "react-bootstrap";
import regexValidator from "../libs/regexValidator";
import InputTextList from "../components/inputList/InputTextList";
import moment from "moment";
import InputTextListWithDate from "../components/inputList/InputTexListWithDate";
import InputCostToList from "../components/inputList/InputCostToList";
import InputCriteriosInput from "../components/inputList/InputCriteriosInput"
import InputRiesgosList from "../components/inputList/InputRiesgosList";
import GoogleDocInputCheckerComponent from "../components/custom/GoogleDocInputCheckerComponent";
import { actions as routeActions } from "../reducers/routes";
import { actions as tipoProyectoAction, selectors as tipoProyectoSelector } from "../reducers/tipoProyecto";
import TodoList from "../components/todoList/TodoList";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";



function ProyectoNew({ dispatch, isLoading, usuario, tipoProyectoList }) {
    const [activeKey, setActiveKey] = useState('general');
    const [numeroProyecto, setNumeroProyecto] = useState("");
    const [nombreProyecto, setNombreProyecto] = useState("");
    const [directorProyecto, setDirectorProyecto] = useState("");
    const [patrocinadorProyecto, setPatrocinadorProyecto] = useState("");
    const [departamento, setDepartamento] = useState("");
    const [informacionBreve, setInformacionBreve] = useState("");
    const [pendienteAsignacion, setPendienteAsignacion] = useState(true);
    const [documentacionAdjunta, setDocumentacionAdjunta] = useState('');
    const [contrato, setContrato] = useState('');
    const [casoNegocio, setCasoNegocio] = useState('');
    const [enunciadoTrabajo, setEnunciadoTrabajo] = useState('');
    const [portafolio, setPortafolio] = useState("");
    const [programa, setPrograma] = useState("");
    const [justificacion, setJustificacion] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [descripcionNoDisponibilidad, setDescripcionNoDisponibilidad] = useState("");
    const [analisisViabilidad, setAnalisisViabilidad] = useState("");
    const [objetivoCosto, setObjetivoCosto] = useState("");
    const [objetivoPlazo, setObjetivoPlazo] = useState("");
    const [objetivoDesempeno, setObjetivoDesempeno] = useState("");
    const [objetivoDescripcion, setObjetivoDescripcion] = useState("");
    const [alcanceEntregables, setAlcanceEntregables] = useState([]);
    const [tiempoDuracion, setTiempoDuracion] = useState(0);
    const [tiempoFechasCriticas, setTiempoFechasCriticas] = useState([]);
    const [costoEntregable, setCostoEntregable] = useState([]);
    const [costoReservaContingencia, setCostoReservaContingencia] = useState("");
    const [costoReservaGestion, setCostoReservaGestion] = useState("");
    const [calidadMetricas, setCalidadMetricas] = useState([]);
    const [riesgos, setRiesgos] = useState([]);
    const [recursosRequeridos, setRecursosRequeridos] = useState("");
    const [supuestos, setSupuestos] = useState("");
    const [restricciones, setRestricciones] = useState("");
    const [maxDesvioPresupuesto, setMaxDesvioPresupuesto] = useState("");
    const [maxDesvioTiempo, setMaxDesvioTiempo] = useState("");
    const [autorizadoFirmasExternas, setAutorizadoFirmasExternas] = useState(false);
    const [tareasFunciones, setTareasFunciones] = useState("");
    const [tiposInformes, setTiposInformes] = useState([]);
    const [incentivo, setIncentivo] = useState("");
    const [autoridadControlCambios, setAutoridadControlCambios] = useState(false)
    const [todoList, setTodoList] = useState([])
    const [plazoPeriodo, setPlazoPeriodo] = useState("M")
    const [maxDesviacionPeriodo, setMaxDesviacionPeriodo] = useState("M")
    const [tipoProyecto, setTipoProyecto] = useState("")

    //Aqui se declaran para manejar los estados de los collapse
    const [openPrimeraParte, setOpenPrimeraParte] = useState(false);
    const [openSegundaParte, setOpenSegundaParte] = useState(false);
    const [openTerceraParte, setOpenTerceraParte] = useState(false);
    const [openCuartaParte, setOpenCuartaParte] = useState(false);
    const [openQuintaParte, setOpenQuintaParte] = useState(false);
    const [openSextaParte, setOpenSextaParte] = useState(false);

    // Combos Seccion Descripcion del proyecto a alto nivel - periodo de tiempo
    const values = [
        {clave: "D", valor: "Día"},
        {clave: "M", valor: "Mes"},
        {clave: "A", valor: "Año"},
    ]

    // aqui se declaran los datos del formulario matriz de interesados
    const [expectativaProyecto, setExpectativaProyecto] = useState('');
    const [evaluacion, setEvaluacion] = useState('');
    const [interesActitud, setInteresActitud] = useState('');
    const [valoracion, setValoracion] = useState('');
    const [accionEstrategica, setAccionEstrategica] = useState('');
    const [expectativasProyecto, setExpectativasProyecto] = useState('');
    const [responsableEstrategia, setResponsableEstrategia] = useState('');
    const [codigoProyecto, setCodigoProyecto] = useState('');
    const [numeracion, setNumeracion] = useState(1); // Estado para la numeración
    const [idInteresado, setIdInteresado] = useState('');
    const [interesado, setInteresado] = useState('');
    const [codigo, setCodigo] = useState('');
    const [rol, setRol] = useState('');
    const [cargo, setCargo] = useState('');
    const [companiaClasificacion, setCompaniaClasificacion] = useState('');
    const [descripcionFechaNoDisponibilidad, setDescripcionFechaNoDisponibilidad] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [diasTotales, setDiasTotales] = useState(null);
    const [errorFechas, setErrorFechas] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [compromiso, setCompromiso] = useState('');
    const [poder, setPoder] = useState('');
    const [influencia, setInfluencia] = useState('');
    const [conocimiento, setConocimiento] = useState('');
    const [otrosDatosContacto, setOtrosDatosContacto] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [fechasNoDisponibilidad, setFechasNoDisponibilidad] = useState([]);
    const [interesados, setInteresados] = useState([]); // Inicializa como un array vacío

    


    const initialCriteria = [
        { criterion: 'Los productos pueden ser reciclados.', weight: 0.3, rating: 0 },
        { criterion: 'Los productos son energéticamente eficientes.', weight: 0.1, rating: 0 },
        { criterion: 'El producto es perjudicial para el medio ambiente.', weight: 0.2, rating: 0 },
        { criterion: 'Tiene una política de gestión ambiental activa.', weight: 0.1, rating: 0 },
        { criterion: 'Posible impacto negativo por residuos sólidos.', weight: 0.1, rating: 0 },
        { criterion: 'Posible impacto negativo por residuos líquidos.', weight: 0.1, rating: 0 },
        { criterion: 'Posible impacto negativo por residuos peligrosos.', weight: 0.1, rating: 0 },
        { criterion: 'Posible impacto negativo en la vida de la sociedad.', weight: 0.1, rating: 0 },
        { criterion: 'Posible de daño a la imagen.', weight: 0.1, rating: 0 },
    ];

    const [criteria, setCriteria] = useState(initialCriteria);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0); // Indice de la pregunta seleccionada
    const handleValoracionChange = (e) => {
        const value = e.target.value;

        // Permite solo valores entre 0 y 4 o vacío
        if ((value >= 0 && value <= 4)) {
            setValoracion(value);
        }
    };
    // Manejo del cambio de calificación
    const handleRatingChange = (index, event) => {
        const newCriteria = [...criteria];
        newCriteria[index].rating = parseInt(event.target.value);
        setCriteria(newCriteria);
    };

    // Manejo de la selección de la pregunta
    const handleSelectQuestion = (index) => {
        setSelectedQuestionIndex(index);
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

    const removeFechaNoDisponibilidad = (index) => {
        const nuevasFechas = fechasNoDisponibilidad.filter((_, i) => i !== index);
        setFechasNoDisponibilidad(nuevasFechas);
    };
    useEffect(() => {
        dispatch(tipoProyectoAction.getTipoProyecto())
    }, [])

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const modo = searchParams.get("modo") || "P"; // P por defecto
    const esActividad = modo === "A";



    useEffect(() => {
        function initCostoEntregable() {
            let newCostoEntregable = []
            if (costoEntregable.length > alcanceEntregables.length)
                newCostoEntregable = costoEntregable.filter(item => alcanceEntregables.includes(item.entregable))
            if (alcanceEntregables.length > costoEntregable.length)
                newCostoEntregable = [...costoEntregable, { entregable: alcanceEntregables[alcanceEntregables.length - 1], costo: 0 }]
            setCostoEntregable(newCostoEntregable)
        }

        function initCalidadMetricas() {
            let newCalidadMetricas = []
            if (calidadMetricas.length > alcanceEntregables.length)
                newCalidadMetricas = calidadMetricas.filter(item => alcanceEntregables.includes(item.entregable))
            if (alcanceEntregables.length > calidadMetricas.length)
                newCalidadMetricas = [...calidadMetricas, { entregable: alcanceEntregables[alcanceEntregables.length - 1], metrica: '' }]
            setCalidadMetricas(newCalidadMetricas)
        }
        initCalidadMetricas()
        initCostoEntregable()
    }, [alcanceEntregables])

    const handleMultipleTipoInforme = event => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        const newTiposInformes = [...tiposInformes];

        selectedOptions.forEach(option => {
            if (!newTiposInformes.includes(option)) {
                newTiposInformes.push(option);
            } else {
                newTiposInformes.splice(newTiposInformes.indexOf(option), 1);
            }
        });

        setTiposInformes(newTiposInformes);
    }

    function handleSubmit(event) {
        event.preventDefault();
        let payload = {
            numeroProyecto,
            nombreProyecto,
            directorProyecto,
            patrocinadorProyecto,
            departamento,
            informacionBreve,
            tipoProyecto,
            modo
        };
        payload = appendActaDeInicio(payload);
        dispatch(actions.createProjectRequest(payload));
    }
    
    function handleSubmitGeneralData(event) {
        event.preventDefault();
        let payload = {
            numeroProyecto,
            nombreProyecto,
            directorProyecto,
            patrocinadorProyecto,
            departamento,
            informacionBreve,
            tipoProyecto,
            modo
        };
        dispatch(actions.createProjectGeneralDataRequest(payload));
    }

    const appendActaDeInicio = initialPayload => {
        let result = {
            ...initialPayload,
            pendienteAsignacion,
            ...( documentacionAdjunta && {documentacionAdjunta}),
            ...( contrato && {contrato}),
            ...( casoNegocio && {casoNegocio}),
            ...( enunciadoTrabajo &&  {enunciadoTrabajo}),
            ...(portafolio && { portafolio }),
            ...(programa && { programa }),
            ...(justificacion && { justificacion }),
            ...(descripcion && { descripcion }),
            ...(analisisViabilidad && { analisisViabilidad }),
            ...(objetivoCosto && { objetivoCosto }),
            ...(objetivoPlazo && { objetivoPlazo }),
            ...(objetivoDesempeno && { objetivoDesempeno }),
            ...(objetivoDescripcion && { objetivoDescripcion }),
            ...(alcanceEntregables && { alcanceEntregables }),
            ...(tiempoDuracion && { tiempoDuracion }),
            ...(tiempoFechasCriticas && { tiempoFechasCriticas }),
            ...(costoEntregable && { costoEntregable }),
            ...(costoReservaContingencia && { costoReservaContingencia }),
            ...(costoReservaGestion && { costoReservaGestion }),
            ...(calidadMetricas && { calidadMetricas }),
            ...(riesgos && { riesgos }),
            ...(recursosRequeridos && { recursosRequeridos }),
            ...(supuestos && { supuestos }),
            ...(restricciones && { restricciones }),
            ...(maxDesvioPresupuesto && { maxDesvioPresupuesto }),
            ...(maxDesvioTiempo && { maxDesvioTiempo }),
            ...(autorizadoFirmasExternas && { autorizadoFirmasExternas }),
            ...(tareasFunciones && { tareasFunciones }),
            ...(tiposInformes && { tiposInformes }),
            ...(incentivo && { incentivo }),
            autoridadControlCambios,
            //...(todoList && { todoList })
        }

        return result;
    }

    const handleChangeTab = (key) => {
        setActiveKey(key)
    }

    function validateForm() {
        return nombreProyecto.length > 0
            && directorProyecto.length > 0 
            && patrocinadorProyecto.length > 0
            && departamento.length > 0 
            && informacionBreve.length > 0
            && tipoProyecto;
    }

    function showDuration(value) {
        const duration = moment.duration(value, 'd');
        const years = duration.years();
        const months = duration.months();
        const days = duration.days();
        let durationString = '';
        if (years > 0) {
            durationString += `${years} año${years > 1 ? 's' : ''}`;
        }
        if (months > 0) {
            durationString += `${durationString ? ', ' : ''}${months} mes${months > 1 ? 'es' : ''}`;
        }
        if (days > 0) {
            durationString += `${durationString ? ', y ' : ''}${days} dia${days > 1 ? 's' : ''}`;
        }
        return durationString;
    }
 
    // Actualizar el idInteresado al cargar y cada vez que se agregue un nuevo interesado
    useEffect(() => {
        setIdInteresado(generarSiguienteId());
    }, [interesados]);

    useEffect(() => {
        if (nombreProyecto) {
            // Crea un código del proyecto basado en las primeras letras del nombre del proyecto
            const codigoGenerado = nombreProyecto
                .split(' ')
                .map(palabra => palabra[0]) // Toma la primera letra de cada palabra
                .join('')
                .toUpperCase() + '-' + String(numeracion).padStart(3, '0'); // Agrega la numeración con ceros a la izquierda

            setCodigo(codigoGenerado);
            const codInteresado = codigoGenerado

            // setIdInteresado(codInteresado)
        }
    }, [nombreProyecto, numeracion]);

    const generarSiguienteId = () => {
        const ultimoId = interesados.length > 0
            ? parseInt(interesados[interesados.length - 1].idInteresado, 10)
            : 0;
        const nuevoId = (ultimoId + 1).toString().padStart(3, '0');
        return nuevoId;
    };

    const editarInteresado = (index) => {
        const interesadoSeleccionado = interesados[index];
        setEditIndex(index); 
        // Cargar datos del interesado en el formulario
        setIdInteresado(interesadoSeleccionado.idInteresado);
        setInteresado(interesadoSeleccionado.interesado);
        setCodigo(interesadoSeleccionado.codigo);
        setRol(interesadoSeleccionado.rol);
        setCargo(interesadoSeleccionado.cargo);
        setCompaniaClasificacion(interesadoSeleccionado.companiaClasificacion);
        setTelefono(interesadoSeleccionado.telefono);
        setEmail(interesadoSeleccionado.email);
        setOtrosDatosContacto(interesadoSeleccionado.otrosDatosContacto);
        setExpectativasProyecto(interesadoSeleccionado.expectativasProyecto);
        setCompromiso(interesadoSeleccionado.compromiso);
        setPoder(interesadoSeleccionado.poder);
        setInfluencia(interesadoSeleccionado.influencia);
        setConocimiento(interesadoSeleccionado.conocimiento);
        setInteresActitud(interesadoSeleccionado.interesActitud);
        setValoracion(interesadoSeleccionado.valoracion);
        setAccionEstrategica(interesadoSeleccionado.accionEstrategica);
        setResponsableEstrategia(interesadoSeleccionado.responsableEstrategia);
        setFechasNoDisponibilidad(interesadoSeleccionado.fechasNoDisponibilidad);
    };

    const eliminarInteresado = (index) => {
        // Crea una nueva lista excluyendo el interesado que se quiere eliminar
        const nuevosInteresados = interesados.filter((_, i) => i !== index);
        setInteresados(nuevosInteresados); // Actualiza el estado
    };


    const agregarInteresado = (e) => {
        e.preventDefault();
        let nuevoCodigo = codigo;
        if (editIndex === null && nombreProyecto) {
            nuevoCodigo = nombreProyecto
                .split(' ')
                .map(palabra => palabra[0])
                .join('')
                .toUpperCase() + '-' + String(numeracion).padStart(3, '0');
        }

        const nuevoId = editIndex !== null ? interesados[editIndex].idInteresado : generarSiguienteId();

        const payloadInteresado = {
            idInteresado: nuevoId,
            interesado,
            codigo: nuevoCodigo,
            rol,
            cargo,
            companiaClasificacion,
            telefono,
            email,
            otrosDatosContacto,
            expectativasProyecto,
            compromiso,
            poder,
            influencia,
            conocimiento,
            interesActitud,
            valoracion,
            accionEstrategica,
            responsableEstrategia,
            fechasNoDisponibilidad
        };

        if (editIndex !== null) {
            const nuevosInteresados = [...interesados];
            nuevosInteresados[editIndex] = payloadInteresado;
            setInteresados(nuevosInteresados);
            setEditIndex(null);
        } else {
            setInteresados([...interesados, payloadInteresado]);
            setNumeracion(prevNumeracion => prevNumeracion + 1);
        }
        resetInteresadoFormFields();
        return payloadInteresado;
    };

    // Función para reiniciar los campos del formulario de interesados
    const resetInteresadoFormFields = () => {
        setIdInteresado('');
        setInteresado('');
        setCodigo('');
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


    const getPlazoPeriodoTitle = () => {
        const title = values.filter( val => val.clave === plazoPeriodo)[0]?.valor
        return title;
    }

    const getDesviacionPeriodoTitle = () => {
        const title = values.filter( val => val.clave === maxDesviacionPeriodo)[0]?.valor
        return title;
    }

    return (
        <div className="page-menu-container">
            <Tab.Container defaultActiveKey="general" >

                <div className="submenu-container">
                    <div className="title-container">
                        <h1 className="blue">Nuevo Proyecto</h1>
                    </div>
                    <div className="tabbed-form mx-auto">
                        <Nav
                            activeKey={activeKey}
                            className="nav-tabs blue"
                            onSelect={handleChangeTab}
                        >
                            <Nav.Item>
                                <Nav.Link eventKey="general">Datos Generales</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="constitution">Acta de Constitución</Nav.Link>
                            </Nav.Item>
                            {/* <Nav.Item>
                                <Nav.Link eventKey="to-do" >To Do</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="project-management">Kanban</Nav.Link>
                            </Nav.Item> */}
                            {/* <Nav.Item>
                                <Nav.Link eventKey="Matriz-interesados" >Matriz de Interesados</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="analisis-Ambiental">Analisis de Impacto Ambiental </Nav.Link>
                            </Nav.Item> */}
                            
                            
                        </Nav>
                    </div>
                </div>

                <div className="container">
                    <h1 className="orange">Creación de {esActividad ? "Nueva Actividad" : "Nuevo Proyecto"}</h1>
                    <br />
                    <Tab.Content>
                        <Tab.Pane eventKey="general"><Form className="blue" >

                            <Form.Group controlId="proyecto">
                                <Form.Label>{esActividad ? "Actividad" : "Proyecto"}</Form.Label>
                                <Form.Control
                                    autoComplete="off"
                                    type="text"
                                    value={nombreProyecto}
                                    onChange={e => setNombreProyecto(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="directorProyecto">
                                <Form.Label>{esActividad ? "Director de la Actividad" : "Director del Proyecto"}</Form.Label>
                                <Form.Control
                                    autoComplete="off"
                                    type="text"
                                    value={directorProyecto}
                                    onChange={e => setDirectorProyecto(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="patrocinadorProyecto">
                                <Form.Label>{esActividad ? "Patrocinador de la Actividad" : "Patrocinador del Proyecto"}</Form.Label>
                                <Form.Control
                                    autoComplete="off"
                                    type="text"
                                    value={patrocinadorProyecto}
                                    onChange={e => setPatrocinadorProyecto(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="departamento">
                                <Form.Label>Departamento</Form.Label>
                                <Form.Control
                                    autoComplete="off"
                                    type="text"
                                    value={departamento}
                                    onChange={e => setDepartamento(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="informacionBreve">
                                <Form.Label>Información breve</Form.Label>
                                <Form.Control
                                    autoComplete="off"
                                    type="text"
                                    value={informacionBreve}
                                    as="textarea"
                                    rows={2}
                                    onChange={e => setInformacionBreve(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="tipoProyecto">
                                <Form.Label>{esActividad ? "Tipo de Actividad" : "Tipo de Proyecto"}</Form.Label>
                                <Form.Control
                                    as="select"
                                    className="form-select"
                                    value={tipoProyecto}
                                    onChange={(e) => { setTipoProyecto(e.target.value)}}
                                >
                                    <option value="">Elija el tipo de {esActividad ? "actividad" : "proyecto"}...</option>
                                    {tipoProyectoList.map(tipo => (
                                        <option value={tipo.id}>{tipo.nombre}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <div className="mt-5 pb-5">
                                <LoaderButton
                                    type="submit"
                                    className="btn-success btn-save"
                                    disabled={!validateForm()}
                                    onClick={handleSubmitGeneralData}
                                >
                                    Guardar Cambios
                                </LoaderButton>

                            </div>
                        </Form>
                        </Tab.Pane>
                        <Tab.Pane eventKey="constitution">
                            <Form.Group>
                                <Form.Check inline label="Pendiente Asignacion" checked={pendienteAsignacion} value={pendienteAsignacion} onChange={e=>setPendienteAsignacion(e.target.checked)} />
                            </Form.Group>
                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Documentacion Adjunta</Form.Label>
                                        <GoogleDocInputCheckerComponent link={documentacionAdjunta} setLink={setDocumentacionAdjunta} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Contrato</Form.Label>
                                        <GoogleDocInputCheckerComponent link={contrato} setLink={setContrato} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Caso Negocio</Form.Label>
                                        <GoogleDocInputCheckerComponent link={casoNegocio} setLink={setCasoNegocio} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Enunciado trabajo</Form.Label>
                                        <GoogleDocInputCheckerComponent link={enunciadoTrabajo} setLink={setEnunciadoTrabajo} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            {/* <Form.Check inline label="Pendiente Asignacion" checked={pendienteAsignacion} value={pendienteAsignacion} onChange={e=>setPendienteAsignacion(e.target.checked)} />
                                <Form.Check inline label="Documentacion Adjunta" checked={documentacionAdjunta} onChange={e=>setDocumentacionAdjunta(e.target.checked)} value={documentacionAdjunta} />
                                <Form.Check inline label="Contrato" onChange={e=>setContrato(e.target.checked)} value={contrato} checked={contrato}/>
                                <Form.Check inline label="Caso Negocio" onChange={e=>setCasoNegocio(e.target.checked)} value={casoNegocio} checked={casoNegocio} /> */}
                            {/*<Form.Group controlId="portafolio">
                                <Form.Label>Portafolio</Form.Label>
                                <Form.Control
                                    autoFocus
                                    autoComplete="off"
                                    type="text"
                                    value={portafolio}
                                    onChange={e => setPortafolio(e.target.value)}
                                />
                            </Form.Group>*/}
                            <Form.Group controlId="programa">
                                <Form.Label>Programa</Form.Label>
                                <Form.Control
                                    autoFocus
                                    autoComplete="off"
                                    type="text"
                                    value={programa}
                                    onChange={e => setPrograma(e.target.value)}
                                />
                            </Form.Group>
                            <h2
                                onClick={() => setOpenPrimeraParte(!openPrimeraParte)}
                                aria-controls="primera-parte-expand"
                                aria-expanded={openPrimeraParte}
                            >Información Previa <span className={`bi ${openPrimeraParte ? "bi-chevron-up" : "bi-chevron-down"} pull-end`}></span></h2>
                            <Collapse in={openPrimeraParte} >
                                <div>
                                    <Form.Group controlId="justificacion">
                                        <Form.Label>Justificación {esActividad ? "de la Actividad" : "del Proyecto"}</Form.Label>
                                        <Form.Control
                                            autoFocus
                                            autoComplete="off"
                                            type="text"
                                            as="textarea"
                                            value={justificacion}
                                            onChange={e => setJustificacion(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="descripcionNoDisponibilidad">
                                        <Form.Label>Descripción {esActividad ? "de la Actividad" : "del Proyecto"}</Form.Label>
                                        <Form.Control
                                            autoFocus
                                            autoComplete="off"
                                            as="textarea"
                                            type="text"
                                            value={descripcionNoDisponibilidad}
                                            onChange={e => setDescripcionNoDisponibilidad(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="analisisViabilidad">
                                        <Form.Label>Análisis previo de viabilidad / Caso de Negocio / Criterios de negocio</Form.Label>
                                        <Form.Control
                                            autoFocus
                                            autoComplete="off"
                                            type="text"
                                            as="textarea"
                                            value={analisisViabilidad}
                                            onChange={e => setAnalisisViabilidad(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>
                            </Collapse>
                            <h2
                                onClick={() => setOpenSegundaParte(!openSegundaParte)}
                                aria-controls="segunda-parte-expand"
                                aria-expanded={openSegundaParte}
                            >Objetivos {esActividad ? "de la Actividad" : "del Proyecto"}<span className={`bi ${openSegundaParte ? "bi-chevron-up" : "bi-chevron-down"} pull-end`}></span></h2>
                            <Collapse in={openSegundaParte} >
                                <div>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="objetivoDescripcion">
                                                <Form.Label>Objetivos {esActividad ? "de la Actividad" : "del Proyecto"} y CPD (Costo, Plazo y Desempeño) – De alto Nivel</Form.Label>
                                                <Form.Control
                                                    autoFocus
                                                    autoComplete="off"
                                                    type="text"
                                                    as="textarea"
                                                    value={objetivoDescripcion}
                                                    onChange={e => setObjetivoDescripcion(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    {/*<Row>
                                        <Col>
                                            <Form.Group controlId="objetivoCosto">
                                                <Form.Label>Costo</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Prepend>
                                                        <InputGroup.Text><strong>$</strong></InputGroup.Text>
                                                    </InputGroup.Prepend>
                                                    <Form.Control
                                                        autoFocus
                                                        autoComplete="off"
                                                        type="text"
                                                        value={objetivoCosto}
                                                        onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, setObjetivoCosto)}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="objetivoPlazo">
                                                <Form.Label>Plazo</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Prepend>
                                                        <InputGroup.Text><i className="bi bi-calendar"></i></InputGroup.Text>
                                                    </InputGroup.Prepend>
                                                    <Form.Control
                                                        autoFocus autoComplete="off" type="text"
                                                        value={objetivoPlazo}
                                                        onChange={e => regexValidator(e, /^\d+$/g, setObjetivoPlazo)}
                                                    />
                                                     <DropdownButton
                                                        variant="outline-secondary"
                                                        title={getPlazoPeriodoTitle()}
                                                        id="input-dropdown-button"
                                                        onSelect={(e) => {
                                                            setPlazoPeriodo(e)

                                                        }}
                                                    >
                                                        {values.map( val => (
                                                            <Dropdown.Item eventKey={val.clave}>{val.valor}</Dropdown.Item>
                                                        ))}
                                                    </DropdownButton>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="objetivoDesempeno">
                                                <Form.Label>Desempeño</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Prepend>
                                                        <InputGroup.Text><strong>%</strong></InputGroup.Text>
                                                    </InputGroup.Prepend>
                                                    <Form.Control
                                                        autoFocus
                                                        autoComplete="off"
                                                        type="text"
                                                        value={objetivoDesempeno}
                                                        onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, setObjetivoDesempeno)}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>*/}
                                </div>
                            </Collapse>
                            {/*<h2
                                onClick={() => setOpenTerceraParte(!openTerceraParte)}
                                aria-controls="tercera-parte-expand"
                                aria-expanded={openTerceraParte}
                            >Descripción del proyecto a alto nivel<span className={`bi ${openTerceraParte ? "bi-chevron-up" : "bi-chevron-down"} pull-end`}></span></h2>
                            <Collapse in={openTerceraParte}>
                                <div>
                                    <div>
                                        <h3>Alcance del Proyecto</h3>
                                        <Form.Group controlId="principales-entregables">
                                            <Form.Label>Principales Entregables</Form.Label>
                                            <InputTextList list={alcanceEntregables} setList={setAlcanceEntregables} />
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <h3>Tiempo/Plazo</h3>
                                        <Form.Group controlId="plazoProyecto">
                                            <Form.Label>Duración de Proyecto: {showDuration(tiempoDuracion)}</Form.Label>
                                            <Form.Control
                                                autoFocus
                                                autoComplete="off"
                                                type="range"
                                                value={tiempoDuracion}
                                                onChange={e => setTiempoDuracion(e.target.value)}
                                                min={1} max={365 * 5}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="fechas-criticas">
                                            <Form.Label>Fechas Criticas</Form.Label>
                                            <InputTextListWithDate list={tiempoFechasCriticas} setList={setTiempoFechasCriticas} duration={tiempoDuracion} />
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <h3>Costos</h3>
                                        {
                                            (costoEntregable.length > 0) && (
                                                <Form.Group controlId="costo-entregables">
                                                    <Form.Label>Costos por Entregables</Form.Label>
                                                    <InputCostToList costoList={costoEntregable} setResultCostoList={setCostoEntregable} ></InputCostToList>
                                                </Form.Group>

                                            )
                                        }
                                        <Form.Group controlId="reserva-contingencia">
                                            <Form.Label>Reserva / Contingencia </Form.Label>
                                            <Form.Control
                                                autoFocus
                                                autoComplete="off"
                                                type="text"
                                                value={costoReservaContingencia}
                                                onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, setCostoReservaContingencia)}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="reserva-gestion">
                                            <Form.Label>Reserva de Gestion </Form.Label>
                                            <Form.Control
                                                autoFocus
                                                autoComplete="off"
                                                type="text"
                                                value={costoReservaGestion}
                                                onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, setCostoReservaGestion)}
                                            />
                                        </Form.Group>
                                    </div>
                                    {
                                        (costoEntregable.length > 0) && (
                                            <div>
                                                <h3>Calidad / Requisitos Funcionales / Requistos del Cliente</h3>
                                                <Form.Group controlId="metricas-criterios">
                                                    <Form.Label>Métrica / Criterios de Aceptación </Form.Label>
                                                    <InputCriteriosInput criteriosList={calidadMetricas} setCriterioList={setCalidadMetricas} />
                                                </Form.Group>
                                            </div>)
                                    }
                                </div>
                            </Collapse>*/}
                            {/*<h2
                                onClick={() => setOpenCuartaParte(!openCuartaParte)}
                                aria-controls="tercera-parte-expand"
                                aria-expanded={openCuartaParte}
                            >Riesgos Críticos<span className={`bi ${openCuartaParte ? "bi-chevron-up" : "bi-chevron-down"} pull-end`}></span></h2>
                            <Collapse in={openCuartaParte}>
                                <div>
                                    <Form.Group controlId="riesgos-criticos">
                                        <InputRiesgosList riesgosList={riesgos} setRiesgosList={setRiesgos}></InputRiesgosList>
                                    </Form.Group>
                                </div>
                            </Collapse>*/}
                            <h2
                                onClick={() => setOpenQuintaParte(!openQuintaParte)}
                                aria-controls="quinta-parte-expand"
                                aria-expanded={openQuintaParte}
                            >Alcance <span className={`bi ${openQuintaParte ? "bi-chevron-up" : "bi-chevron-down"} pull-end`}></span></h2>
                            <Collapse in={openQuintaParte} >
                                <div>
                                    <Form.Group controlId="recursosRequeridos">
                                        <Form.Label>Recuros Requeridos</Form.Label>
                                        <Form.Control
                                            autoFocus
                                            autoComplete="off"
                                            type="text"
                                            as="textarea"
                                            value={recursosRequeridos}
                                            onChange={e => setRecursosRequeridos(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="supuestos">
                                        <Form.Label>Supuestos</Form.Label>
                                        <Form.Control
                                            autoFocus
                                            autoComplete="off"
                                            as="textarea"
                                            type="text"
                                            value={supuestos}
                                            onChange={e => setSupuestos(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="restricciones">
                                        <Form.Label>Restricciones</Form.Label>
                                        <Form.Control
                                            autoFocus
                                            autoComplete="off"
                                            type="text"
                                            as="textarea"
                                            value={restricciones}
                                            onChange={e => setRestricciones(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>
                            </Collapse>
                            <h2
                                onClick={() => setOpenSextaParte(!openSextaParte)}
                                aria-controls="quinta-parte-expand"
                                aria-expanded={openSextaParte}
                            >Nivel De Autoridad Y Decisión Del Director De Proyecto

                                <span className={`bi ${openSextaParte ? "bi-chevron-up" : "bi-chevron-down"} pull-end`}></span></h2>
                            <Collapse in={openSextaParte} >
                                <div>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="maxDesviacionPresupuesto">
                                                <Form.Label>Máxima Desviación sobre Presupuesto</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Prepend>
                                                        <InputGroup.Text><strong>$</strong></InputGroup.Text>
                                                    </InputGroup.Prepend>
                                                    <Form.Control
                                                        autoFocus
                                                        autoComplete="off"
                                                        type="text"
                                                        value={maxDesvioPresupuesto}
                                                        onChange={e => regexValidator(e, /^\d+(\.\d{0,2})?$/g, setMaxDesvioPresupuesto)}
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="maxDesviacionTiempo">
                                                <Form.Label>Máxima Desviacón sobre Tiempo</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Prepend>
                                                        <InputGroup.Text><i className="bi bi-calendar"></i></InputGroup.Text>
                                                    </InputGroup.Prepend>
                                                    <Form.Control
                                                        autoFocus autoComplete="off" type="text"
                                                        value={maxDesvioTiempo}
                                                        onChange={e => regexValidator(e, /^\d+$/g, setMaxDesvioTiempo)}
                                                    />
                                                    <DropdownButton
                                                        variant="outline-secondary"
                                                        title={getDesviacionPeriodoTitle()}
                                                        id="input-dropdown-button"
                                                        onSelect={(e) => {
                                                            setMaxDesviacionPeriodo(e)

                                                        }}
                                                    >
                                                        {values.map( val => (
                                                            <Dropdown.Item eventKey={val.clave}>{val.valor}</Dropdown.Item>
                                                        ))}
                                                    </DropdownButton>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="tareasFunciones">
                                                <Form.Label>Tareas y Funciones</Form.Label>
                                                <Form.Control
                                                    autoFocus
                                                    autoComplete="off"
                                                    type="text"
                                                    as="textarea"
                                                    value={tareasFunciones}
                                                    onChange={e => setTareasFunciones(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        {/*<Col>
                                            <Form.Group controlId="tiposInform">
                                                <Form.Label>Tipos de Informe</Form.Label>
                                                <Form.Control
                                                    multiple
                                                    autoFocus
                                                    as="select"
                                                    value={tiposInformes}
                                                    onChange={handleMultipleTipoInforme}
                                                >
                                                    <option value="1">Comienzo de Proyecto</option>
                                                    <option value="2">Reuniones Semanales</option>
                                                    <option value="4">Reuniones Mensuales</option>
                                                    <option value="8">Reuniones Trimestrales</option>
                                                    <option value="16">Cuando Ocurran Eventos Importantes</option>
                                                    <option value="32">Conclusion del proyecto</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>*/}
                                        <Col>
                                            <Row>
                                                <Col>
                                                    <Form.Group controlId="incentivo">
                                                        <Form.Label>Incentivo</Form.Label>
                                                        <Form.Control
                                                            autoFocus
                                                            autoComplete="off"
                                                            type="text"
                                                            as="textarea"
                                                            value={incentivo}
                                                            onChange={e => setIncentivo(e.target.value)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col className="h-100">
                                                    <Form.Group controlId="autorizadoFirmasExternas">
                                                        <Form.Check inline type="checkbox" label="Autorizado para firmas externos al proyecto"
                                                            value={autorizadoFirmasExternas} onChange={e => setAutorizadoFirmasExternas(e.target.checked)} checked={autorizadoFirmasExternas}></Form.Check>
                                                    </Form.Group>
                                                    <Form.Group controlId="objetivoDesempeno">
                                                        <Form.Check inline type="checkbox" label="Autoridad Control de Cambios"
                                                            value={autoridadControlCambios} onChange={e => setAutoridadControlCambios(e.target.checked)} checked={autoridadControlCambios}></Form.Check>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>

                                </div>

                            </Collapse>

                            <div className="mt-5 pb-5">
                                <LoaderButton
                                    type="submit"
                                    className="btn-success btn-save"
                                    disabled={!validateForm()}
                                    onClick={handleSubmit}
                                >
                                    Guardar Cambios
                                </LoaderButton>

                            </div>
                        </Tab.Pane>
                        {/* Analisis Ambiental */}
                        <Tab.Pane eventKey="analisis-Ambiental">
                            <Form className="blue">
                                <h2 className="mb-4 text-center">Modelo de Decisión Ambiental</h2>

                                {/* Fila con los números de las preguntas */}
                                <Row className="mb-4 justify-content-center">
                                    {criteria.map((item, index) => (
                                        <Col key={index} md={1} className="text-center">
                                            <Button
                                                variant={item.rating > 0 ? 'secondary' : 'outline-primary'} // Cambia a gris si tiene calificación
                                                onClick={() => handleSelectQuestion(index)}
                                                className="p-3 rounded-circle shadow-sm"
                                                disabled={item.rating > 0} // Deshabilita el botón si ya tiene calificación
                                            >
                                                {index + 1}
                                            </Button>
                                        </Col>
                                    ))}
                                </Row>

                                <Row className="align-items-center justify-content-center">
                                    {/* Mostrar pregunta y calificación */}
                                    <Col md={6} className="mb-4">
                                        {criteria.length > 0 && (
                                            <div className="p-4 border rounded-lg shadow bg-white">
                                                <Form.Label className="mb-2 text-secondary"><strong>{criteria[selectedQuestionIndex]?.criterion}</strong></Form.Label>
                                                <Form.Group>
                                                    <Form.Label className="small text-muted">Calificación:</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        max="4"
                                                        value={criteria[selectedQuestionIndex]?.rating || ''}
                                                        onChange={handleValoracionChange}
                                                        placeholder="0 - 4"
                                                        className="text-center border-success rounded-pill"
                                                    />
                                                </Form.Group>
                                            </div>
                                        )}
                                    </Col>

                                    {/* Leyenda de puntuación */}
                                    <Col md={3} className="mb-4">
                                        <Card className="border-info">
                                            <Card.Header className="bg-info text-white text-center">
                                                <strong>Leyenda de Puntuación</strong>
                                            </Card.Header>
                                            <Card.Body>
                                                <table className="table table-sm table-borderless mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '70%' }}>Descripción</th>
                                                            <th className="text-center" style={{ width: '30%' }}>Puntuación</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>NO</td>
                                                            <td className="text-center">0</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Aún no, pero trabajando en ello</td>
                                                            <td className="text-center">1</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Algo</td>
                                                            <td className="text-center">2</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Casi completo</td>
                                                            <td className="text-center">3</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Sí</td>
                                                            <td className="text-center">4</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Form>
                        </Tab.Pane>

                        <Tab.Pane eventKey="to-do">
                            <TodoList toDo={todoList} setToDos={setTodoList} enableCheck={false}></TodoList>
                        </Tab.Pane>
                    </Tab.Content>
                </div>
            </Tab.Container>
        </div>
    )
}

const mapStateToProps = state => ({
    isLoading: selectors.getIsLoading(state),
    usuario: sessionSelectors.getUser(state),
    tipoProyectoList: tipoProyectoSelector.getTipoProyectoList(state)
});

export default connect(mapStateToProps)(ProyectoNew);
