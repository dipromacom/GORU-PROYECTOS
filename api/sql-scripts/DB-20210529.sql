--TIPO DE TELEFONO
delete from tipo_telefono ;

insert into tipo_telefono (nombre, activo) values ('Domicilio', true);
insert into tipo_telefono (nombre, activo) values ('Celular', true);
insert into tipo_telefono (nombre, activo) values ('Trabajo', true );
insert into tipo_telefono (nombre, activo) values ('Prueba', false );

select * from tipo_telefono tt ;

-- TIPO DE DIRECCION
delete from tipo_direccion ;

insert into tipo_direccion (nombre, activo) values ('Domicilio', true);
insert into tipo_direccion (nombre, activo) values ('Facturación', true);
insert into tipo_direccion (nombre, activo) values ('Prueba', true);

select * from tipo_direccion td ;

-- PERSONA
alter table persona 
add column identificacion varchar(13) null;

alter table contacto_telefonico add column telefono varchar(15) null;

-- delete from contacto_telefonico ct;
-- delete from persona p;


select * from persona p;
select * from contacto_telefonico ct;
select * from direccion d;

alter table direccion drop column ciudad;
alter table direccion add column ciudad varchar(50) null;


select * from persona p ;
select * from director_proyecto dp ;

------------------------------------------------------
-- TIPO DE PROYECTO
select * from tipo_proyecto tp 

insert into tipo_proyecto (nombre, descripcion, activo) values ('Proyecto de iniciación', 'Proyecto de iniciación', true)

select * from patrocinador p ;

select * from empresa e ;
select * from departamento d ;

delete from departamento ;

alter table departamento add column fecha_creacion timestamp null;
alter table departamento add column abreviacion varchar(10) null;


-------------------------------------------------------------
alter table proyecto
add constraint FK_proyecto_tipo_proyecto
foreign key (tipo_proyecto)
references tipo_proyecto(ID);

alter table proyecto
add constraint FK_proyecto_director
foreign key (director)
references director_proyecto(ID);

alter table proyecto
add constraint FK_proyecto_patrocinador
foreign key (patrocinador)
references patrocinador(ID);

alter table proyecto
add constraint FK_proyecto_empresa
foreign key (empresa)
references empresa(ID);

alter table proyecto
add constraint FK_proyecto_departamento
foreign key (departamento)
references departamento(ID);

select * from proyecto p ;


------------------------------------------------------------
-- TIPO DE EVALUACION
select * from tipo_evaluacion te ;

insert into tipo_evaluacion (nombre, activo) values ('Priorización de Proyectos', true);

------------------------------------------------------------

select * from tipo_evaluacion te ;

select * from criterio c ;

insert into criterio (tipo_evaluacion, criterio, orden, peso_limite, activo) values (1, 'Urgencia: Cuando debe estar lista la iniciativa?', 1, 3, true);
insert into criterio (tipo_evaluacion, criterio, orden, peso_limite, activo) values (1, 'Alineación - Cómo la iniciativa soporta los objetivos y metas de la organización?', 2, 15, true);
insert into criterio (tipo_evaluacion, criterio, orden, peso_limite, activo) values (1, 'Productividad – Cuanto la iniciativa incrementará la productividad?', 3, 12, true);
insert into criterio (tipo_evaluacion, criterio, orden, peso_limite, activo) values (1, 'Ahorro de costos – Cuanto esta iniciativa ahorrará en los próximos 3 años?', 4, 10, true);
insert into criterio (tipo_evaluacion, criterio, orden, peso_limite, activo) values (1, 'Incremento de ingresos – Cuanto permitirá esta iniciativa incrementar los ingresos?', 5, 20, true);
insert into criterio (tipo_evaluacion, criterio, orden, peso_limite, activo) values (1, 'MORAL – Es qué medida permitirá incrementar la moral?', 6, 10, true);
insert into criterio (tipo_evaluacion, criterio, orden, peso_limite, activo) values (1, 'Tiempo para completar – Cuanto tiempo tomará la finalización de la iniciativa una vez iniciada?', 7, 5, true);
insert into criterio (tipo_evaluacion, criterio, orden, peso_limite, activo) values (1, 'Posición de Competencia – Cómo esta iniciativa mejorará la posición de competencia?', 8, 15, true);
insert into criterio (tipo_evaluacion, criterio, orden, peso_limite, activo) values (1, 'Niver de Servicio – Cómo esta iniciativa mejorará el nivel de servicio hacia el cliente?', 9, 15, true);


----------------------------------------------------------
select * from opcion;

insert into opcion (criterio, descripcion, orden, puntos, activo) values (1, '2 semanas', 1, 10, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (1, '30 días', 2, 9, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (1, '90 días', 3, 7, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (1, '4 meses', 4, 6, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (1, '6 meses', 5, 4, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (1, '9 meses', 6, 3, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (1, '1 año', 7, 2, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (1, 'Más de un año', 8, 1, true);


insert into opcion (criterio, descripcion, orden, puntos, activo) values (2, 'Soporte directo', 1, 10, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (2, 'Soporte moderado', 2, 5, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (2, 'No provee soporte', 3, 1, true);

insert into opcion (criterio, descripcion, orden, puntos, activo) values (3, '51% or más', 1, 10, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (3, '36% to 50%', 2, 9, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (3, '21% to 35%', 3, 7, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (3, '11% to 20%', 4, 5, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (3, 'Menos de 10%', 5, 2, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (3, 'Disminuirá la productividad', 6, 1, true);

insert into opcion (criterio, descripcion, orden, puntos, activo) values (4, '51% or más', 1, 10, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (4, '36% to 50%', 2, 9, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (4, '21% to 35%', 3, 7, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (4, '11% to 20%', 4, 5, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (4, 'Menos de 10%', 5, 2, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (4, 'Incrementarán los costos', 6, 1, true);

insert into opcion (criterio, descripcion, orden, puntos, activo) values (5, '51% or más', 1, 10, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (5, '36% to 50%', 2, 9, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (5, '21% to 35%', 3, 7, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (5, '11% to 20%', 4, 5, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (5, 'Menos de 10%', 5, 2, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (5, 'Disminuiran los ingresos', 6, 1, true);

insert into opcion (criterio, descripcion, orden, puntos, activo) values (6, 'Incrementa drásticamente', 1, 10, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (6, 'Generalmente incrementa', 2, 9, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (6, 'No tiene efecto', 3, 5, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (6, 'Generalmente disminuye', 4, 2, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (6, 'Disminuye drásticamente', 5, 1, true);


insert into opcion (criterio, descripcion, orden, puntos, activo) values (7, '2 semanas', 1, 10, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (7, '30 días', 2, 9, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (7, '90 días', 3, 7, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (7, '3 meses', 4, 6, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (7, '6 meses', 5, 4, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (7, '9 meses', 6, 3, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (7, '1 año', 7, 2, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (7, 'Más de un año', 8, 1, true);

insert into opcion (criterio, descripcion, orden, puntos, activo) values (8, 'Incrementa drásticamente', 1, 10, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (8, 'Generalmente incrementa', 2, 9, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (8, 'No afecta', 3, 5, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (8, 'Generalmente disminuye', 4, 2, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (8, 'Disminuye drásticamente', 5, 1, true);

insert into opcion (criterio, descripcion, orden, puntos, activo) values (9, 'Incrementa drásticamente', 1, 10, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (9, 'Generalmente incrementa', 2, 9, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (9, 'No afecta', 3, 5, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (9, 'Generalmente disminuye', 4, 2, true);
insert into opcion (criterio, descripcion, orden, puntos, activo) values (9, 'Disminuye drásticamente', 5, 1, true);

------------------------------------------------------------------------------------------------------------------

select * from nivel_permiso np ;

insert into nivel_permiso (nombre, abreviatura, activo) values ('Read', 'R', true);
insert into nivel_permiso (nombre, abreviatura, activo) values ('Write', 'W', true);

select * from tipo_licencia tl ;

insert into tipo_licencia (nombre, descripcion, activo) values ('Corporativo', 'Corporativo', true);

alter table tipo_licencia add column fecha_creacion timestamp null;

--------------------------------------------------------------------------------------------------------------

select * from menu;

INSERT INTO menu (id, nombre, menu_padre, activo) VALUES(1, 'Menu Padre 1', NULL, true);
INSERT INTO menu (id, nombre, menu_padre, activo) VALUES(2, 'Menu Hijo 1.1', 1, true);
INSERT INTO menu (id, nombre, menu_padre, activo) VALUES(3, 'Menu Hijo 1.1.1', 2, true);
INSERT INTO menu (id, nombre, menu_padre, activo) VALUES(4, 'Menu Padre 2', NULL, true);
INSERT INTO menu (id, nombre, menu_padre, activo) VALUES(5, 'Menu Padre 2.1', 4, true);

--------------------------------------------------------------------------------------------------------------

select * from permiso_licencia pl ;

-------------------------------------------------------------------------------------------------------------
select * from empresa e ;
select * from persona p ;
select * from nivel_permiso np ;
select * from tipo_licencia tl ;

select * from usuario u ;
select * from proyecto p ;





