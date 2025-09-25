alter table proyecto add usuario_creador integer;

alter table proyecto
add constraint FK_proyecto_usuario_creador
foreign key (usuario_creador)
references usuario(id);