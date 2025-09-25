

SELECT column_name, constraint_name, constraint_type
FROM information_schema.constraint_column_usage
JOIN information_schema.table_constraints
USING (constraint_name, table_schema, table_name)
WHERE table_name = 'interesados';

ALTER TABLE interesados DROP CONSTRAINT interesados_codigo_key;
ALTER TABLE interesados DROP CONSTRAINT interesados_proyecto_id_id_interesado_key;

--------------------------------------------------
ALTER TABLE tarea
ADD COLUMN interesado character varying,
ADD COLUMN id_interesado integer;
