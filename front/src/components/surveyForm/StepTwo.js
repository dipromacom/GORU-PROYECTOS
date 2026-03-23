import React from 'react';
import RatingField from './RatingField';

const StepTwo = ({ data, onChange, errors }) => {
    return (
        <div>
            <h5 className="mb-4">Resultados y Compromisos</h5>
            <RatingField
                label="4. Cumplimiento de plazos"
                description="¿Se respetaron las fechas de entrega acordadas en el cronograma?"
                field="cumplimiento_plazos"
                value={data.cumplimiento_plazos}
                onChange={onChange}
                error={errors?.cumplimiento_plazos}
            />
            <RatingField
                label="5. Cumplimiento de alcance"
                description="¿Se completaron todos los requerimientos pactados inicialmente?"
                field="cumplimiento_alcance"
                value={data.cumplimiento_alcance}
                onChange={onChange}
                error={errors?.cumplimiento_alcance}
            />
            <RatingField
                label="6. Calidad de lo entregado"
                description="Nivel técnico y funcional de los entregables recibidos."
                field="calidad_entregado"
                value={data.calidad_entregado}
                onChange={onChange}
                error={errors?.calidad_entregado}
            />
        </div>
    );
};

export default StepTwo;