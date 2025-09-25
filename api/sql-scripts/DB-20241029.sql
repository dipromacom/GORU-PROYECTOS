-- Tabla para almacenar los datos de los interesados
CREATE TABLE interesados (
    id SERIAL PRIMARY KEY,
    proyecto_id INT NOT NULL,  
    id_interesado INT NOT NULL, 
    nombre_interesado VARCHAR(255) NOT NULL,  
    telefono VARCHAR(15),  
    email VARCHAR(255) UNIQUE NOT NULL, 
    otros_datos_contacto TEXT,  
    codigo VARCHAR(10) NOT NULL UNIQUE,  
    rol VARCHAR(100) NOT NULL,  
    cargo VARCHAR(100) NOT NULL,  
    compania_clasificacion VARCHAR(255),  
    expectativas TEXT, 
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    UNIQUE (proyecto_id, id_interesado)  
);

CREATE TABLE evaluaciones_Interesados (
    id SERIAL PRIMARY KEY,
    proyecto_id INT NOT NULL,  
    interesado_id INT NOT NULL,  
    compromiso INT CHECK (compromiso BETWEEN 1 AND 5),  
    poder INT CHECK (poder BETWEEN 1 AND 5),  
    influencia INT CHECK (influencia BETWEEN 1 AND 5),  
    conocimiento INT CHECK (conocimiento BETWEEN 1 AND 5), 
    interes_actitud INT CHECK (interes_actitud BETWEEN -1 AND 1), 
    valoracion INT CHECK (valoracion BETWEEN 1 AND 10),  
    accion_estrategica VARCHAR(255),  
    responsable_estrategia VARCHAR(255), 
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    UNIQUE (proyecto_id, interesado_id) 
);

CREATE TABLE no_disponibilidad (
    id SERIAL PRIMARY KEY,
    interesado_id INT NOT NULL,  
    fecha_inicio TIMESTAMP NOT NULL,  
    fecha_fin TIMESTAMP NOT NULL,  
    motivo VARCHAR(255)
);