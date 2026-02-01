/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { connect } from "react-redux";
import LoaderButton from "../components/loaderButton/LoaderButton";
import { Form, Col, Row, InputGroup, Button, DropdownButton, Dropdown, Badge, Modal } from "react-bootstrap";
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
import moment from "moment";

import InputRiesgosList from "../components/inputList/InputRiesgosList";
import Collapse from "react-bootstrap/Collapse"
import GoogleDocInputCheckerComponent from "../components/custom/GoogleDocInputCheckerComponent";
import { DownloadPdfButton } from "../components/downloadPdfButton/downloadPdfButton";
import { ProyectoPdf } from "./ProyectosReport";
import TodoList from "../components/todoList/TodoList";
import Kanban from "../components/kanban/Kanban";
import { toast } from "react-toastify";
import { actions as kanbanActions } from "../reducers/kanban";

import { AnalisisAmbiental } from '../components/ProyectoDetailAnalisis/AnalisisImpacto'
import { ViewAnalisisAmbiental } from '../components/ProyectoDetailAnalisis/ViewAnalisisAmbiental'
import { selectors as sessionSelectors } from "../reducers/session";
import { selectors as personaSelectors, actions as personaActions } from "../reducers/persona";
import {ViewInteresados} from "../components/ProyectoDetailMatriz/ViewInteresados";
import { CreateInteresados } from "../components/ProyectoDetailMatriz/CreateInteresados";
import SummaryChart from '../components/summaryChart/SummaryChart';

// nuevos componentes para alcance/hitos/costo/calidad
import InputAlcanceList from "../components/inputList/InputAlcanceList";
import InputHitosList from "../components/inputList/InputHitosList";
import InputCostosList from "../components/inputList/InputCostosList";
import InputCalidadList from "../components/inputList/InputCalidadList";
//beneficios solo para programa
import InputBeneficiosList from "../components/inputList/InputBeneficiosList";
//lecciones aprendidas solo cuando esta cerrado
import LeccionesAprendidas from "../components/leccionesAprendidas/LeccionesAprendidas"

//gantt
import GanttChart from "../components/GanttChart/GanttChart";

//pizarra
import Whiteboard from "../components/pizarra/Whiteboard";
//Importar el Modal de Configuración
import RoleSettingsModal from "../components/proyectoDetails/RoleSettingsModal";
//sesion action
import { actions as sessionActions} from "../reducers/session";

import { actions as rolProyectoActions } from "../reducers/rolProyecto";

import { actions as surveyActions, selectors as surveySelectors } from "../reducers/encuesta-satisfaccion";
import SurveyModal from "../components/surveyForm/SurveyModal";
import SurveyViewModal from "../components/surveyForm/SurveyViewModal";

function ProyectoDetail({ dispatch, persona, isLoading, usuario, projectDetail, batchFrom, batchLoading, todo, showNotification, tipoProyectoList, analysisData, respuestaAnalisisAmbiental, setInteresado, interesado, debeVerEncuesta, listaEncuestas, estadisticas, encuestaActual }) {
    const routeParams = useParams();
    const [activeKey, setActiveKey] = useState('general');
    // const [interesado, setInteresado] = useState([]);
    const [taskFilter, setTaskFilter] = useState("");
    const esActividad = projectDetail?.modo === "A";
    const esPrograma= projectDetail?.modo === "PR";
    const esProyecto = projectDetail?.modo === "P";
    const mostrarPestanasEstandar = esProyecto || esPrograma; // Muestra todas las pestañas excepto las restringidas para PR
    const ocultarAnalisisAmbientalCalidadPizarra = esActividad || esPrograma;

    const cerrado = projectDetail?.estado === "E";
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
        return () => {
            dispatch(surveyActions.clearSurveyState());
        };
    }, [numericId, dispatch]);

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

    useEffect(() => {
        if (usuario && usuario.id && numericId) {
            dispatch(rolProyectoActions.getUserProjectRolRequest(usuario.id, numericId));
        }

    }, [numericId, dispatch, usuario]);

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
        setLeccionesAprendidas("");
        setBeneficios("")

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
        setCostoReservaContingenciaReal(projectDetail?.costo_reserva_contingencia_real)
        setCostoReservaGestionReal(projectDetail?.costo_reserva_gestion_real)
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
        setLeccionesAprendidas(projectDetail?.lecciones_aprendidas)
        setBeneficios(projectDetail?.beneficios)
    }


    useEffect(() => {
        if (routeParams.id) {
            clearConstitutionFields(); // limpia primero
            dispatch(actions.getProjectDetailRequest(routeParams.id)); // luego pide los nuevos
        }
    }, [routeParams.id, dispatch]);

    useEffect(() => {
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
    const [costoReservaContingenciaReal, setCostoReservaContingenciaReal] = useState("");
    const [costoReservaGestionReal, setCostoReservaGestionReal] = useState("");
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
    const [leccionesAprendidas, setLeccionesAprendidas] = useState("")
    const [beneficios, setBeneficios] = useState("");

    //Aqui se declaran para manejar los estados de los collapse
    const [openPrimeraParte, setOpenPrimeraParte] = useState(false);
    const [openSegundaParte, setOpenSegundaParte] = useState(false);
    const [openQuintaParte, setOpenQuintaParte] = useState(false);
    const [openSextaParte, setOpenSextaParte] = useState(false);

    // Estado para controlar el modal
    const [showRoleModal, setShowRoleModal] = useState(false);

    const isFirstRender = useRef(true);

    const [showVoluntarySurvey, setShowVoluntarySurvey] = useState(false);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEncuesta, setSelectedEncuesta] = useState(null);

    const handleVerDetalleEncuesta = (encuesta) => {
        setSelectedEncuesta(encuesta);
        setShowDetailsModal(true);
    };

    const [showInvitation, setShowInvitation] = useState(false);
    const surveyCheckedRef = useRef(false); 

    useEffect(() => {
        if (cerrado && numericId && !surveyCheckedRef.current) {
            dispatch(surveyActions.checkSurveyStatus(numericId));
            surveyCheckedRef.current = true;
        }
    }, [cerrado, numericId, dispatch]);

    useEffect(() => {
        if (cerrado && numericId) {
            dispatch(surveyActions.getAllSurveys(numericId));
        }
    }, [cerrado, numericId, dispatch]);

    useEffect(() => {
        if (debeVerEncuesta === true && cerrado) {
            setShowInvitation(true);
        }
    }, [debeVerEncuesta]);

    const handleAcceptInvitation = () => {
        setShowInvitation(false);
        setShowVoluntarySurvey(true); // Abre el modal de las preguntas
    };

    const handleRejectInvitation = () => {
        setShowInvitation(false);
        dispatch(surveyActions.rejectSurvey(numericId));
    };

    const calcularPromedioEncuesta = (encuesta) => {
        const campos = [
            'comunicacion', 'rapidez_respuesta', 'manejo_reuniones',
            'cumplimiento_plazos', 'cumplimiento_alcance', 'calidad_entregado',
            'nivel_capacitaciones', 'gestion_documentacion', 'experiencia_director',
            'satisfaccion_general'
        ];

        const suma = campos.reduce((acc, campo) => acc + (encuesta[campo] || 0), 0);
        return (suma / campos.length).toFixed(2);
    };

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
        if (!alcanceEntregables || !Array.isArray(alcanceEntregables)) return;

        const nombresAlcance = alcanceEntregables.map(ent =>
            typeof ent === 'string' ? ent : ent.nombre
        );

        // 1. Sincronizar Calidad
        const currentCalidadNames = (calidadMetricas || []).map(m => m.entregable);
        if (JSON.stringify(currentCalidadNames) !== JSON.stringify(nombresAlcance)) {
            setCalidadMetricas(nombresAlcance.map(nombre => {
                const existing = (calidadMetricas || []).find(m => m.entregable === nombre);
                return existing || { entregable: nombre, metrica: '' };
            }));
        }

        // 2. Sincronizar Hitos (Solo estructura)
        const hitosActuales = tiempoFechasCriticas || [];
        const hitosManuales = hitosActuales.filter(h => !nombresAlcance.includes(h.description));
        const hitosDeAlcance = alcanceEntregables.map(ent => {
            const nombre = typeof ent === 'string' ? ent : ent.nombre;
            const existing = hitosActuales.find(h => h.description === nombre);
            // Si no existe, se crea con date: null (se editará en Hitos)
            return existing || { description: nombre, date: null, completado: false, fecha_hito: null };
        });

        const nuevosHitos = [...hitosManuales, ...hitosDeAlcance];
        if (JSON.stringify(hitosActuales) !== JSON.stringify(nuevosHitos)) {
            setTiempoFechasCriticas(nuevosHitos);
        }

        // 3. Sincronizar Costos (Solo estructura)
        const costosActuales = costoEntregable || [];
        const nuevosCostos = alcanceEntregables.map(ent => {
            const nombre = typeof ent === 'string' ? ent : ent.nombre;
            const existing = costosActuales.find(c => c.entregable === nombre);
            // El deadline lo pondrá el EFECTO 2
            return existing || { entregable: nombre, costo: 0, deadline: null };
        });

        if (JSON.stringify(costosActuales) !== JSON.stringify(nuevosCostos)) {
            setCostoEntregable(nuevosCostos);
        }

    }, [alcanceEntregables]);


    // EFECTO 2: Sincronización de Fechas (De Hitos -> Alcance y Costos)
    useEffect(() => {
        if (!tiempoFechasCriticas) return;

        // Actualizar Deadlines en Alcance
        const alcanceActualizado = alcanceEntregables.map(ent => {
            const nombre = typeof ent === 'string' ? ent : ent.nombre;
            const hitoMatch = tiempoFechasCriticas.find(h => h.description === nombre);

            if (hitoMatch && hitoMatch.date !== (ent.deadline || null)) {
                return { ...(typeof ent === 'string' ? { nombre: ent } : ent), deadline: hitoMatch.date };
            }
            return ent;
        });

        if (JSON.stringify(alcanceEntregables) !== JSON.stringify(alcanceActualizado)) {
            setAlcanceEntregables(alcanceActualizado);
        }

        // Actualizar Deadlines en Costos
        const costosActualizados = (costoEntregable || []).map(costo => {
            const hitoMatch = tiempoFechasCriticas.find(h => h.description === costo.entregable);
            if (hitoMatch && hitoMatch.date !== (costo.deadline || null)) {
                return { ...costo, deadline: hitoMatch.date };
            }
            return costo;
        });

        if (JSON.stringify(costoEntregable) !== JSON.stringify(costosActualizados)) {
            setCostoEntregable(costosActualizados);
        }

    }, [tiempoFechasCriticas]);

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

    function handleSubmitLeccionesAprendidas(payloadLecciones) {
        // payloadLecciones ya viene con el formato { descripcion, fechaCierre }
        let payload = {
            leccionesAprendidas: JSON.stringify(payloadLecciones),
        };
        dispatch(actions.updateProject(routeParams.id, payload));
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
            ...(costoReservaContingenciaReal && { costoReservaContingenciaReal }),
            ...(costoReservaGestionReal && { costoReservaGestionReal }),
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
            ...(leccionesAprendidas && { leccionesAprendidas }),
            ...(beneficios && { beneficios }),
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

    const isTodoOrKanban = () => (activeKey === 'to-do' || activeKey === 'project-management' || activeKey === 'Analisis-ambiental' || activeKey === 'gantt' || activeKey === 'pizarra')


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
        setTaskFilter("false");
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

    const [resumenEjecucion, setResumenEjecucion] = useState({
        alcance: 0,
        hitos: 0,
        costoDesviacion: 0,
        calidad: 0,
        beneficios: 0,
        gantt: 0,
        riesgoPromedio: null, // H, M, L
    });

    const setPorcentajeCompletado = useCallback((key, percentage) => {
        setResumenEjecucion(prev => ({ ...prev, [key]: percentage }));
    }, [setResumenEjecucion]); // Solo depende de setResumenEjecucion, que es estable.


    const setRiesgoPromedio = useCallback((riesgo) => {
        setResumenEjecucion(prev => ({ ...prev, riesgoPromedio: riesgo }));
    }, [setResumenEjecucion]);

    // Nuevo estado para Desempeño
    const [resumenDesempeno, setResumenDesempeno] = useState({
        eficiencia: 0,
        cronograma: 0,
        alcance: 0,
        hitos: 0,
        costos: 0,
        todo: 0,
        // Aquí puedes añadir más indicadores a futuro (ej. calidadDesempeno: 0)
    });

    // Callback para actualizar el desempeño
    const setDesempenoValue = useCallback((key, percentage) => {
        setResumenDesempeno(prev => ({ ...prev, [key]: percentage }));
    }, []);

    // Handler para abrir modal
    const handleOpenConfig = () => {
        // ASUMIMOS que usuario.userSystem ya fue poblado con la empresa_id/Empresa
        if (usuario) {
            const empresaId = usuario.empresa;

            // Lógica para cargar usuarios de la empresa del usuario autenticado
            dispatch(sessionActions.getUsuariosByEmpresa(empresaId));
        } else {
            // Manejo de error si no se encuentra la empresa (opcional)
            console.error("Usuario autenticado no tiene una empresa asociada.");
        }
        setShowRoleModal(true);
    };

    // Handler para cerrar modal
    const handleCloseConfig = () => {
        setShowRoleModal(false);
    };

    return (
        <div className="page-menu-container">
            {/* Renderizar el Modal Configuración */}
            <RoleSettingsModal
                show={showRoleModal}
                handleClose={handleCloseConfig}
                projectId={routeParams.id}
                projectDetail={projectDetail}
            />
            <Tab.Container defaultActiveKey="general" activeKey={activeKey} onSelect={setActiveKey}>

                <div className="header-wrapper">
                    {/* Fila Superior: Título y Botones */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap px-4 pt-3 pb-2">

                        {/* Título */}
                        <div className="title-container mb-2 mb-md-0">
                            <h1 className="blue text-capitalize mb-0">{nombreProyecto}</h1>
                        </div>

                        {/* Botones de Acción (widget-container) */}
                        <div className="widget-container d-inline-flex align-items-center flex-wrap flex-shrink-0 gap-2">
                            {/* Botón de Configuración */}
                            {!cerrado && (
                                <>
                                    <div className="green d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={handleOpenConfig}>
                                        <i className="bi bi-gear-fill mr-2" />
                                        <span>Configuración</span>
                                    </div>
                                    <div className="vertical-separator mx-3" style={{ borderLeft: '1px solid #ccc', height: '20px' }}></div>
                                </>
                            )}

                            {!isTodoOrKanban() && !(activeKey === 'Crear-Interesado' || activeKey === 'Matriz-Interesados') && (
                                <>
                                    {!cerrado && (
                                        <>
                                            <div className="green d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => toggleEdit()}>
                                                <i className={`bi ${!editMode ? 'bi-pencil-square' : 'bi-eye'} mr-2`} />
                                                <span>{editMode ? 'Visualizar' : 'Editar'}</span>
                                            </div>
                                            <div className="vertical-separator mx-3" style={{ borderLeft: '1px solid #ccc', height: '20px' }}></div>
                                        </>
                                    )}
                                    <div className="download-document">
                                        {(activeKey === 'general' || activeKey === 'constitution' || activeKey === 'riesgos' || activeKey === 'alcance' || activeKey === 'hitos' || activeKey === 'costos' || activeKey === 'calidad') && (
                                            <DownloadPdfButton reportPrefix="Proyecto" pdfReport={<ProyectoPdf proyecto={projectDetail} disabled />}>
                                                <div className="green d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                                    <i className="bi bi-cloud-download mr-2 disabled" />
                                                    <span>Descargar Acta</span>
                                                </div>
                                            </DownloadPdfButton>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Botones de Interesados */}
                            {activeKey === 'Matriz-Interesados' && !cerrado && (
                                <div className="green d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => setActiveKey('Crear-Interesado')}>
                                    <i className="bi bi-plus-circle mr-2" /> Crear Interesado
                                </div>
                            )}

                            {activeKey === 'Crear-Interesado' && !cerrado && (
                                <>
                                    <div className="vertical-separator mx-3" style={{ borderLeft: '1px solid #ccc', height: '20px' }}></div>
                                    <div className="green d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => setActiveKey('Matriz-Interesados')}>
                                        <i className="bi bi-arrow-left mr-2" /> Volver a Ver Interesados
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Fila Inferior: Navegación de Pestañas */}
                    <div className="tabbed-form-responsive px-4">
                        <Nav
                            activeKey={activeKey}
                            className="nav-tabs blue nav-responsive-scroll"
                            onSelect={handleChangeTab}
                        >
                            <Nav.Item>
                                <Nav.Link eventKey="general">Datos Generales</Nav.Link>
                            </Nav.Item>
                            {(planificado || ejecutado || cerrado) && (
                                <>
                                    {(esPrograma) && (
                                        <Nav.Item><Nav.Link eventKey="beneficios">Beneficios</Nav.Link></Nav.Item>
                                    )}
                                </>
                            )}
                            <Nav.Item>
                                <Nav.Link eventKey="constitution">Acta de Constitución</Nav.Link>
                            </Nav.Item>
                            {(planificado || ejecutado || cerrado) && (
                                <>
                                    <Nav.Item><Nav.Link eventKey="Matriz-Interesados">Interesados</Nav.Link></Nav.Item>
                                    {(!esActividad && !esPrograma) && (
                                        <Nav.Item><Nav.Link eventKey="Analisis-ambiental">Analisis Ambiental</Nav.Link></Nav.Item>
                                    )}
                                    {mostrarPestanasEstandar && (
                                        <>
                                            <Nav.Item><Nav.Link eventKey="alcance">Alcance</Nav.Link></Nav.Item>
                                            <Nav.Item><Nav.Link eventKey="hitos">Hitos</Nav.Link></Nav.Item>
                                            <Nav.Item><Nav.Link eventKey="costos">Costos</Nav.Link></Nav.Item>
                                        </>
                                    )}
                                    {(!esActividad && !esPrograma) && (
                                        <Nav.Item><Nav.Link eventKey="calidad">Calidad</Nav.Link></Nav.Item>
                                    )}
                                    {mostrarPestanasEstandar && (
                                        <Nav.Item><Nav.Link eventKey="riesgos">Riesgos</Nav.Link></Nav.Item>
                                    )}
                                    <Nav.Item><Nav.Link eventKey="gantt">{esPrograma? "Roadmap" : "Gantt"}</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="to-do" >To Do</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="project-management">Kanban</Nav.Link></Nav.Item>
                                    {(!esActividad && !esPrograma) && (
                                        <Nav.Item><Nav.Link eventKey="pizarra">Pizarra</Nav.Link></Nav.Item>
                                    )} 
                                </>
                            )}
                            {(cerrado) && (
                                <Nav.Item><Nav.Link eventKey="leccionesAprendidas">Lecciones Aprendidas</Nav.Link></Nav.Item>
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
                                <Form.Label>{esActividad ? "Proyecto Personal" : esPrograma ? "Nombre del Programa" : "Proyecto Equipo"}</Form.Label>
                                <Form.Control
                                    disabled={!editMode}
                                    autoComplete="off"
                                    type="text"
                                    value={nombreProyecto}
                                    onChange={e => setNombreProyecto(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="directorProyecto">
                                <Form.Label>{esActividad ? "Director del Proyecto Personal" : esPrograma ? "Director del Programa" : "Director del Proyecto Equipo"}</Form.Label>
                                <Form.Control
                                    disabled={!editMode}
                                    autoComplete="off"
                                    type="text"
                                    value={directorProyecto}
                                    onChange={e => setDirectorProyecto(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="patrocinadorProyecto">
                                <Form.Label>{esActividad ? "Patrocinador del Proyecto Personal" : esPrograma ? "Patrocinador del Programa" : "Patrocinador del Proyecto Equipo"}</Form.Label>
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

                            {!esPrograma && (
                                <Form.Group controlId="tipoProyecto">
                                    <Form.Label>{esActividad ? "Tipo de Proyecto Personal" : esPrograma ? "Tipo de Programa" : "Tipo de Proyecto Equipo"}</Form.Label>
                                    <Form.Control
                                        disabled={!editMode}
                                        as="select"
                                        className="form-select"
                                        value={tipoProyecto}
                                        onChange={(e) => { setTipoProyecto(e.target.value)}}
                                    >
                                        <option value="">Elija el tipo de {esActividad ? "Proyecto Personal" : esPrograma ? "Programa" : "Proyecto Equipo"}...</option>
                                        {tipoProyectoList.map(tipo => (
                                            <option value={tipo.id}>{tipo.nombre}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            )}
                            {(ejecutado || cerrado) && (
                                <div className="summary-section mt-5">
                                    <hr className="mb-4" />
                                    <Tab.Container defaultActiveKey="ejecucion">
                                        <Nav variant="tabs" className="justify-content-start mb-4 custom-tabs-style">
                                            <Nav.Item>
                                                <Nav.Link eventKey="ejecucion" className="px-4 py-2">
                                                    <i className="bi bi-graph-up-arrow mr-2"></i>Resumen de Ejecución
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="desempeno" className="px-4 py-2">
                                                    <i className="bi bi-speedometer2 mr-2"></i>Resumen de Desempeño
                                                </Nav.Link>
                                            </Nav.Item>
                                            
                                            <Nav.Item>
                                                <Nav.Link eventKey="encuesta" className="px-4 py-2">
                                                    <i className="bi bi-journal-bookmark mr-2"></i>Encuesta de satisfacción
                                                </Nav.Link>
                                            </Nav.Item>
                                            
                                        </Nav>

                                        <Tab.Content>
                                            {/* PESTAÑA 1: RESUMEN DE EJECUCIÓN */}
                                            <Tab.Pane eventKey="ejecucion">
                                                
                                                <Row className="mb-4" style={{ rowGap: "50px", alignItems: "end" }}>
                                                    {!esActividad && (
                                                        <>
                                                            <Col md={4} className="d-flex justify-content-center pb-4">
                                                                <SummaryChart type="Avance de Alcance" value={resumenEjecucion.alcance} />
                                                            </Col>
                                                            <Col md={4} className="d-flex justify-content-center pb-4">
                                                                <SummaryChart type="Avance de Hitos" value={resumenEjecucion.hitos} />
                                                            </Col>
                                                            <Col md={4} className="d-flex justify-content-center pb-4">
                                                                <SummaryChart type="cost" value={resumenEjecucion.costoDesviacion} />
                                                            </Col>
                                                            <Col md={4} className="d-flex justify-content-center pb-4">
                                                                <SummaryChart type={esPrograma ? "Avance de Beneficios" : "Avance de Calidad"}
                                                                    value={esPrograma ? resumenEjecucion.beneficios : resumenEjecucion.calidad} />
                                                            </Col>
                                                            <Col md={4} className="d-flex justify-content-center pb-4">
                                                                <SummaryChart type="risk" value={resumenEjecucion.riesgoPromedio} />
                                                            </Col>
                                                        </>
                                                    )}
                                                    {(tipoProyecto?.toString() === TIPO_PROYECTO_PREDICTIVO || tipoProyecto?.toString() === TIPO_PROYECTO_HIBRIDO) && (
                                                        <Col md={4} className="d-flex justify-content-center pb-4">
                                                            <SummaryChart type="Avance de Gantt" value={resumenEjecucion.gantt} />
                                                        </Col>
                                                    )}
                                                </Row>
                                            </Tab.Pane>

                                            {/* PESTAÑA 2: RESUMEN DE DESEMPEÑO */}
                                            <Tab.Pane eventKey="desempeno">
                                                <Row className="mb-4 justify-content-center">
                                                    <Col md={8} lg={6} className="d-flex justify-content-center pb-4">
                                                        {/* 🔹 Enviamos el objeto completo 'resumenDesempeno' al gráfico Polar */}
                                                        <SummaryChart
                                                            type="performance"
                                                            dataValues={resumenDesempeno}
                                                        />
                                                    </Col>
                                                </Row>

                                                {/* Opcional: Leyenda informativa de los valores */}
                                                <Row className="justify-content-center">
                                                    <Col md={8} className="text-center">
                                                        <Badge bg="success">1.0+ Excelente</Badge>{' '}
                                                        <Badge bg="warning">0.8 - 1.0 Regular</Badge>{' '}
                                                        <Badge bg="danger">{"< 0.8 Crítico"}</Badge>
                                                    </Col>
                                                </Row>
                                            </Tab.Pane>
                                        
                                            <Tab.Pane eventKey="encuesta">
                                                <div className="survey-container mt-4 p-3 border rounded bg-light">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h4>Encuesta de Satisfacción - Proyecto #{numericId}</h4>
                                                        {(!encuestaActual || !encuestaActual.completada) && (
                                                            <Button
                                                                variant="outline-primary"
                                                                onClick={() => setShowVoluntarySurvey(true)}
                                                            >
                                                                Realizar Encuesta
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {estadisticas && estadisticas.totalEncuestas > 0 && (
                                                        <div className="row mb-4">
                                                            <div className="col-md-4">
                                                                <div className="card text-center">
                                                                    <div className="card-body">
                                                                        <h6>Promedio General</h6>
                                                                        <h2 className="text-success">
                                                                            {estadisticas.satisfaccionGeneral} / 5
                                                                        </h2>
                                                                        <small className="text-muted">
                                                                            Basado en {estadisticas.totalEncuestas} respuesta{estadisticas.totalEncuestas !== 1 ? 's' : ''}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <h5>Encuestas Realizadas</h5>
                                                    <div className="table-responsive">
                                                        <table className="table table-hover">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th>Nombre</th>
                                                                    <th>Fecha</th>
                                                                    <th className="text-center">Promedio</th>
                                                                    <th className="text-center">Acción</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {listaEncuestas.map(enc => (
                                                                    <tr key={enc.id}>
                                                                        <td>
                                                                            <strong>{enc.nombre}</strong>
                                                                        </td>
                                                                        <td>
                                                                            {new Date(enc.createdAt).toLocaleDateString('es-ES', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            
                                                                                {calcularPromedioEncuesta(enc)} / 5
                                                                            
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <Button
                                                                                variant="outline-info"
                                                                                size="sm"
                                                                                onClick={() => handleVerDetalleEncuesta(enc)}
                                                                            >
                                                                                <i className="bi bi-eye me-1"></i>
                                                                                Ver Detalle
                                                                            </Button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {listaEncuestas.length === 0 && (
                                                                    <tr>
                                                                        <td colSpan="4" className="text-center text-muted py-4">
                                                                            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                                                            No hay encuestas registradas aún para este proyecto
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </Tab.Pane>

                                            

                                            <SurveyModal
                                                show={showVoluntarySurvey}
                                                onHide={() => setShowVoluntarySurvey(false)}
                                                proyectoId={numericId}
                                                encuestaPrevia={encuestaActual}
                                                nombreProyecto={nombreProyecto}
                                                tipoProyecto="proyecto"
                                            />

                                            <SurveyViewModal
                                                show={showDetailsModal}
                                                onHide={() => setShowDetailsModal(false)}
                                                encuesta={selectedEncuesta}
                                            />
                                            {/* Modal de Invitación a la Encuesta */}
                                            <Modal show={showInvitation} onHide={() => setShowInvitation(false)} centered>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>Encuesta de Satisfacción</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    <p>Este proyecto ha finalizado. ¿Te gustaría compartir tu experiencia con nosotros?
                                                        Tus respuestas nos ayudan a mejorar.</p>
                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <Button variant="secondary" onClick={handleRejectInvitation}>
                                                        No, gracias
                                                    </Button>
                                                    <Button variant="primary" onClick={handleAcceptInvitation}>
                                                        Sí, responder encuesta
                                                    </Button>
                                                </Modal.Footer>
                                            </Modal>
                                            
                                        </Tab.Content>
                                    </Tab.Container>
                                </div>
                            )}



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
                                        <Form.Label>{esActividad ? "Director del Proyecto Personal" : esPrograma ? "Director del Programa" : "Director del Proyecto Equipo"}</Form.Label>
                                        <Form.Control type="text" value={directorProyecto} disabled />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>{esActividad ? "Patrocinador del Proyecto Personal" : esPrograma ? "Patrocinador del Programa" : "Patrocinador del Proyecto Equipo"}</Form.Label>
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
                                {!esPrograma && (
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Contrato</Form.Label>
                                            <GoogleDocInputCheckerComponent link={contrato} setLink={setContrato} disabled={!editMode} />
                                        </Form.Group>
                                    </Col>
                                )}
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Caso Negocio</Form.Label>
                                        <GoogleDocInputCheckerComponent link={casoNegocio} setLink={setCasoNegocio} disabled={!editMode} />
                                    </Form.Group>
                                </Col>
                                {!esPrograma && (
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Enunciado trabajo</Form.Label>
                                            <GoogleDocInputCheckerComponent link={enunciadoTrabajo} setLink={setEnunciadoTrabajo} disabled={!editMode} />
                                        </Form.Group>
                                    </Col>
                                )}
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
                                <Form.Label>{esPrograma ? "Portafolio" : "Programa"}</Form.Label>
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
                                        <Form.Label>{esActividad ? "Justificación del Proyecto Personal" : esPrograma ? "Justificación del Programa" : "Justificación del Proyecto Equipo"}</Form.Label>
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
                                        <Form.Label>{esActividad ? "Descripción del Proyecto Personal" : esPrograma ? "Descripción del Programa" : "Descripción del Proyecto Equipo"}</Form.Label>
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
                                    {!esPrograma && (
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
                                    )}
                                </div>
                            </Collapse>
                            <h2
                                onClick={() => setOpenSegundaParte(!openSegundaParte)}
                                aria-controls="segunda-parte-expand"
                                aria-expanded={openSegundaParte}
                            >{esActividad ? "Objetivos de la Actividad" : esPrograma ? "Objetivos del Programa" : "Objetivos del Proyecto"} <span className={`bi ${openSegundaParte ? "bi-chevron-up" : "bi-chevron-down"} pull-end`}></span></h2>
                            <Collapse in={openSegundaParte} >
                                <div>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="objetivoDescripcion">
                                                <Form.Label>Objetivos {esActividad ? "del Proyecto Personal" : esPrograma ? "del Programa" : "del Proyecto Equipo"} y CPD (Costo, Plazo y Desempeño) – De alto Nivel</Form.Label>
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
                            >Alcance {esPrograma && "General"} <span className={`bi ${openQuintaParte ? "bi-chevron-up" : "bi-chevron-down"} pull-end`}></span></h2>
                            <Collapse in={openQuintaParte} >
                                <div>
                                    <Form.Group controlId="recursosRequeridos">
                                        <Form.Label>Recuros Requeridos {esPrograma && "General"}</Form.Label>
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
                                        <Form.Label>Supuestos {esPrograma && "General"}</Form.Label>
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
                                        <Form.Label>Restricciones {esPrograma && "General"}</Form.Label>
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
                            >Nivel De Autoridad Y Decisión Del Director De {esActividad ? "Proyecto Personal" : esPrograma ? "Programa" : "Proyecto Equipo"} 

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
                            <ViewInteresados interesados={interesado} toDo={todo} markAsDoneCallback={id => doneTask(id)} cerrado={cerrado} esPrograma={esPrograma} />
                        </Tab.Pane>
                        <Tab.Pane eventKey="Crear-Interesado">
                            <CreateInteresados onNavigate={setActiveKey} setInteresado={setInteresado} nombreinteresado={interesado} esPrograma={esPrograma}/>
                        </Tab.Pane>
                        <Tab.Pane eventKey="to-do">
                            <div className="to-do-container border rounded p-4 bg-white shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="m-0 fw-bold">
                                        <i className="bi bi-check2-square me-2"></i>
                                        Gestión de tareas
                                    </h4>
                                </div>
                                {/* 🔽 Combobox filtro antes del TodoList */}
                                <div style={{ marginBottom: "20px" }}>
                                    <strong>Filtrar Tareas</strong>{" "}
                                    <select value={taskFilter} onChange={handleFilterChange} class="dropdown-toggle btn btn-outline-primary">                                   
                                        <option value="false">Abiertas</option>
                                        <option value="true">Cerradas</option>
                                        <option value="null">Todas</option>
                                    </select>
                                </div>  
                                <TodoList setTaskFilter={setTaskFilter} toDo={todo} persona={persona} addTaskCallback={task => addTaskHandler(task)} interesado={interesado} markAsDoneCallback={(id, closeDate) => doneTask(id, closeDate)} cerrado={cerrado} ejecutado={ejecutado} onPerformanceChange={setDesempenoValue}></TodoList> 
                            </div>                    
                        </Tab.Pane>
                        <Tab.Pane eventKey="project-management">
                            {tipoProyecto && tipoProyecto.toString() === TIPO_PROYECTO_AGIL || tipoProyecto && tipoProyecto.toString() === TIPO_PROYECTO_HIBRIDO
                                ? <Kanban interesados={interesado} cerrado={cerrado} ejecutado={ejecutado} onPerformanceChange={setDesempenoValue} />
                                : <p>El tipo de proyecto no es apto para usar el Kanban</p>
                            }    
                        </Tab.Pane>
                        <Tab.Pane eventKey="Analisis-ambiental">
                            {
                            (analysisData && analysisData.length > 0) || (respuestaAnalisisAmbiental && respuestaAnalisisAmbiental.length > 0) ? (
                                <ViewAnalisisAmbiental analysisData={analysisData} respuestaAnalisisAmbiental={respuestaAnalisisAmbiental} projectID={numericId} cerrado={cerrado}/>
                            ) : (
                                <AnalisisAmbiental projectID={numericId} cerrado={cerrado}/>
                            )
                            }

                        </Tab.Pane>

                        {/* --- Alcance --- */}
                        <Tab.Pane eventKey="alcance">
                            {!editMode && !cerrado && (
                                <p>Debe hacer click en "Editar" situado en la parte superior derecha para crear o revisar interesados </p>
                            )}
                            <InputAlcanceList
                                alcanceEntregables={alcanceEntregables}
                                setAlcanceEntregables={setAlcanceEntregables}
                                editMode={editMode}
                                ejecutado={ejecutado}
                                cerrado={cerrado}
                                onSummaryChange={setPorcentajeCompletado}
                                esPrograma={esPrograma}
                                onPerformanceChange={setDesempenoValue}
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
                            {!editMode && !cerrado && (
                                <p>Debe hacer click en "Editar" situado en la parte superior derecha para crear o revisar hitos </p>
                            )}
                            <InputHitosList
                                tiempoDuracion={tiempoDuracion}
                                setTiempoDuracion={setTiempoDuracion}
                                tiempoFechasCriticas={tiempoFechasCriticas}
                                setTiempoFechasCriticas={setTiempoFechasCriticas}
                                editMode={editMode}
                                showDuration={showDuration}
                                ejecutado={ejecutado}
                                cerrado={cerrado}
                                onSummaryChange={setPorcentajeCompletado}
                                onPerformanceChange={setDesempenoValue}
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
                            {!editMode && !cerrado && (
                                <p>Debe hacer click en "Editar" situado en la parte superior derecha para crear o revisar costos </p>
                            )}
                            <InputCostosList
                                costoEntregable={costoEntregable}
                                setCostoEntregable={setCostoEntregable}
                                costoReservaContingencia={costoReservaContingencia}
                                setCostoReservaContingencia={setCostoReservaContingencia}
                                costoReservaContingenciaReal={costoReservaContingenciaReal}
                                setCostoReservaContingenciaReal={setCostoReservaContingenciaReal}
                                costoReservaGestion={costoReservaGestion}
                                setCostoReservaGestion={setCostoReservaGestion}
                                costoReservaGestionReal={costoReservaGestionReal}
                                setCostoReservaGestionReal={setCostoReservaGestionReal}
                                presupuesto={presupuesto}
                                editMode={editMode}
                                regexValidator={regexValidator}
                                ejecutado={ejecutado}
                                cerrado={cerrado}
                                onSummaryChange={setPorcentajeCompletado}
                                onPerformanceChange={setDesempenoValue}
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
                            {!editMode && !cerrado && (
                                <p>Debe hacer click en "Editar" situado en la parte superior derecha para crear o revisar calidad </p>
                            )}
                            <InputCalidadList
                                costoEntregable={costoEntregable}
                                calidadMetricas={calidadMetricas}
                                setCalidadMetricas={setCalidadMetricas}
                                editMode={editMode}
                                ejecutado={ejecutado}
                                cerrado={cerrado}
                                onSummaryChange={setPorcentajeCompletado}
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
                            {!editMode && !cerrado && (
                                <p>Debe hacer click en "Editar" situado en la parte superior derecha para crear o revisar riesgos </p>
                            )}
                            <Form.Group controlId="riesgos-criticos">
                                <InputRiesgosList
                                    disabled={!editMode}
                                    riesgosList={riesgos}
                                    setRiesgosList={setRiesgos}
                                    interesados={interesado}
                                    ejecutado={ejecutado}
                                    cerrado={cerrado}
                                    onSummaryChange={setRiesgoPromedio}
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
                                    cerrado={cerrado}
                                    ejecutado={ejecutado}
                                    onSummaryChange={setPorcentajeCompletado}
                                    onPerformanceChange={setDesempenoValue}
                                    esPrograma={esPrograma}
                                />
                                : <p>El tipo de proyecto no es apto para usar el Gantt</p>
                            }

                        </Tab.Pane>
                        <Tab.Pane eventKey="pizarra">
                            <Whiteboard key={projectId}
                                projectId={projectId}
                                cerrado={cerrado}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="beneficios">
                            {!editMode && !cerrado && (
                                <p>Debe hacer click en "Editar" situado en la parte superior derecha para crear o revisar beneficios </p>
                            )}
                            <InputBeneficiosList
                                beneficiosList={beneficios}
                                setBeneficiosList={setBeneficios}
                                editMode={editMode}
                                ejecutado={ejecutado}
                                cerrado={cerrado}
                                onSummaryChange={setPorcentajeCompletado} // o la función que maneje el resumen
                            />
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
                        <Tab.Pane eventKey="leccionesAprendidas">
                            <LeccionesAprendidas
                                data={leccionesAprendidas}
                                onSave={handleSubmitLeccionesAprendidas}
                                cerrado={cerrado} // Prop que ya existe en ProyectoDetail
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
    tipoProyectoList: tipoProyectoSelector.getTipoProyectoList(state),

    // --- NUEVAS LÍNEAS PARA LA ENCUESTA ---
    debeVerEncuesta: surveySelectors.getDebeVerEncuesta(state),
    listaEncuestas: surveySelectors.getListaEncuestas(state),
    estadisticas: surveySelectors.getEstadisticas(state),
    encuestaActual: surveySelectors.getEncuestaActual(state),
    surveyLoading: surveySelectors.getIsLoading(state)
});

export default connect(mapStateToProps)(ProyectoDetail);
