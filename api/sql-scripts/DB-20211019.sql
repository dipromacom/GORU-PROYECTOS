alter table proyecto 
drop column numero;

alter table proyecto 
add column numero varchar(15);

alter table batch 
add column paso_actual varchar(50);

alter table batch 
add column setup_terminado boolean;

alter table criterio 
rename column criterio 
to descripcion;

alter table criterio_custom
rename column criterio 
to descripcion;

alter table opcion_custom 
drop constraint fk_opcion_custom_criterio_custom,
add constraint fk_opcion_custom_criterio_custom
foreign key (criterio_custom)
references criterio_custom(id)
on delete cascade;


delete from evaluacion_detalle ;


select * from batch b ;


select * from criterio_custom cc order by orden ;
select * from opcion_custom oc where criterio_custom = 196;


INSERT INTO "criterio_custom" ("id","usuario") VALUES (DEFAULT,7);