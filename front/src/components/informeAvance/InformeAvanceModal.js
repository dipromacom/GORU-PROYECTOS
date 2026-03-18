import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Badge, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { actions as informeActions } from "../../reducers/informe-avance";
import RiskHeatmapMatrix from '../summaryChart/RiskHeatmapMatrix';

const InformeAvanceModal = ({
    show,
    onHide,
    proyectoId,
    usuario,
    projectDetail,
    resumenEjecucion,
    resumenDesempeno,
    informeEditar = null,
    estadisticas,
    logs,
    riesgosList = [],
    leccionesAprendidas,
    listaSolicitudes = [],
    listaEncuestas = [],
    alcanceEntregables = [],
    tiempoFechasCriticas = [],
    costoEntregable = [],
    calidadMetricas = [],
    todo = [],
    totalesAprobados = { tiempo: 0, dolares: 0, cantidad: 0 },
    presupuesto = 0,
    ganttSummary = null,
}) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        nombrePersona: '',
        fechaInforme: new Date().toISOString().split('T')[0],
        conclusiones: '',
        proximosPasos: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (informeEditar) {
            setFormData({
                nombrePersona: informeEditar.nombre_persona || '',
                fechaInforme: informeEditar.fecha_informe ?
                    new Date(informeEditar.fecha_informe).toISOString().split('T')[0] :
                    new Date().toISOString().split('T')[0],
                conclusiones: informeEditar.conclusiones || '',
                proximosPasos: informeEditar.proximos_pasos || ''
            });
        } else {
            setFormData({
                nombrePersona: '',
                fechaInforme: new Date().toISOString().split('T')[0],
                conclusiones: '',
                proximosPasos: ''
            });
        }
    }, [informeEditar, show]);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nombrePersona || formData.nombrePersona.trim() === '') {
            newErrors.nombrePersona = 'El nombre de la persona es obligatorio';
        }
        if (!formData.conclusiones || formData.conclusiones.trim() === '') {
            newErrors.conclusiones = 'Las conclusiones son obligatorias';
        }
        if (!formData.proximosPasos || formData.proximosPasos.trim() === '') {
            newErrors.proximosPasos = 'Los próximos pasos son obligatorios';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const payload = {
            proyectoId,
            usuarioId: usuario?.id,
            nombrePersona: formData.nombrePersona.trim(),
            fechaInforme: formData.fechaInforme,
            conclusiones: formData.conclusiones.trim(),
            proximosPasos: formData.proximosPasos.trim()
        };

        if (informeEditar) {
            dispatch(informeActions.updateInforme(informeEditar.id, payload));
        } else {
            dispatch(informeActions.createInforme(payload));
        }
        onHide();
    };

    const esActividad = projectDetail?.modo === "A";
    const esPrograma = projectDetail?.modo === "PR";

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No definida';

    // --- Helpers para elementos retrasados ---
    // Estructura real de BD confirmada:
    // alcanceEntregables: { nombre, deadline, completado, fecha_entregable }
    // tiempoFechasCriticas:{ description, date, completado, fecha_hito }
    // costoEntregable:     { entregable, costo, deadline, completado, fecha_cerrado, costoReal }
    // calidadMetricas:     { entregable, metrica, completado }  ← sin deadline, no aplica "retrasado"
    // todo:                { dueDate, done, task/name/descripcion }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const alcanceRetrasado = (alcanceEntregables || []).filter(ent => {
        const deadline = ent.deadline ? new Date(ent.deadline) : null;
        return deadline && deadline < hoy && !ent.completado;
    });

    const hitosRetrasados = (tiempoFechasCriticas || []).filter(h => {
        const fecha = h.date ? new Date(h.date) : null;
        return fecha && fecha < hoy && !h.completado;
    });

    const costosRetrasados = (costoEntregable || []).filter(c => {
        const deadline = c.deadline ? new Date(c.deadline) : null;
        return deadline && deadline < hoy && !c.completado;
    });

    // Calidad: no tiene deadline → mostramos los no completados como "pendientes"
    const calidadPendiente = (calidadMetricas || []).filter(c => !c.completado);

    // Tareas: done === true significa completada
    const tareasAtrasadas = (todo || []).filter(t => {
        const fecha = t.dueDate ? new Date(t.dueDate) : null;
        return fecha && fecha < hoy && !t.done;
    });

    const hayRetrasos = alcanceRetrasado.length > 0 || hitosRetrasados.length > 0 ||
        costosRetrasados.length > 0 || tareasAtrasadas.length > 0;
    const hayCualquierAlerta = hayRetrasos || calidadPendiente.length > 0;

    // --- Impacto acumulado de cambios Aprobados ---
    const getAnalisisImpacto = (s) =>
        typeof s.analisis_impacto === 'string' ? {} : (s.analisis_impacto || {});

    const solicitudesAprobadas = (listaSolicitudes || []).filter(s => s.estado === 'Aprobado');

    const impactoDolares = solicitudesAprobadas.reduce((acc, s) => {
        const val = parseFloat(getAnalisisImpacto(s).dolares);
        return acc + (isNaN(val) ? 0 : val);
    }, 0);

    const totalImpactoTiempo = solicitudesAprobadas
        .reduce((acc, s) => {
            const ai = typeof s.analisis_impacto === 'string'
                ? (() => { try { return JSON.parse(s.analisis_impacto); } catch { return {}; } })()
                : (s.analisis_impacto || {});
            return acc + Number(ai.tiempo || 0);
        }, 0);

    // --- Helper promedio encuesta ---
    const calcularPromedioEncuesta = (encuesta) => {
        const campos = [
            'comunicacion', 'rapidez_respuesta', 'manejo_reuniones',
            'cumplimiento_plazos', 'cumplimiento_alcance', 'calidad_entregado',
            'nivel_capacitaciones', 'gestion_documentacion', 'experiencia_director',
            'satisfaccion_general'
        ];
        const suma = campos.reduce((acc, campo) => acc + (encuesta[campo] || 0), 0);
        return (suma / campos.length).toFixed(1);
    };

    const getBadgeEstadoCambio = (estado) => {
        switch (estado) {
            case 'Aprobado': return 'success';
            case 'No Aprobado': return 'danger';
            case 'En Revisión': return 'warning';
            default: return 'secondary';
        }
    };

    const getBadgeImpacto = (impacto) => {
        switch (impacto) {
            case 'Alto': return 'danger';
            case 'Mediano': return 'warning';
            default: return 'success';
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {informeEditar ? 'Editar Informe de Avance' : 'Nuevo Informe de Avance'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                {Object.keys(errors).length > 0 && (
                    <Alert variant="danger" className="mb-3">
                        Por favor, complete todos los campos obligatorios.
                    </Alert>
                )}

                {/* Nombre */}
                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                        Nombre de la Persona <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese el nombre completo de quien genera el informe"
                        value={formData.nombrePersona}
                        onChange={(e) => handleChange('nombrePersona', e.target.value)}
                        isInvalid={!!errors.nombrePersona}
                    />
                    <Form.Control.Feedback type="invalid">{errors.nombrePersona}</Form.Control.Feedback>
                </Form.Group>

                {/* Fecha */}
                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Fecha del Informe</Form.Label>
                    <Form.Control
                        type="date"
                        value={formData.fechaInforme}
                        onChange={(e) => handleChange('fechaInforme', e.target.value)}
                    />
                </Form.Group>

                <hr className="my-4" />

                {/* Info del proyecto */}
                <h5 className="mb-3 text-primary">
                    <i className="bi bi-info-circle me-2"></i>
                    Información del {esActividad ? "Proyecto Personal" : esPrograma ? "Programa" : "Proyecto"}
                </h5>
                <Row className="mb-4">
                    <Col md={6}>
                        <div className="p-3 bg-light rounded">
                            <strong>Nombre:</strong>
                            <p className="mb-0">{projectDetail?.nombre}</p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="p-3 bg-light rounded">
                            <strong>Estado:</strong>
                            <p className="mb-0">
                                {projectDetail?.estado === 'P' && 'Planificado'}
                                {projectDetail?.estado === 'S' && 'Iniciado'}
                                {projectDetail?.estado === 'X' && 'En Ejecución'}
                                {projectDetail?.estado === 'E' && 'Cerrado'}
                            </p>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col md={6}>
                        <div className="p-3 bg-light rounded">
                            <strong>Director:</strong>
                            <p className="mb-0">
                                {projectDetail?.DirectorProyecto?.Persona
                                    ? `${projectDetail.DirectorProyecto.Persona.nombre} ${projectDetail.DirectorProyecto.Persona.apellido}`
                                    : 'No asignado'}
                            </p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="p-3 bg-light rounded">
                            <strong>Patrocinador:</strong>
                            <p className="mb-0">
                                {projectDetail?.Patrocinador?.Persona
                                    ? `${projectDetail.Patrocinador.Persona.nombre} ${projectDetail.Patrocinador.Persona.apellido}`
                                    : 'No asignado'}
                            </p>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col md={6}>
                        <div className="p-3 bg-light rounded">
                            <strong>Departamento:</strong>
                            <p className="mb-0">{projectDetail?.Departamento?.nombre}</p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="p-3 bg-light rounded">
                            <strong>Información breve:</strong>
                            <p className="mb-0">{projectDetail?.informacion}</p>
                        </div>
                    </Col>
                </Row>
                {!esPrograma && (
                    <Row className="mb-4">
                        <Col md={6}>
                            <div className="p-3 bg-light rounded">
                                <strong>Tipo de proyecto:</strong>
                                <p className="mb-0">
                                    {projectDetail?.tipo_proyecto === 1 && 'Ágil'}
                                    {projectDetail?.tipo_proyecto === 2 && 'Predictivo'}
                                    {projectDetail?.tipo_proyecto === 3 && 'Híbrido'}
                                </p>
                            </div>
                        </Col>
                    </Row>
                )}

                {/* Datos financieros y temporales para análisis */}
                <Row className="mb-4">
                    <Col md={4}>
                        <div className="p-3 bg-light rounded text-center">
                            <strong className="d-block mb-1">Presupuesto Planificado</strong>
                            <h5 className="text-primary mb-0">{formatCurrency(presupuesto)}</h5>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="p-3 bg-light rounded text-center">
                            <strong className="d-block mb-1">Fecha de Inicio</strong>
                            <p className="mb-0">{formatDate(projectDetail?.fecha_inicio)}</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="p-3 bg-light rounded text-center">
                            <strong className="d-block mb-1">Fecha de Cierre</strong>
                            <p className="mb-0">{formatDate(projectDetail?.fecha_cierre)}</p>
                        </div>
                    </Col>
                </Row>
                {ganttSummary && (
                    <Row className="mb-4">
                        <Col md={4}>
                            <div className="p-3 bg-light rounded text-center">
                                <strong className="d-block mb-1">Inicio (Gantt)</strong>
                                <p className="mb-0">{ganttSummary.start}</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-3 bg-light rounded text-center">
                                <strong className="d-block mb-1">Fin (Gantt)</strong>
                                <p className="mb-0">{ganttSummary.end}</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-3 bg-light rounded text-center">
                                <strong className="d-block mb-1">Total Días (Gantt)</strong>
                                <h5 className="text-info mb-0">{ganttSummary.totalDays} días</h5>
                            </div>
                        </Col>
                    </Row>
                )}

                <hr className="my-4" />

                {/* ── RESUMEN SATISFACCIÓN Y CONTROL DE CAMBIOS ── */}
                <h5 className="mb-3 text-primary">
                    <i className="bi bi-graph-up-arrow me-2"></i>
                    Resumen de Satisfacción y Control de Cambios
                </h5>
                <Row className="mb-3">
                    <Col md={4}>
                        <div className="p-3 bg-light rounded text-center">
                            <strong>Promedio Encuestas de Satisfacción:</strong>
                            <h4 className="text-success mb-0">{estadisticas?.satisfaccionGeneral} / 5</h4>
                            <small className="text-muted">Basado en {estadisticas?.totalEncuestas || 0} encuesta(s)</small>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="p-3 bg-light rounded text-center">
                            <strong>Total Cambios de Estados:</strong>
                            <h4 className="text-success mb-0">{logs?.length || 0}</h4>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="p-3 bg-light rounded text-center">
                            <strong>Solicitudes Aprobadas:</strong>
                            <h4 className="text-primary mb-0">{totalesAprobados.cantidad}</h4>
                            <small className="text-muted">de {listaSolicitudes.length} solicitudes</small>
                        </div>
                    </Col>
                </Row>

                {/* Desvío acumulado aprobado */}
                {totalesAprobados.cantidad > 0 && (
                    <div className="p-3 border border-warning rounded bg-white mb-4 d-flex align-items-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill text-warning fs-4 me-3"></i>
                        <div className="flex-grow-1">
                            <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.7rem' }}>
                                Total Desvío Acumulado (Aprobado)
                            </small>
                            <div className="d-flex gap-4 mt-1">
                                <div>
                                    <span className="text-dark h5 mb-0">{totalesAprobados.tiempo}</span>
                                    <span className="text-muted ms-1 small">días laborables</span>
                                </div>
                                <div className="border-start ps-4">
                                    <span className="text-success h5 mb-0 font-monospace">
                                        {formatCurrency(totalesAprobados.dolares)}
                                    </span>
                                    <span className="text-muted ms-1 small">USD adicionales</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── DETALLE ENCUESTAS DE SATISFACCIÓN ── */}
                {listaEncuestas && listaEncuestas.length > 0 && (
                    <>
                        <hr className="my-4" />
                        <h5 className="mb-3 text-primary">
                            <i className="bi bi-journal-check me-2"></i>
                            Detalle de Encuestas de Satisfacción
                        </h5>
                        <div className="table-responsive mb-3">
                            <Table striped bordered hover size="sm">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Fecha</th>
                                        <th className="text-center">Comunicación</th>
                                        <th className="text-center">Plazos</th>
                                        <th className="text-center">Alcance</th>
                                        <th className="text-center">Calidad</th>
                                        <th className="text-center">Promedio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaEncuestas.map(enc => {
                                        const promedio = parseFloat(calcularPromedioEncuesta(enc));
                                        return (
                                            <tr key={enc.id}>
                                                <td><strong>{enc.nombre}</strong></td>
                                                <td>{new Date(enc.createdAt).toLocaleDateString('es-ES')}</td>
                                                <td className="text-center">{enc.comunicacion || '-'}</td>
                                                <td className="text-center">{enc.cumplimiento_plazos || '-'}</td>
                                                <td className="text-center">{enc.cumplimiento_alcance || '-'}</td>
                                                <td className="text-center">{enc.calidad_entregado || '-'}</td>
                                                <td className="text-center">
                                                    <Badge bg={promedio >= 4 ? 'success' : promedio >= 3 ? 'warning' : 'danger'}>
                                                        {promedio} / 5
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </>
                )}

                {/* ── DETALLE CONTROLES DE CAMBIO ── */}
                {listaSolicitudes && listaSolicitudes.length > 0 && (
                    <>
                        <hr className="my-4" />
                        <h5 className="mb-3 text-primary">
                            <i className="bi bi-arrow-left-right me-2"></i>
                            Detalle de Solicitudes de Control de Cambios
                        </h5>
                        <div className="table-responsive mb-3">
                            <Table striped bordered hover size="sm">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre del Cambio</th>
                                        <th>Solicitante</th>
                                        <th className="text-center">Impacto</th>
                                        <th className="text-center">Estado</th>
                                        <th>Resolución</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaSolicitudes.map(sol => (
                                        <tr key={sol.id}>
                                            <td>{sol.id}</td>
                                            <td><strong>{sol.nombre_cambio}</strong></td>
                                            <td>{sol.nombre_solicitante}</td>
                                            <td className="text-center">
                                                <Badge bg={getBadgeImpacto(sol.impacto_proyecto)}>
                                                    {sol.impacto_proyecto}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <Badge bg={getBadgeEstadoCambio(sol.estado)}>
                                                    {sol.estado}
                                                </Badge>
                                            </td>
                                            <td style={{ maxWidth: '200px', fontSize: '0.8rem' }}>
                                                {sol.resolucion || <span className="text-muted">Sin resolución</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>

                        {/* Impacto acumulado de aprobados */}
                        {solicitudesAprobadas.length > 0 && (
                            <>
                                <small className="text-muted fw-bold text-uppercase d-block mb-2">
                                    <i className="bi bi-check-circle-fill text-success me-1"></i>
                                    Impacto acumulado de cambios aprobados ({solicitudesAprobadas.length})
                                </small>
                                <Row>
                                    <Col md={6}>
                                        <div className="p-3 rounded text-center border border-success border-opacity-50">
                                            <strong className="d-block mb-1 text-muted">
                                                <i className="bi bi-currency-dollar me-1"></i>
                                                Impacto Económico Total
                                            </strong>
                                            <h4 className="text-success mb-0">
                                                ${impactoDolares.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </h4>
                                            <small className="text-muted">
                                                suma de {solicitudesAprobadas.length} solicitud{solicitudesAprobadas.length !== 1 ? 'es' : ''} aprobada{solicitudesAprobadas.length !== 1 ? 's' : ''}
                                            </small>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="p-3 rounded text-center border border-success border-opacity-50">
                                            <strong className="d-block mb-1 text-muted">
                                                <i className="bi bi-clock me-1"></i>
                                                Impacto en Tiempo
                                            </strong>
                                            {totalImpactoTiempo > 0 ? (
                                                <>
                                                    <h4 className="text-success fw-bold mb-0">{totalImpactoTiempo}</h4>
                                                    <small className="text-muted">días laborables acumulados</small>
                                                </>
                                            ) : (
                                                <p className="text-muted mb-0 mt-2 small">Sin impacto en tiempo registrado</p>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </>
                )}

                {/* ── ELEMENTOS RETRASADOS / PENDIENTES ──
                    Retrasado = tiene deadline pasado Y completado !== true
                    Calidad: no tiene deadline, se muestran solo las no completadas aparte
                */}
                {hayCualquierAlerta && (
                    <>
                        <hr className="my-4" />
                        <h5 className="mb-3 text-danger">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            Elementos Retrasados / Pendientes
                        </h5>

                        {/* Alcance: { nombre, deadline, completado } */}
                        {alcanceRetrasado.length > 0 && (
                            <div className="mb-4">
                                <h6 className="fw-bold text-secondary">
                                    <i className="bi bi-diagram-3 me-2"></i>
                                    Alcance retrasado ({alcanceRetrasado.length})
                                </h6>
                                <div className="table-responsive">
                                    <Table bordered size="sm">
                                        <thead className="table-danger">
                                            <tr>
                                                <th>Entregable</th>
                                                <th className="text-center">Fecha Límite</th>
                                                <th className="text-center">Fecha Entregable Real</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alcanceRetrasado.map((ent, i) => (
                                                <tr key={i}>
                                                    <td>{ent.nombre}</td>
                                                    <td className="text-center text-danger fw-bold">
                                                        {ent.deadline ? new Date(ent.deadline).toLocaleDateString('es-ES') : '-'}
                                                    </td>
                                                    <td className="text-center text-muted">
                                                        {ent.fecha_entregable ? new Date(ent.fecha_entregable).toLocaleDateString('es-ES') : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* Hitos: { description, date, completado, fecha_hito } */}
                        {hitosRetrasados.length > 0 && (
                            <div className="mb-4">
                                <h6 className="fw-bold text-secondary">
                                    <i className="bi bi-flag me-2"></i>
                                    Hitos retrasados ({hitosRetrasados.length})
                                </h6>
                                <div className="table-responsive">
                                    <Table bordered size="sm">
                                        <thead className="table-danger">
                                            <tr>
                                                <th>Hito</th>
                                                <th className="text-center">Fecha Planificada</th>
                                                <th className="text-center">Fecha Real del Hito</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hitosRetrasados.map((h, i) => (
                                                <tr key={i}>
                                                    <td>{h.description}</td>
                                                    <td className="text-center text-danger fw-bold">
                                                        {h.date ? new Date(h.date).toLocaleDateString('es-ES') : '-'}
                                                    </td>
                                                    <td className="text-center text-muted">
                                                        {h.fecha_hito ? new Date(h.fecha_hito).toLocaleDateString('es-ES') : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* Costos: { entregable, costo, costoReal, deadline, completado, fecha_cerrado } */}
                        {costosRetrasados.length > 0 && (
                            <div className="mb-4">
                                <h6 className="fw-bold text-secondary">
                                    <i className="bi bi-currency-dollar me-2"></i>
                                    Costos retrasados ({costosRetrasados.length})
                                </h6>
                                <div className="table-responsive">
                                    <Table bordered size="sm">
                                        <thead className="table-danger">
                                            <tr>
                                                <th>Entregable</th>
                                                <th className="text-center">Costo Planificado ($)</th>
                                                <th className="text-center">Costo Real ($)</th>
                                                <th className="text-center">Fecha Límite</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {costosRetrasados.map((c, i) => (
                                                <tr key={i}>
                                                    <td>{c.entregable}</td>
                                                    <td className="text-center">{c.costo ?? '-'}</td>
                                                    <td className="text-center">{c.costoReal ?? '-'}</td>
                                                    <td className="text-center text-danger fw-bold">
                                                        {c.deadline ? new Date(c.deadline).toLocaleDateString('es-ES') : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* Calidad: { entregable, metrica, completado } — sin deadline, se muestran pendientes */}
                        {calidadPendiente.length > 0 && (
                            <div className="mb-4">
                                <h6 className="fw-bold text-secondary">
                                    <i className="bi bi-patch-check me-2"></i>
                                    Calidad pendiente ({calidadPendiente.length})
                                    <small className="fw-normal text-muted ms-2">(sin fecha de cierre registrada)</small>
                                </h6>
                                <div className="table-responsive">
                                    <Table bordered size="sm">
                                        <thead className="table-warning">
                                            <tr>
                                                <th>Entregable</th>
                                                <th>Métrica</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {calidadPendiente.map((c, i) => (
                                                <tr key={i}>
                                                    <td>{c.entregable}</td>
                                                    <td>{c.metrica || <span className="text-muted">Sin métrica definida</span>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* Tareas: { task, dueDate, done } */}
                        {tareasAtrasadas.length > 0 && (
                            <div className="mb-4">
                                <h6 className="fw-bold text-secondary">
                                    <i className="bi bi-check2-square me-2"></i>
                                    Tareas retrasadas ({tareasAtrasadas.length})
                                </h6>
                                <div className="table-responsive">
                                    <Table bordered size="sm">
                                        <thead className="table-danger">
                                            <tr>
                                                <th>Tarea</th>
                                                <th className="text-center">Fecha Límite</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tareasAtrasadas.map((t, i) => (
                                                <tr key={i}>
                                                    <td>{t.task || t.name || t.descripcion}</td>
                                                    <td className="text-center text-danger fw-bold">
                                                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('es-ES') : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ── RESUMEN DE EJECUCIÓN ── */}
                {(projectDetail?.estado === 'X' || projectDetail?.estado === 'E') && resumenEjecucion && (
                    <>
                        <hr className="my-4" />
                        <h5 className="mb-3 text-primary">
                            <i className="bi bi-graph-up-arrow me-2"></i>
                            Resumen de Ejecución
                        </h5>
                        <Row className="mb-4">
                            {!esActividad && (
                                <>
                                    <Col md={4} className="mb-3">
                                        <div className="p-3 bg-light rounded text-center">
                                            <strong className="d-block mb-2">Avance de Alcance</strong>
                                            <h4 className="text-success mb-0">{resumenEjecucion.alcance}%</h4>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <div className="p-3 bg-light rounded text-center">
                                            <strong className="d-block mb-2">Avance de Hitos</strong>
                                            <h4 className="text-success mb-0">{resumenEjecucion.hitos}%</h4>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <div className="p-3 bg-light rounded text-center">
                                            <strong className="d-block mb-2">Desviación de Costos</strong>
                                            <h4 className={resumenEjecucion.costoDesviacion >= 0 ? 'text-success' : 'text-danger'} mb-0>
                                                {resumenEjecucion.costoDesviacion}%
                                            </h4>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <div className="p-3 bg-light rounded text-center">
                                            <strong className="d-block mb-2">
                                                {esPrograma ? 'Avance de Beneficios' : 'Avance de Calidad'}
                                            </strong>
                                            <h4 className="text-success mb-0">
                                                {esPrograma ? resumenEjecucion.beneficios : resumenEjecucion.calidad}%
                                            </h4>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <div className="p-3 bg-light rounded text-center">
                                            <strong className="d-block mb-2">Nivel de Riesgo</strong>
                                            <h4 className="text-success mb-0">{resumenEjecucion.riesgoPromedio}%</h4>
                                        </div>
                                    </Col>
                                    {resumenEjecucion.gantt > 0 && (
                                        <Col md={4} className="mb-3">
                                            <div className="p-3 bg-light rounded text-center">
                                                <strong className="d-block mb-2">Avance de Gantt</strong>
                                                <h4 className="text-success mb-0">{resumenEjecucion.gantt}%</h4>
                                            </div>
                                        </Col>
                                    )}
                                </>
                            )}
                        </Row>
                    </>
                )}

                {/* ── RESUMEN DE DESEMPEÑO ── */}
                {(projectDetail?.estado === 'X' || projectDetail?.estado === 'E') && resumenDesempeno && (
                    <>
                        <hr className="my-4" />
                        <h5 className="mb-3 text-primary">
                            <i className="bi bi-speedometer2 me-2"></i>
                            Resumen de Desempeño
                        </h5>
                        <Row className="mb-4">
                            {[
                                { label: 'Alcance', key: 'alcance' },
                                { label: 'Hitos', key: 'hitos' },
                                { label: 'Costos', key: 'costos' },
                                { label: 'Todo', key: 'todo' },
                                { label: 'Kanban', key: 'eficiencia' },
                                { label: 'Cronograma', key: 'cronograma' },
                            ].map(({ label, key }) => (
                                <Col md={4} className="mb-3" key={key}>
                                    <div className="p-3 bg-light rounded text-center">
                                        <strong className="d-block mb-2">{label}</strong>
                                        <h4 className={resumenDesempeno[key] >= 1 ? 'text-success mb-0' : 'text-danger mb-0'}>
                                            {resumenDesempeno[key]?.toFixed(2)}
                                        </h4>
                                    </div>
                                </Col>
                            ))}
                        </Row>

                        {/* Matriz de Riesgos */}
                        {riesgosList && riesgosList.length > 0 && (
                            <>
                                <hr className="my-4" />
                                <h5 className="mb-3 text-primary">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    Matriz de Calor de Riesgos
                                </h5>
                                <div className="mb-4">
                                    <h6 className="text-muted mb-3">Riesgos Iniciales</h6>
                                    <RiskHeatmapMatrix riesgosList={riesgosList} showResidual={false} />
                                </div>
                                {riesgosList.some(r => r.completado) && (
                                    <div className="mb-4">
                                        <h6 className="text-muted mb-3">Riesgos Residuales</h6>
                                        <RiskHeatmapMatrix riesgosList={riesgosList} showResidual={true} />
                                        <div className="alert alert-info mt-3">
                                            <i className="bi bi-info-circle me-2"></i>
                                            <strong>Riesgos con plan completado:</strong> {riesgosList.filter(r => r.completado).length} de {riesgosList.length}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* ── LECCIONES APRENDIDAS ── */}
                {projectDetail?.estado === 'E' && (
                    <>
                        <hr className="my-4" />
                        <h5 className="mb-3 text-primary">
                            <i className="bi bi-book me-2"></i>
                            Lecciones Aprendidas
                        </h5>
                        <div className="p-3 bg-light rounded">
                            {leccionesAprendidas
                                ? <p style={{ whiteSpace: 'pre-wrap' }}>{leccionesAprendidas}</p>
                                : <p className="text-muted mb-0">No disponible por el momento</p>
                            }
                        </div>
                    </>
                )}

                <hr className="my-4" />

                {/* ── ANÁLISIS Y PRÓXIMOS PASOS ── */}
                <h5 className="mb-3 text-primary">
                    <i className="bi bi-pencil-square me-2"></i>
                    Análisis y Próximos Pasos
                </h5>
                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                        Conclusiones del Informe <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Describa las conclusiones principales del período reportado..."
                        value={formData.conclusiones}
                        onChange={(e) => handleChange('conclusiones', e.target.value)}
                        isInvalid={!!errors.conclusiones}
                    />
                    <Form.Control.Feedback type="invalid">{errors.conclusiones}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                        Próximos Pasos <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Describa las actividades y acciones planificadas para el siguiente período..."
                        value={formData.proximosPasos}
                        onChange={(e) => handleChange('proximosPasos', e.target.value)}
                        isInvalid={!!errors.proximosPasos}
                    />
                    <Form.Control.Feedback type="invalid">{errors.proximosPasos}</Form.Control.Feedback>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="success" onClick={handleSubmit}>
                    {informeEditar ? 'Actualizar Informe' : 'Guardar Informe'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InformeAvanceModal;