import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
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
    leccionesAprendidas 
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
            newErrors.nombrePersona = 'El nombre de la persona es obligatorio'; // ← AGREGAR
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
        if (!validateForm()) {
            return;
        }

        const payload = {
            proyectoId: proyectoId,
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
    const esProyecto = projectDetail?.modo === "P";

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {informeEditar ? 'Editar Informe de Avance' : 'Nuevo Informe de Avance'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {Object.keys(errors).length > 0 && (
                    <Alert variant="danger" className="mb-3">
                        Por favor, complete todos los campos obligatorios.
                    </Alert>
                )}

                {/* Nombre de la Persona */}
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
                    <Form.Control.Feedback type="invalid">
                        {errors.nombrePersona}
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Fecha del Informe */}
                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Fecha del Informe</Form.Label>
                    <Form.Control
                        type="date"
                        value={formData.fechaInforme}
                        onChange={(e) => handleChange('fechaInforme', e.target.value)}
                    />
                </Form.Group>

                <hr className="my-4" />

                {/* Información del Proyecto (Solo lectura) */}
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
                                {projectDetail?.DirectorProyecto?.Persona ?
                                    `${projectDetail.DirectorProyecto.Persona.nombre} ${projectDetail.DirectorProyecto.Persona.apellido}` :
                                    'No asignado'}
                            </p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="p-3 bg-light rounded">
                            <strong>Patrocinador:</strong>
                            <p className="mb-0">
                                {projectDetail?.Patrocinador?.Persona ?
                                    `${projectDetail.Patrocinador.Persona.nombre} ${projectDetail.Patrocinador.Persona.apellido}` :
                                    'No asignado'}
                            </p>
                        </div>
                    </Col>
                </Row>

                <Row className="mb-4">
                    <Col md={6}>
                        <div className="p-3 bg-light rounded">
                            <strong>Departamento:</strong>
                            <p className="mb-0">
                                {projectDetail?.Departamento?.nombre}</p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="p-3 bg-light rounded">
                            <strong>Información breve:</strong>
                            <p className="mb-0">
                                {projectDetail?.informacion}
                            </p>
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

                <hr className="my-4" />
                <h5 className="mb-3 text-primary">
                    <i className="bi bi-graph-up-arrow me-2"></i>
                    Resumen de Satisfacción y Control de cambios
                </h5>
                <Row className="mb-4">
                    <Col md={6}>
                        <div className="p-3 bg-light rounded text-center">
                            <strong>Promedio Encuestas de satisfacción:</strong>                         
                            <h4 className="text-success mb-0">
                                {estadisticas?.satisfaccionGeneral} / 5</h4>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="p-3 bg-light rounded text-center">
                            <strong>Total cambios de estados:</strong>
                            <h4 className="text-success mb-0">
                                {logs.length}</h4>
                        </div>
                    </Col>
                </Row>

                {/* Resumen de Ejecución */}
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
                                            <strong className="d-block mb-2">
                                                {esPrograma ? 'Nivel de Riesgo' : 'Nivel de Riesgo'}
                                            </strong>
                                            <h4 className="text-success mb-0">
                                                {esPrograma ? resumenEjecucion.riesgoPromedio : resumenEjecucion.riesgoPromedio}%
                                            </h4>
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

                {/* Resumen de Desempeño */}
                {(projectDetail?.estado === 'X' || projectDetail?.estado === 'E') && resumenDesempeno && (
                    <>
                        <hr className="my-4" />
                        <h5 className="mb-3 text-primary">
                            <i className="bi bi-speedometer2 me-2"></i>
                            Resumen de Desempeño
                        </h5>
                        <Row className="mb-4">
                            <Col md={4} className="mb-3">
                                <div className="p-3 bg-light rounded text-center">
                                    <strong className="d-block mb-2">Alcance</strong>
                                    <h4 className={resumenDesempeno.alcance >= 1 ? 'text-success' : 'text-danger'} mb-0>
                                        {resumenDesempeno.alcance.toFixed(2)}
                                    </h4>
                                </div>
                            </Col>
                            <Col md={4} className="mb-3">
                                <div className="p-3 bg-light rounded text-center">
                                    <strong className="d-block mb-2">Hitos</strong>
                                    <h4 className={resumenDesempeno.hitos >= 1 ? 'text-success' : 'text-danger'} mb-0>
                                        {resumenDesempeno.hitos.toFixed(2)}
                                    </h4>
                                </div>
                            </Col>
                            <Col md={4} className="mb-3">
                                <div className="p-3 bg-light rounded text-center">
                                    <strong className="d-block mb-2">Costos</strong>
                                    <h4 className={resumenDesempeno.costos >= 1 ? 'text-success' : 'text-danger'} mb-0>
                                        {resumenDesempeno.costos.toFixed(2)}
                                    </h4>
                                </div>
                            </Col>
                            <Col md={4} className="mb-3">
                                <div className="p-3 bg-light rounded text-center">
                                    <strong className="d-block mb-2">Todo</strong>
                                    <h4 className={resumenDesempeno.todo >= 1 ? 'text-success' : 'text-danger'} mb-0>
                                        {resumenDesempeno.todo.toFixed(2)}
                                    </h4>
                                </div>
                            </Col>
                            <Col md={4} className="mb-3">
                                <div className="p-3 bg-light rounded text-center">
                                    <strong className="d-block mb-2">Kanban</strong>
                                    <h4 className={resumenDesempeno.eficiencia >= 1 ? 'text-success' : 'text-danger'} mb-0>
                                        {resumenDesempeno.eficiencia.toFixed(2)}
                                    </h4>
                                </div>
                            </Col>
                            <Col md={4} className="mb-3">
                                <div className="p-3 bg-light rounded text-center">
                                    <strong className="d-block mb-2">Cronograma</strong>
                                    <h4 className={resumenDesempeno.cronograma >= 1 ? 'text-success' : 'text-danger'} mb-0>
                                        {resumenDesempeno.cronograma.toFixed(2)}
                                    </h4>
                                </div>
                            </Col>
                        </Row>
                        {/* Matriz de Riesgos */}
                        {riesgosList && riesgosList.length > 0 && (projectDetail?.estado === 'X' || projectDetail?.estado === 'E') && (
                            <>
                                <hr className="my-4" />
                                <h5 className="mb-3 text-primary">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    Matriz de Calor de Riesgos
                                </h5>

                                {/* Matriz Inicial */}
                                <div className="mb-4">
                                    <h6 className="text-muted mb-3">Riesgos Iniciales</h6>
                                    <RiskHeatmapMatrix riesgosList={riesgosList} showResidual={false} />
                                </div>

                                {/* Matriz Residual - Solo si hay planes cerrados */}
                                {riesgosList.some(r => r.completado) && (
                                    <div className="mb-4">
                                        <h6 className="text-muted mb-3">Riesgos Residuales (Después de Planes de Respuesta)</h6>
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

                {projectDetail?.estado === 'E' && (
                    <>
                        <hr className="my-4" />
                        <h5 className="mb-3 text-primary">
                            <i className="bi bi-book me-2"></i>
                            Lecciones Aprendidas
                        </h5>
                        <div className="p-3 bg-light rounded">
                            {leccionesAprendidas ? (
                                <p style={{ whiteSpace: 'pre-wrap' }}>{leccionesAprendidas}</p>
                            ) : (
                                <p className="text-muted mb-0">No disponible por el momento</p>
                            )}
                        </div>
                    </>
                )}

                <hr className="my-4" />

                {/* Campos Editables */}
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
                    <Form.Control.Feedback type="invalid">
                        {errors.conclusiones}
                    </Form.Control.Feedback>
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
                    <Form.Control.Feedback type="invalid">
                        {errors.proximosPasos}
                    </Form.Control.Feedback>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="success" onClick={handleSubmit}>
                    {informeEditar ? 'Actualizar Informe' : 'Guardar Informe'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InformeAvanceModal;