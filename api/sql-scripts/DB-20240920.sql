-- SE TIENE QUE EJECUTAR PARA DEJAR DE USAR UN NUMERO COMO TEXTO Y SE UTILICE COMO UN NUMERO UNICO ALEATORIO
alter table proyecto drop column numero;
alter table proyecto add column numero UUID NOT NULL DEFAULT gen_random_uuid();

-- SE EJECUTA PARA SETEAR UUIDs POR DEFAULT
update proyecto set numero = gen_random_uuid();



alter table proyecto add pendiente_asignacion boolean default true ;
alter table proyecto add documentacion_adjunta boolean;
alter table proyecto add contrato boolean;
alter table proyecto add caso_negocio boolean;
alter table proyecto add portafolio text;
alter table proyecto add programa text;
alter table proyecto add justificacion text;
alter table proyecto add descripcion text;
alter table proyecto add analisis_viabilidad text;
alter table proyecto add objetivo_desc text;
alter table proyecto add objetivo_costo numeric(10,2);
alter table proyecto add objetivo_plazo numeric(10,2);
alter table proyecto add objetivo_desempeno numeric(10,2);
alter table proyecto add alcance_entregables jsonb;
alter table proyecto add tiempo_duracion numeric(10,2);
alter table proyecto add tiempo_fechas_criticas jsonb;
alter table proyecto add costo_entregable  jsonb;
alter table proyecto add costo_reserva_contingencia  numeric(10,2);
alter table proyecto add costo_reserva_gestion  numeric(10,2);
alter table proyecto add calidad_metricas  jsonb;

alter table proyecto add riesgos jsonb;
alter table proyecto add recursos_requeridos text;
alter table proyecto add supuestos text;
alter table proyecto add restricciones text;
alter table proyecto add max_desvio_presupuesto numeric(10,2);
alter table proyecto add max_desvio_tiempo numeric(10,2);
alter table proyecto add dir_autorizado_firmas boolean;
alter table proyecto add dir_tareas_funciones text;
alter table proyecto add tipos_informes jsonb;
alter table proyecto add incentivo text;
alter table proyecto add autidad_control_cambios boolean;