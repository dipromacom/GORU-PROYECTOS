import React from 'react';
import { Form } from 'react-bootstrap';
import RatingField from './RatingField';

const StepThree = ({ data, onChange, errors }) => {
    return (
        <div>
            <h5 className="mb-4">Cierre del Proyecto</h5>
            <RatingField
                label="7. Capacitaciones y transferencia"
                description="Calidad de las capacitaciones y entrega de conocimientos."
                field="nivel_capacitaciones"
                value={data.nivel_capacitaciones}
                onChange={onChange}
                error={errors?.nivel_capacitaciones}
            />
            <RatingField
                label="8. Gestión de documentación"
                description="Orden y utilidad de los manuales y documentos entregados."
                field="gestion_documentacion"
                value={data.gestion_documentacion}
                onChange={onChange}
                error={errors?.gestion_documentacion}
            />
            <RatingField
                label="9. Experiencia del Director de Proyecto"
                description="Liderazgo y manejo del proyecto por parte del director asignado."
                field="experiencia_director"
                value={data.experiencia_director}
                onChange={onChange}
                error={errors?.experiencia_director}
            />
            <RatingField
                label="10. Satisfacción General"
                description="¿Cuál es su nivel de satisfacción global con Goru?"
                field="satisfaccion_general"
                value={data.satisfaccion_general}
                onChange={onChange}
                error={errors?.satisfaccion_general}
            />
            <Form.Group className="mt-4 mb-3">
                <Form.Label className="fw-bold">
                    Comentarios Adicionales / Lecciones Aprendidas
                    <span className="text-muted ms-2">(Opcional)</span>
                </Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Cuéntenos qué podemos mejorar o qué fue lo que más le gustó..."
                    value={data.comentarios || ""}
                    onChange={(e) => onChange('comentarios', e.target.value)}
                />
            </Form.Group>
        </div>
    );
};

export default StepThree;