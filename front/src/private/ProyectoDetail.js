/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import LoaderButton from "../components/loaderButton/LoaderButton";
import { Form, Col, Row, InputGroup, Button, DropdownButton, Dropdown } from "react-bootstrap";
import "./ProyectoNew.css"
import { actions, selectors } from "../reducers/project";
import { actions as routesActions } from "../reducers/routes";
import { actions as tipoProyectoAction, selectors as tipoProyectoSelector } from "../reducers/tipoProyecto";
import { selectors as batchSelectors } from "../reducers/batch";
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import { onError } from "../libs/errorLib";
import { useParams } from 'react-router-dom'
import regexValidator from "../libs/regexValidator";
import InputTextList from "../components/inputList/InputTextList";
import moment from "moment";
import InputTextListWithDate from "../components/inputList/InputTexListWithDate";
import InputCostToList from "../components/inputList/InputCostToList";
import InputCriteriosInput from "../components/inputList/InputCriteriosInput"
import InputRiesgosList from "../components/inputList/InputRiesgosList";
import Collapse from "react-bootstrap/Collapse"
import GoogleDocInputCheckerComponent from "../components/custom/GoogleDocInputCheckerComponent";
import { DownloadPdfButton } from "../components/downloadPdfButton/downloadPdfButton";
import { ProyectoPdf } from "./ProyectosReport";
import TodoList from "../components/todoList/TodoList";
import Kanban from "../components/kanban/Kanban";
import { toast } from "react-toastify";
import { actions as kanbanActions } from "../reducers/kanban";

import { GeneralDataComponent, PriorizationDataComponent } from '../components/proyectoDetails/tabbedComponents'
import { AnalisisAmbiental } from '../components/ProyectoDetailAnalisis/AnalisisImpacto'
import { ViewAnalisisAmbiental } from '../components/ProyectoDetailAnalisis/ViewAnalisisAmbiental'
import { selectors as sessionSelectors } from "../reducers/session";
import { selectors as personaSelectors, actions as personaActions } from "../reducers/persona";
import {ViewInteresados} from "../components/ProyectoDetailMatriz/ViewInteresados";
import { CreateInteresados } from "../components/ProyectoDetailMatriz/CreateInteresados";
import Task from "../components/kanban/Task";
import { getInteresadosByProjectId } from "../api";

// nuevos componentes para alcance/hitos/costo/calidad
import InputAlcanceList from "../components/inputList/InputAlcanceList";
import InputHitosList from "../components/inputList/InputHitosList";
import InputCostosList from "../components/inputList/InputCostosList";
import InputCalidadList from "../components/inputList/InputCalidadList";

//gantt
import GanttChart from "../components/GanttChart/GanttChart";

//pizarra
import Whiteboard from "../components/pizarra/Whiteboard";


function ProyectoDetail({ dispatch, persona, isLoading, usuario, projectDetail, batchFrom, batchLoading, todo, showNotification, tipoProyectoList, analysisData, respuestaAnalisisAmbiental, setInteresado, interesado }) {
    const routeParams = useParams();
    const [activeKey, setActiveKey] = useState('general');
    // const [interesado, setInteresado] = useState([]);
    const [taskFilter, setTaskFilter] = useState("");
    const esActividad = projectDetail?.modo === "A";
    const disableEdit = projectDetail?.estado === "E";
    const iniciado = projectDetail?.estado === "S";
    const planificado = projectDetail?.estado === "P";
    const ejecutado = projectDetail?.estado === "X";
    const [projectId, setProjectId] = useState(null) 

    if (localStorage.getItem("modo") === "Demo" && !esActividad) {
        dispatch(routesActions.goTo(`membership`));
    }


    const [editMode, setEditMode] = useState(false)

    // Combos Seccion Descripcion del proyecto a alto nivel - periodo de tiempo
    const values = [
        {clave: "D", valor: "Día"},
        {clave: "M", valor: "Mes"},
        {clave: "A", valor: "Año"},
    ]

    const numericId = parseInt(routeParams.id, 10);
    useEffect(() => {
        if (numericId) {
            dispatch(actions.getAnalisisAmbientalRequest(numericId));
        }
    }, [numericId, dispatch]);

    useEffect(() => {
        if (numericId) {
            dispatch(actions.getRespuestaAnalisisAmbientalRequest(numericId))
            // respuestaAnalisisAmbiental[];
        }
    }, [numericId, dispatch]); 

    useEffect(() => {
        if (numericId) {
            dispatch(actions.getInteresadoList(numericId));
        }
    }, [numericId], dispatch);

    // console.log({ interesados });


    const TIPO_PROYECTO_AGIL = "1"
    const TIPO_PROYECTO_PREDICTIVO = "2"
    const TIPO_PROYECTO_HIBRIDO = "3"

    const clearConstitutionFields = () => {
        // Booleans
        setPendienteAsignacion(false);
        setAutorizadoFirmasExternas(false);
        setAutoridadControlCambios(false);

        // Enlaces de Google Docs
        setDocumentacionAdjunta("");
        setContrato("");
        setCasoNegocio("");
        setEnunciadoTrabajo("");

        // Campos de texto simples
        setPrograma("");
        setJustificacion("");
        setDescripcion("");
        setAnalisisViabilidad("");
        setObjetivoDescripcion("");
        setRecursosRequeridos("");
        setSupuestos("");
        setRestricciones("");
        setTareasFunciones("");
        setIncentivo("");

        // Campos numéricos o validados con regex
        setMaxDesvioPresupuesto("");
        setMaxDesvioTiempo("");

        // Selects / dropdowns relacionados
        setMaxDesviacionPeriodo(""); // asegúrate de usar el mismo nombre exacto del estado
        setPlazoPeriodo("");

        // Si usas flags para los collapses
        setOpenPrimeraParte(false);
        setOpenSegundaParte(false);
        setOpenQuintaParte(false);
        setOpenSextaParte(false);
    };

    const loadFromDetail = () => {
        setProjectId(projectDetail?.id)
        setNumeroProyecto(projectDetail?.numero ?? "")
        setNombreProyecto(projectDetail?.nombre ?? "")

        setDirectorProyecto("")
        if (projectDetail?.DirectorProyecto?.Persona) {
            const nombreDirectorProyecto = `${projectDetail?.DirectorProyecto?.Persona?.nombre} ${projectDetail?.DirectorProyecto?.Persona?.apellido}`
            setDirectorProyecto(nombreDirectorProyecto);
        }  


        setPatrocinadorProyecto("")
        if (projectDetail?.Patrocinador?.Persona) {
            const nombrePatrocinador = `${projectDetail?.Patrocinador?.Persona?.nombre} ${projectDetail?.Patrocinador?.Persona?.apellido}`
            setPatrocinadorProyecto(nombrePatrocinador);
        }        
        setDepartamento(projectDetail?.Departamento?.nombre)
        setInformacionBreve(projectDetail?.informacion)
        setPendienteAsignacion(projectDetail?.pendiente_asignacion)
        setDocumentacionAdjunta(projectDetail?.documentacion_adjunta)
        setContrato(projectDetail?.contrato)
        setCasoNegocio(projectDetail?.caso_negocio)
        setEnunciadoTrabajo(projectDetail?.enunciado)
        setPortafolio(projectDetail?.portafolio)
        setPrograma(projectDetail?.programa)
        setJustificacion(projectDetail?.justificacion)
        setDescripcion(projectDetail?.descripcion)
        setAnalisisViabilidad(projectDetail?.analisis_viabilidad)
        setObjetivoDescripcion(projectDetail?.objetivo_desc)
        setObjetivoCosto(projectDetail?.objetivo_costo)
        setObjetivoPlazo(projectDetail?.objetivo_plazo)
        setObjetivoDesempeno(projectDetail?.objetivo_desempeno)
        setAlcanceEntregables(projectDetail?.alcance_entregables)
        setTiempoDuracion(projectDetail?.tiempo_duracion)
        setTiempoFechasCriticas(projectDetail?.tiempo_fechas_criticas)
        setCostoEntregable(projectDetail?.costo_entregable)
        setCostoReservaContingencia(projectDetail?.costo_reserva_contingencia)
        setCostoReservaGestion(projectDetail?.costo_reserva_gestion)
        setCalidadMetricas(projectDetail?.calidad_metricas)
        setRiesgos(projectDetail?.riesgos)
        setRecursosRequeridos(projectDetail?.recursos_requeridos)
        setSupuestos(projectDetail?.supuestos)
        setRestricciones(projectDetail?.restricciones)
        setMaxDesvioPresupuesto(projectDetail?.max_desvio_presupuesto)
        setMaxDesvioTiempo(projectDetail?.max_desvio_tiempo)
        setAutorizadoFirmasExternas(projectDetail?.dir_autorizado_firmas)
        setTareasFunciones(projectDetail?.dir_tareas_funciones)
        setTiposInformes(projectDetail?.tipos_informes)
        setIncentivo(projectDetail?.incentivo)
        setAutoridadControlCambios(projectDetail?.autidad_control_cambios)
        setPlazoPeriodo(projectDetail?.plazo_periodo)
        setMaxDesviacionPeriodo(projectDetail?.max_desviacion_periodo)
        setTipoProyecto(projectDetail?.tipo_proyecto)
    }


    useEffect(() => {
        if (routeParams.id) {
            clearConstitutionFields(); // limpia primero
            dispatch(actions.getProjectDetailRequest(routeParams.id)); // luego pide los nuevos
        }
    }, [routeParams.id, dispatch]);

    useEffect(() => {
        console.log(projectDetail);
        if (projectDetail && projectDetail.id === parseInt(routeParams.id)) {
            loadFromDetail();
        }
    }, [projectDetail, routeParams.id]);

    useEffect(() => {
        dispatch(tipoProyectoAction.getTipoProyecto())
    }, [])

    const [numeroProyecto, setNumeroProyecto] = useState("");
    const [nombreProyecto, setNombreProyecto] = useState("");
    const [directorProyecto, setDirectorProyecto] = useState("");
    const [patrocinadorProyecto, setPatrocinadorProyecto] = useState("");
    const [departamento, setDepartamento] = useState("");
    const [informacionBreve, setInformacionBreve] = useState("");
    const [pendienteAsignacion, setPendienteAsignacion] = useState(true);
    const [documentacionAdjunta, setDocumentacionAdjunta] = useState("");
    const [contrato, setContrato] = useState("");
    const [casoNegocio, setCasoNegocio] = useState("");
    const [enunciadoTrabajo, setEnunciadoTrabajo] = useState('');
    const [portafolio, setPortafolio] = useState("");
    const [programa, setPrograma] = useState("");
    const [justificacion, setJustificacion] = useState("");
    const [descripcion, setDescripcion] = useState("");
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
    const [presupuesto, setPresupuesto] = useState(0) // NUEVO
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

    const isFirstRender = useRef(true);

    const calculateTotalCost = () => {
        let total = 0
        if (costoEntregable){
            costoEntregable.forEach((cost) => {
                total += parseFloat(cost.costo || 0)
            });
        }
        return total
    }

    useEffect(() => {
        const totalEntregables = calculateTotalCost()
        const totalPresupuesto =
            parseFloat(costoReservaContingencia || 0) +
            parseFloat(costoReservaGestion || 0) +
            totalEntregables

        setPresupuesto(totalPresupuesto)
    }, [costoReservaContingencia, costoReservaGestion, costoEntregable])

    useEffect(() => {
        /*function initCostoEntregable() {
            let newCostoEntregable = []
            if (costoEntregable?.length > alcanceEntregables?.length)
                newCostoEntregable = costoEntregable.filter(item => alcanceEntregables.includes(item.entregable))
            if (alcanceEntregables?.length > costoEntregable?.length)            
                newCostoEntregable = [...costoEntregable, { entregable: alcanceEntregables[alcanceEntregables.length - 1], costo: 0 }]
            setCostoEntregable(newCostoEntregable)
        }*/
        function initCostoEntregable() {
            const newCostoEntregable = alcanceEntregables.map(entregable => {
                const existing = (costoEntregable || []).find(item => item.entregable === entregable)
                return existing ? existing : { entregable, costo: 0 }
            })
            setCostoEntregable(newCostoEntregable)
        }
        function initCalidadMetricas() {
            const newCalidadMetricas = alcanceEntregables.map(entregable => {
                const existing = (calidadMetricas || []).find(item => item.entregable === entregable)
                return existing ? existing : { entregable, metrica: '' }
            })
            setCalidadMetricas(newCalidadMetricas)
        }
        /*function initCalidadMetricas() {
            let newCalidadMetricas = []
            if (calidadMetricas?.length > alcanceEntregables?.length)
                newCalidadMetricas = calidadMetricas.filter(item => alcanceEntregables.includes(item.entregable))
            if (alcanceEntregables?.length > calidadMetricas?.length)
                newCalidadMetricas = [...calidadMetricas, { entregable: alcanceEntregables[alcanceEntregables.length - 1], metrica: '' }]
            setCalidadMetricas(newCalidadMetricas)
        }*/

        if (calidadMetricas?.length !== alcanceEntregables?.length)
            initCalidadMetricas()
        if (costoEntregable?.length !== alcanceEntregables?.length)
            initCostoEntregable()
    }, [alcanceEntregables])

    const handleMultipleTipoInforme = event => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        const newTiposInformes = !tiposInformes ? [] : [...tiposInformes];

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
        };
        payload = appendActaDeInicio(payload);
        dispatch(actions.updateProject(routeParams.id,payload));
    }

    function handleSubmitDatosGenerales(event) {
        event.preventDefault();
        let payload = {
            nombreProyecto,
            directorProyecto,
            patrocinadorProyecto,
            departamento,
            informacionBreve,
            tipoProyecto,
        };
        
        dispatch(actions.updateProjectGeneralData(routeParams.id,payload));
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (showNotification) {
            const { show, isSuccess, message } = showNotification;
            if (show === true) {
                if (isSuccess === true) {
                    toast.success(message)
                } else {
                    toast.error("Ocurrio un error, intentelo nuevamente")
                }
            }
        }
    }, [showNotification])

    // console.log({usuario});

    const appendActaDeInicio = initialPayload => {
        let result = {
            ...initialPayload,
            pendienteAsignacion,
            documentacionAdjunta,
            contrato,
            casoNegocio,
            enunciadoTrabajo,
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
            ...(plazoPeriodo && {plazoPeriodo}),
            ...(maxDesviacionPeriodo && {maxDesviacionPeriodo}),
            autoridadControlCambios
        }

        return result;
    }

    const handleChangeTab = (key) => {
        setActiveKey(key)
        if (key === 'to-do') {
            dispatch(actions.getTasksById({ idProject: routeParams.id, done: false}))
        }
        if (key === 'project-management') {
            dispatch(kanbanActions.fetch({ projectId: routeParams.id }))
        }
        if (key === 'Analisis-ambiental') {
            // dispatch(actions.getAnalisisAmbientalRequest({ proyectoId: routeParams.id }))
        }
    }

    const handleFilterChange = (e) => {
        const value = e.target.value;
        setTaskFilter(value);

        // recargar tareas con el filtro nuevo (si ya estamos en la pestaña TO DO)
        if (activeKey === "to-do") {
            dispatch(
                actions.getTasksById({ idProject: routeParams.id, done: value })
            );
        }
    };

    const isTodoOrKanban = () => (activeKey === 'to-do' || activeKey === 'project-management' || activeKey === 'Analisis-ambiental')


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

    const toggleEdit = ()=>{
        setEditMode(!editMode)
    }

    const addTaskHandler = task => {
        dispatch(actions.insertToDoTask({...task, proyectoId: routeParams.id, dueDate: moment(task.dueDate,'DD/MM/YYYY').format('YYYY-MM-DD')}))
    }

    const doneTask = (taskId, closeDate) => {
        dispatch(actions.doneTask(taskId, closeDate));
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
            <Tab.Container defaultActiveKey="general" activeKey={activeKey} onSelect={setActiveKey}>

                <div className="submenu-container">
                    <div className="title-container">
                        <h1 className="blue text-capitalize">{nombreProyecto}</h1>
                    </div>
                    <div className="widget-container d-inline-flex">
                        {/* Verificar si estamos en el modo de editar o visualizar, pero no mostrar en 'Crear-Interesado' ni en 'Matriz-Interesados' */}
                        {!isTodoOrKanban() && !(activeKey === 'Crear-Interesado' || activeKey === 'Matriz-Interesados') && (
                            <>
                                {/* Mostrar el botón de editar o visualizar dependiendo del estado de editMode */}
                                {!disableEdit && (
                                    <>
                                        <div className="green" style={{ cursor: 'pointer' }} onClick={() => toggleEdit()}>
                                            <i className={`bi ${!editMode ? 'bi-pencil-square' : 'bi-eye'} mr-2`} />
                                            {editMode ? 'Visualizar' : 'Editar'}
                                        </div>
                                        <div className="vertical-separator mx-2" ></div>
                                    </>
                                )}
                                {/* Mostrar el botón para descargar el acta solo si estamos en 'general' o 'constitution' */}
                                <div className="download-document">
                                    {(activeKey === 'general' || activeKey === 'constitution' || activeKey === 'riesgos' || activeKey === 'alcance' || activeKey === 'hitos' || activeKey === 'costos' || activeKey === 'calidad') && (
                                        <DownloadPdfButton reportPrefix="Proyecto" pdfReport={<ProyectoPdf proyecto={projectDetail} disabled />}>
                                            <div className="green" style={{ cursor: 'pointer' }}><i className="bi bi-cloud-download mr-2 disabled" />Descargar Acta</div>
                                        </DownloadPdfButton>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Condición para mostrar "Crear Interesado" solo cuando estamos en 'Matriz-Interesados' */}
                        {activeKey === 'Matriz-Interesados' && !editMode && (
                            <>
                                <div
                                    className="green"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setActiveKey('Crear-Interesado')} // Cambiar a "Crear-Interesado"
                                >
                                    <i className="bi bi-plus-circle mr-2" /> Crear Interesado
                                </div>
                            </>
                        )}

                        {/* Cuando estamos en 'Crear-Interesado', permitir volver */}
                        {activeKey === 'Crear-Interesado' && !editMode && (
                            <>
                                <div className="vertical-separator mx-2"></div>
                                <div
                                    className="green"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setActiveKey('Matriz-Interesados')} // Cambiar a "Matriz-Interesados"
                                >
                                    <i className="bi bi-arrow-left mr-2" /> Volver a Ver Interesados
                                </div>
                            </>
                        )}
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
                            {(planificado || ejecutado) && (
                                <>
                                    <Nav.Item>
                                        <Nav.Link eventKey="Matriz-Interesados">Interesados </Nav.Link>
                                    </Nav.Item>
                                    {!esActividad && (
                                        <>
                                        <Nav.Item>
                                            <Nav.Link eventKey="Analisis-ambiental">Analisis Ambiental</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="alcance">Alcance</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="hitos">Hitos</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="costos">Costos</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="calidad">Calidad</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="riesgos">Riesgos</Nav.Link>
                                        </Nav.Item>
                                        </>
                                    )}
                                    <Nav.Item>
                                        <Nav.Link eventKey="to-do" >To Do</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="project-management">Kanban</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="gantt">Gantt</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="pizarra">Pizarra</Nav.Link>
                                    </Nav.Item>
                                </>
                            )}
                            
                            
                        </Nav>
                    </div>
                </div>


                <div className="container">
                    {/* <h1 className="orange">Creación de Nuevo Proyecto</h1> */}
                    <br />
                    <Tab.Content>
                        <Tab.Pane eventKey="general"><Form className="blue" >
                            <Form.Group controlId="proyecto">
                                <Form.Label>{esActividad ? "Actividad" : "Proyecto"}</Form.Label>
                                <Form.Control
                                    disabled={!editMode}
                                    autoComplete="off"
                                    type="text"
                                    value={nombreProyecto}
                                    onChange={e => setNombreProyecto(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="directorProyecto">
                                <Form.Label>{esActividad ? "Director de la Actividad" : "Director del Proyecto"}</Form.Label>
                                <Form.Control
                                    disabled={!editMode}
                                    autoComplete="off"
                                    type="text"
                                    value={directorProyecto}
                                    onChange={e => setDirectorProyecto(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="patrocinadorProyecto">
                                <Form.Label>{esActividad ? "Patrocinador de la Actividad" : "Patrocinador del Proyecto"}</Form.Label>
                                <Form.Control
                                    disabled={!editMode}
                                    autoComplete="off"
                                    type="text"
                                    value={patrocinadorProyecto}
                                    onChange={e => setPatrocinadorProyecto(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="departamento">
                                <Form.Label>Departamento</Form.Label>
                                <Form.Control
                                    disabled={!editMode}
                                    autoComplete="off"
                                    type="text"
                                    value={departamento}
                                    onChange={e => setDepartamento(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="informacionBreve">
                                <Form.Label>Información breve</Form.Label>
                                <Form.Control
                                    disabled={!editMode}
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
                                    disabled={!editMode}
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




                            {/* Boton Guardar Datos Generales*/}
                            <div className="mt-5 pb-5"> {
                                editMode && (
                                    <LoaderButton
                                        type="submit"
                                        className="btn-success btn-save"
                                        disabled={!validateForm()}
                                        onClick={handleSubmitDatosGenerales}
                                    >
                                        Guardar Cambios
                                    </LoaderButton>
                                )
                            }
                            </div>
                            </Form>
                        
                        </Tab.Pane>
                        <Tab.Pane eventKey="constitution">
                            <Form.Group>
                                <Form.Check inline label="Pendiente Asignacion" checked={pendienteAsignacion} value={pendienteAsignacion} onChange={e => setPendienteAsignacion(e.target.checked)} disabled={!editMode} />
                            </Form.Group>
                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Director del Proyecto</Form.Label>
                                        <Form.Control type="text" value={directorProyecto} disabled />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Patrocinador del Proyecto</Form.Label>
                                        <Form.Control type="text" value={patrocinadorProyecto} disabled />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Documentacion Adjunta</Form.Label>
                                        <GoogleDocInputCheckerComponent link={documentacionAdjunta} setLink={setDocumentacionAdjunta} disabled={!editMode} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Contrato</Form.Label>
                                        <GoogleDocInputCheckerComponent link={contrato} setLink={setContrato} disabled={!editMode} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Caso Negocio</Form.Label>
                                        <GoogleDocInputCheckerComponent link={casoNegocio} setLink={setCasoNegocio} disabled={!editMode} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Enunciado trabajo</Form.Label>
                                        <GoogleDocInputCheckerComponent link={enunciadoTrabajo} setLink={setEnunciadoTrabajo} disabled={!editMode} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            {/*<Form.Group controlId="portafolio">
                                <Form.Label>Portafolio</Form.Label>
                                <Form.Control
                                    disabled={!editMode}
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
                                    disabled={!editMode}
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
                                        <Form.Label>{esActividad ? "Justificación de la Actividad" : "Justificación del Proyecto"}</Form.Label>
                                        <Form.Control
                                            disabled={!editMode}
                                            autoFocus
                                            autoComplete="off"
                                            type="text"
                                            as="textarea"
                                            value={justificacion}
                                            onChange={e => setJustificacion(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="descripcion">
                                        <Form.Label>{esActividad ? "Descripción de la Actividad" : "Descripción del Proyecto"}</Form.Label>
                                        <Form.Control
                                            disabled={!editMode}
                                            autoFocus
                                            autoComplete="off"
                                            as="textarea"
                                            type="text"
                                            value={descripcion}
                                            onChange={e => setDescripcion(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="analisisViabilidad">
                                        <Form.Label>Análisis previo de viabilidad / Caso de Negocio / Criterios de negocio</Form.Label>
                                        <Form.Control
                                            disabled={!editMode}
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
                            >{esActividad ? "Objetivos de la Actividad" : "Objetivos del Proyecto"} <span className={`bi ${openSegundaParte ? "bi-chevron-up" : "bi-chevron-down"} pull-end`}></span></h2>
                            <Collapse in={openSegundaParte} >
                                <div>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="objetivoDescripcion">
                                                <Form.Label>Objetivos {esActividad ? "de la Actividad" : "del Proyecto"} y CPD (Costo, Plazo y Desempeño) – De alto Nivel</Form.Label>
                                                <Form.Control
                                                    disabled={!editMode}
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
                                                        disabled={!editMode}
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
                                                        disabled={!editMode}
                                                        autoFocus autoComplete="off" type="text"
                                                        value={objetivoPlazo}
                                                        onChange={e => regexValidator(e, /^\d+$/g, setObjetivoPlazo)}
                                                    />
                                                    <DropdownButton
                                                        disabled={!editMode}
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
                                                        disabled={!editMode}
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
                                            disabled={!editMode}
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
                                            disabled={!editMode}
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
                                            disabled={!editMode}
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
                            >Nivel De Autoridad Y Decisión Del Director De {esActividad ? "Actividad" : "Proyecto"} 

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
                                                        disabled={!editMode}
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
                                                        disabled={!editMode}
                                                        autoFocus autoComplete="off" type="text"
                                                        value={maxDesvioTiempo}
                                                        onChange={e => regexValidator(e, /^\d+$/g, setMaxDesvioTiempo)}
                                                    />
                                                    <DropdownButton
                                                        disabled={!editMode}
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
                                        <Col style={{flexDirection: 'column'}} className="d-flex align-items-start justify-content-center">
                                            <Form.Group controlId="autorizadoFirmasExternas">
                                                <Form.Check disabled={!editMode} inline type="checkbox" label="Autorizado para firmas externos al proyecto"
                                                    value={autorizadoFirmasExternas} onChange={e => setAutorizadoFirmasExternas(e.target.checked)} checked={autorizadoFirmasExternas}></Form.Check>
                                            </Form.Group>
                                            <Form.Group controlId="objetivoDesempeno">
                                                <Form.Check disabled={!editMode} inline type="checkbox" label="Autoridad Control de Cambios"
                                                    value={autoridadControlCambios} onChange={e => setAutoridadControlCambios(e.target.checked)} checked={autoridadControlCambios}></Form.Check>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="tareasFunciones">
                                                <Form.Label>Tareas y Funciones</Form.Label>
                                                <Form.Control
                                                    disabled={!editMode}
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
                                                    disabled={!editMode}
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
                                                            disabled={!editMode}
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
                                                {/*<Col className="h-100">
                                                    <Form.Group controlId="objetivoDesempeno">
                                                        <Form.Check disabled={!editMode} inline type="checkbox" label="Autoridad Control de Cambios"
                                                            value={autoridadControlCambios} onChange={e => setAutoridadControlCambios(e.target.checked)} checked={autoridadControlCambios}></Form.Check>
                                                    </Form.Group>
                                                </Col>*/}
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                            </Collapse>

                                {/* Boton Guardar*/}
                                <div className="mt-5 pb-5"> 
                                {
                                    editMode && (
                                        <LoaderButton
                                            type="submit"
                                            className="btn-success btn-save"
                                            disabled={!validateForm()}
                                            onClick={handleSubmit}
                                        >
                                            Guardar Cambios
                                        </LoaderButton>
                                    )
                                }
                                 </div>

                        </Tab.Pane>
                        <Tab.Pane eventKey="Matriz-Interesados">
                            <ViewInteresados interesados={interesado} toDo={todo} markAsDoneCallback={id => doneTask(id)} />
                        </Tab.Pane>
                        <Tab.Pane eventKey="Crear-Interesado">
                            <CreateInteresados onNavigate={setActiveKey} setInteresado={setInteresado} nombreinteresado={interesado} />
                        </Tab.Pane>
                        <Tab.Pane eventKey="to-do">

                            {/* 🔽 Combobox filtro antes del TodoList */}
                            <div style={{ marginBottom: "20px" }}>
                                <strong>Filtrar Tareas</strong>{" "}
                                <select value={taskFilter} onChange={handleFilterChange} class="dropdown-toggle btn btn-outline-primary">                                   
                                    <option value="false">Abiertas</option>
                                    <option value="true">Cerradas</option>
                                    <option value="null">Todas</option>
                                </select>
                            </div>   

                            <TodoList toDo={todo} persona={persona} addTaskCallback={task => addTaskHandler(task)} interesado={interesado} markAsDoneCallback={(id, closeDate) => doneTask(id, closeDate)}></TodoList>
                        </Tab.Pane>
                        <Tab.Pane eventKey="project-management">
                            {tipoProyecto && tipoProyecto.toString() === TIPO_PROYECTO_AGIL || tipoProyecto && tipoProyecto.toString() === TIPO_PROYECTO_HIBRIDO
                                ? <Kanban interesados={interesado} />
                                : <p>El tipo de proyecto no es apto para usar el Kanban</p>
                            }    
                        </Tab.Pane>
                        <Tab.Pane eventKey="Analisis-ambiental">
                            {
                            (analysisData && analysisData.length > 0) || (respuestaAnalisisAmbiental && respuestaAnalisisAmbiental.length > 0) ? (
                                <ViewAnalisisAmbiental analysisData={analysisData} respuestaAnalisisAmbiental={respuestaAnalisisAmbiental} projectID={numericId} />
                            ) : (
                                <AnalisisAmbiental projectID={numericId} />
                            )
                            }

                        </Tab.Pane>

                        {/* --- Alcance --- */}
                        <Tab.Pane eventKey="alcance">
                            <InputAlcanceList
                                alcanceEntregables={alcanceEntregables}
                                setAlcanceEntregables={setAlcanceEntregables}
                                editMode={editMode}
                            />
                            <div className="mt-5 pb-5">
                                {
                                    editMode && (
                                        <LoaderButton
                                            type="submit"
                                            className="btn-success btn-save"
                                            disabled={!validateForm()}
                                            onClick={handleSubmit}
                                        >
                                            Guardar Cambios
                                        </LoaderButton>
                                    )
                                }
                            </div>
                        </Tab.Pane>

                        {/* --- Hitos --- */}
                        <Tab.Pane eventKey="hitos">
                            <InputHitosList
                                tiempoDuracion={tiempoDuracion}
                                setTiempoDuracion={setTiempoDuracion}
                                tiempoFechasCriticas={tiempoFechasCriticas}
                                setTiempoFechasCriticas={setTiempoFechasCriticas}
                                editMode={editMode}
                                showDuration={showDuration}
                            />
                            <div className="mt-5 pb-5">
                                {
                                    editMode && (
                                        <LoaderButton
                                            type="submit"
                                            className="btn-success btn-save"
                                            disabled={!validateForm()}
                                            onClick={handleSubmit}
                                        >
                                            Guardar Cambios
                                        </LoaderButton>
                                    )
                                }
                            </div>
                        </Tab.Pane>

                        {/* --- Costos --- */}
                        <Tab.Pane eventKey="costos">
                            <InputCostosList
                                costoEntregable={costoEntregable}
                                setCostoEntregable={setCostoEntregable}
                                costoReservaContingencia={costoReservaContingencia}
                                setCostoReservaContingencia={setCostoReservaContingencia}
                                costoReservaGestion={costoReservaGestion}
                                setCostoReservaGestion={setCostoReservaGestion}
                                presupuesto={presupuesto}
                                editMode={editMode}
                                regexValidator={regexValidator}
                            />
                            <div className="mt-5 pb-5">
                                {
                                    editMode && (
                                        <LoaderButton
                                            type="submit"
                                            className="btn-success btn-save"
                                            disabled={!validateForm()}
                                            onClick={handleSubmit}
                                        >
                                            Guardar Cambios
                                        </LoaderButton>
                                    )
                                }
                            </div>
                        </Tab.Pane>

                        {/* --- Calidad --- */}
                        <Tab.Pane eventKey="calidad">
                            <InputCalidadList
                                costoEntregable={costoEntregable}
                                calidadMetricas={calidadMetricas}
                                setCalidadMetricas={setCalidadMetricas}
                                editMode={editMode}
                            />
                            <div className="mt-5 pb-5">
                                {
                                    editMode && (
                                        <LoaderButton
                                            type="submit"
                                            className="btn-success btn-save"
                                            disabled={!validateForm()}
                                            onClick={handleSubmit}
                                        >
                                            Guardar Cambios
                                        </LoaderButton>
                                    )
                                }
                            </div>
                        </Tab.Pane>
                        
                        {/* --- Riesgos --- */}
                        <Tab.Pane eventKey="riesgos">
                            <Form.Group controlId="riesgos-criticos">
                                <InputRiesgosList
                                    disabled={!editMode}
                                    riesgosList={riesgos}
                                    setRiesgosList={setRiesgos}
                                />
                            </Form.Group>

                            {/* Boton Guardar*/}
                            <div className="mt-5 pb-5">
                                {
                                    editMode && (
                                        <LoaderButton
                                            type="submit"
                                            className="btn-success btn-save"
                                            disabled={!validateForm()}
                                            onClick={handleSubmit}
                                        >
                                            Guardar Cambios
                                        </LoaderButton>
                                    )
                                }
                            </div>

                        </Tab.Pane>
                        <Tab.Pane eventKey="gantt">
                            {tipoProyecto && tipoProyecto.toString() === TIPO_PROYECTO_PREDICTIVO || tipoProyecto && tipoProyecto.toString() === TIPO_PROYECTO_HIBRIDO
                                ? <GanttChart
                                    projectId={projectId}
                                    interesados={interesado}
                                />
                                : <p>El tipo de proyecto no es apto para usar el Gantt</p>
                            }

                        </Tab.Pane>
                        <Tab.Pane eventKey="pizarra">
                            <Whiteboard key={projectId}
                                projectId={projectId}
                            />
                        </Tab.Pane>  
                    </Tab.Content>
                </div>
            </Tab.Container>
        </div>
    )
}

const mapStateToProps = state => ({
    isLoading: selectors.getIsLoading(state),
    projectDetail: selectors.getProjectDetail(state),
    batchFrom: batchSelectors.getBatchParent(state),
    batchLoading: batchSelectors.getIsLoading(state),
    todo: selectors.getToDo(state),
    usuario: sessionSelectors.getUser(state),
    persona: personaSelectors.getPersona(state),
    analysisData: selectors.getAnalysisData(state),
    respuestaAnalisisAmbiental: selectors.getRespuestaAnalysisData(state),
    interesados: selectors.getInteresadosRequest(state),
    interesado: selectors.getInteresadoList(state),
    showNotification: selectors.getShowNotification(state),
    tipoProyectoList: tipoProyectoSelector.getTipoProyectoList(state)
});

export default connect(mapStateToProps)(ProyectoDetail);
