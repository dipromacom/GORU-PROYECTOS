-- public.tarea definition

-- Drop table

-- DROP TABLE public.tarea;

CREATE TABLE public.tarea (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	title varchar(255) NOT NULL,
	description text NULL,
	prioridad varchar(1) NULL,
	"label" varchar(100) NULL,
	done bool DEFAULT false NULL,
	duedate date NULL,
	proyecto_id int4 NULL,
	CONSTRAINT tarea_pkey PRIMARY KEY (id)
);


-- public.tarea foreign keys
ALTER TABLE public.tarea ADD CONSTRAINT tarea_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyecto(id) ON DELETE CASCADE;

-- kanban
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


create table kanban_status (
	id UUID not null primary key,
	title VARCHAR(250),
	index INT, 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	project_id INT,
	foreign key (project_id) references proyecto(id)
);

CREATE TRIGGER update_kanban_status_updated_at
BEFORE UPDATE ON kanban_status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

create table kanban_task (
	id UUID not null primary key,
	content text,
	index INT,
	priority VARCHAR(100),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	status_id UUID,
	foreign key (status_id) references kanban_status(id)
);

CREATE TRIGGER update_kanban_task_updated_at
BEFORE UPDATE ON kanban_task
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

alter table proyecto add plazo_periodo varchar(10);
alter table proyecto add max_desviacion_periodo varchar(10);

delete from tipo_proyecto;

insert into tipo_proyecto values (1, 'Agil', 'Proyecto Agil', true);
insert into tipo_proyecto values (2, 'Predictivo', 'Proyecto Predictivo', true);