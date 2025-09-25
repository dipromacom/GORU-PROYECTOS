ALTER TABLE evaluaciones_Interesados
DROP CONSTRAINT evaluaciones_Interesados_proyecto_id_interesado_id_key;

ALTER TABLE evaluaciones_Interesados
DROP COLUMN proyecto_id;

CREATE TABLE criterios (
    id SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL
);

INSERT INTO criterios (descripcion) 
VALUES 
    ('Los productos pueden ser reciclados.'),
    ('Los productos son energéticamente eficientes.'),
    ('El producto es perjudicial para el medio ambiente.'),
    ('Tiene una política de gestión ambiental activa.'),
    ('Posible impacto negativo por residuos sólidos.'),
    ('Posible impacto negativo por residuos líquidos.'),
    ('Posible impacto negativo por residuos peligrosos.'),
    ('Posible impacto negativo en la vida de la sociedad.'),
    ('Posible daño a la imagen.');

CREATE TABLE analisis_impacto (
    id SERIAL PRIMARY KEY,
    proyecto_id INT,
    criterio_id INT,
    weight DECIMAL(5, 2) NOT NULL,
    rating INT CHECK (rating >= 0 AND rating <= 4) NOT NULL,
    total DECIMAL(5, 2) GENERATED ALWAYS AS (weight * rating) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
