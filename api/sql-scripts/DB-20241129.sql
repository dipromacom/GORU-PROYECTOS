-- Actualizar las preguntas existentes
UPDATE criterios SET descripcion = 'Tiene una política de gestión ambiental activa.' WHERE descripcion = 'Tiene una política de gestión ambiental y social activa';
UPDATE criterios SET descripcion = 'Los productos pueden ser reciclados.' WHERE descripcion = 'Los productos pueden ser reciclados';
UPDATE criterios SET descripcion = 'Los productos son energéticamente eficientes.' WHERE descripcion = 'Los productos son energéticamente eficientes';
UPDATE criterios SET descripcion = 'El producto es perjudicial para el medio ambiente.' WHERE descripcion = 'El producto es perjudicial para el medio ambiente';
UPDATE criterios SET descripcion = 'Posible impacto negativo por residuos sólidos.' WHERE descripcion = 'Posible impacto negativo por residuos sólidos';
UPDATE criterios SET descripcion = 'Posible impacto negativo por residuos líquidos.' WHERE descripcion = 'Posible impacto negativo por residuos líquidos';
UPDATE criterios SET descripcion = 'Posible impacto negativo por residuos peligrosos.' WHERE descripcion = 'Posible impacto negativo por residuos peligrosos';
UPDATE criterios SET descripcion = 'Posible impacto negativo en la vida de la sociedad.' WHERE descripcion = 'Posible impacto negativo en la vida de la sociedad';

-- Insertar la nueva pregunta
INSERT INTO criterios (descripcion) 
VALUES ('Posible daño a la imagen');

-- Agregar un nuevo campo para habilitar/deshabilitar preguntas
ALTER TABLE criterios ADD COLUMN activo BOOLEAN DEFAULT TRUE;

--Actualizar todas las filas existentes para que inicialmente estén habilitadas -- [opcional]
UPDATE criterios SET activo = TRUE;


CREATE TABLE respuesta_analisis (
    id INT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    total_calificacion DECIMAL(10, 2) NOT NULL,
    link VARCHAR(2048),
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE respuesta_analisis
    ALTER COLUMN id SET NOT NULL;

ALTER TABLE respuesta_analisis
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;

ALTER TABLE analisis_impacto
    ALTER COLUMN weight TYPE DECIMAL(5, 1),
    ALTER COLUMN total TYPE DECIMAL(5, 1);
