import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ProgressBar, Alert } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { actions as surveyActions } from "../../reducers/encuesta-satisfaccion";
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';

const SurveyModal = ({ show, onHide, proyectoId, encuestaPrevia, nombreProyecto, tipoProyecto }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nombre: '',
        comunicacion: null,
        rapidez_respuesta: null,
        manejo_reuniones: null,
        cumplimiento_plazos: null,
        cumplimiento_alcance: null,
        calidad_entregado: null,
        nivel_capacitaciones: null,
        gestion_documentacion: null,
        experiencia_director: null,
        satisfaccion_general: null,
        comentarios: ''
    });
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();

    useEffect(() => {
        if (encuestaPrevia) {
            setFormData(encuestaPrevia);
        }
    }, [encuestaPrevia]);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        // Limpiar error del campo cuando se modifica
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const validateStep = (currentStep) => {
        const newErrors = {};

        if (currentStep === 1) {
            // Validar nombre
            if (!formData.nombre || formData.nombre.trim() === '') {
                newErrors.nombre = 'El nombre es obligatorio';
            }
            // Validar campos de Step 1
            if (formData.comunicacion === null) newErrors.comunicacion = 'Campo obligatorio';
            if (formData.rapidez_respuesta === null) newErrors.rapidez_respuesta = 'Campo obligatorio';
            if (formData.manejo_reuniones === null) newErrors.manejo_reuniones = 'Campo obligatorio';
        }

        if (currentStep === 2) {
            if (formData.cumplimiento_plazos === null) newErrors.cumplimiento_plazos = 'Campo obligatorio';
            if (formData.cumplimiento_alcance === null) newErrors.cumplimiento_alcance = 'Campo obligatorio';
            if (formData.calidad_entregado === null) newErrors.calidad_entregado = 'Campo obligatorio';
        }

        if (currentStep === 3) {
            if (formData.nivel_capacitaciones === null) newErrors.nivel_capacitaciones = 'Campo obligatorio';
            if (formData.gestion_documentacion === null) newErrors.gestion_documentacion = 'Campo obligatorio';
            if (formData.experiencia_director === null) newErrors.experiencia_director = 'Campo obligatorio';
            if (formData.satisfaccion_general === null) newErrors.satisfaccion_general = 'Campo obligatorio';
            // comentarios es opcional, no se valida
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handlePrev = () => {
        setStep(step - 1);
        setErrors({}); // Limpiar errores al retroceder
    };

    const handleSubmit = () => {
        if (!validateStep(step)) {
            return;
        }

        const payload = {
            ...formData,
            proyectoId: proyectoId,
            proyecto_id: proyectoId,
            tipo_proyecto: 'proyecto', // Por defecto como solicitaste
            nombre: formData.nombre.trim()
        };

        dispatch(surveyActions.saveSurvey(payload));
        onHide();
        // Resetear formulario
        setFormData({
            nombre: '',
            comunicacion: null,
            rapidez_respuesta: null,
            manejo_reuniones: null,
            cumplimiento_plazos: null,
            cumplimiento_alcance: null,
            calidad_entregado: null,
            nivel_capacitaciones: null,
            gestion_documentacion: null,
            experiencia_director: null,
            satisfaccion_general: null,
            comentarios: ''
        });
        setStep(1);
        setErrors({});
    };

    const handleRechazar = () => {
        dispatch(surveyActions.rejectSurvey(proyectoId));
        onHide();
        setStep(1);
        setErrors({});
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>Encuesta de Satisfacción</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ProgressBar
                    now={(step / 3) * 100}
                    label={`Paso ${step} de 3`}
                    className="mb-4"
                />

                {Object.keys(errors).length > 0 && (
                    <Alert variant="danger" className="mb-3">
                        Por favor, complete todos los campos obligatorios antes de continuar.
                    </Alert>
                )}

                {step === 1 && (
                    <StepOne
                        data={formData}
                        onChange={handleChange}
                        errors={errors}
                    />
                )}
                {step === 2 && (
                    <StepTwo
                        data={formData}
                        onChange={handleChange}
                        errors={errors}
                    />
                )}
                {step === 3 && (
                    <StepThree
                        data={formData}
                        onChange={handleChange}
                        errors={errors}
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                {step === 1 && (
                    <Button variant="link" className="text-danger" onClick={handleRechazar}>
                        No deseo participar
                    </Button>
                )}
                {step > 1 && (
                    <Button variant="secondary" onClick={handlePrev}>
                        Anterior
                    </Button>
                )}
                {step < 3 ? (
                    <Button variant="primary" onClick={handleNext}>
                        Siguiente
                    </Button>
                ) : (
                    <Button variant="success" onClick={handleSubmit}>
                        Enviar Encuesta
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default SurveyModal;