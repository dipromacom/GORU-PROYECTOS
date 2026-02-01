
import React from 'react';
import { Form } from 'react-bootstrap';
import RatingField from './RatingField';

const StepOne = ({ data, onChange, errors }) => {
    return (
        <div>
            <h5 className="mb-4">Información General</h5>

            {/* Campo de Nombre */}
            <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                    Nombre <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Ingrese su nombre completo"
                    value={data.nombre || ''}
                    onChange={(e) => onChange('nombre', e.target.value)}
                    isInvalid={!!errors?.nombre}
                />
                <Form.Control.Feedback type="invalid">
                    {errors?.nombre}
                </Form.Control.Feedback>
            </Form.Group>

            <h5 className="mb-4 mt-5">Gestión y Comunicación</h5>

            <RatingField
                label="1. Comunicación con el equipo"
                description="¿Qué tan fluida y clara fue la comunicación durante el proyecto?"
                field="comunicacion"
                value={data.comunicacion}
                onChange={onChange}
                error={errors?.comunicacion}
            />
            <RatingField
                label="2. Rapidez de respuesta"
                description="Capacidad de respuesta ante dudas o problemas surgidos."
                field="rapidez_respuesta"
                value={data.rapidez_respuesta}
                onChange={onChange}
                error={errors?.rapidez_respuesta}
            />
            <RatingField
                label="3. Manejo de reuniones"
                description="Efectividad, puntualidad y relevancia de las reuniones mantenidas."
                field="manejo_reuniones"
                value={data.manejo_reuniones}
                onChange={onChange}
                error={errors?.manejo_reuniones}
            />
        </div>
    );
};

export default StepOne;