alter table proyecto drop documentacion_adjunta;
alter table proyecto drop contrato;
alter table proyecto drop caso_negocio;


alter table proyecto add documentacion_adjunta text;
alter table proyecto add contrato text;
alter table proyecto add caso_negocio text;
alter table proyecto add enunciado text;
