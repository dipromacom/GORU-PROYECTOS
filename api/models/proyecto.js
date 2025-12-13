/* eslint-disable no-unused-vars */
const { BOOLEAN } = require("sequelize");

module.exports = (db, Sequelize) => {
  const Proyecto = db.define('proyecto', {
    numero: { type: Sequelize.UUID, readOnly: true },
    nombre: { type: Sequelize.STRING },
    informacion: { type: Sequelize.STRING },
    fecha_creacion: { type: Sequelize.DATE },
    activo: { type: Sequelize.BOOLEAN },
    estado: { type: Sequelize.STRING },
    fecha_inicio: { type: Sequelize.DATE },
    fecha_cierre: { type: Sequelize.DATE },
    pendiente_asignacion: { type: Sequelize.BOOLEAN },
    documentacion_adjunta: { type: Sequelize.TEXT },
    contrato: { type: Sequelize.TEXT },
    caso_negocio: { type: Sequelize.TEXT },
    portafolio: { type: Sequelize.TEXT },
    enunciado: { type: Sequelize.TEXT },
    programa: { type: Sequelize.TEXT },
    justificacion: { type: Sequelize.TEXT },
    descripcion: { type: Sequelize.TEXT },
    analisis_viabilidad: { type: Sequelize.TEXT },
    objetivo_desc: { type: Sequelize.TEXT }, // falta
    objetivo_costo: { type: Sequelize.NUMBER },
    objetivo_plazo: { type: Sequelize.NUMBER },
    objetivo_desempeno: { type: Sequelize.NUMBER },
    alcance_entregables: { type: Sequelize.JSONB },
    tiempo_duracion: { type: Sequelize.NUMBER },
    tiempo_fechas_criticas: { type: Sequelize.JSONB }, // Fechas criticas
    costo_entregable: { type: Sequelize.JSONB }, // cambiar a JsonB
    costo_reserva_contingencia: { type: Sequelize.NUMBER },
    costo_reserva_gestion: { type: Sequelize.NUMBER },
    costo_reserva_contingencia_real: { type: Sequelize.NUMBER },
    costo_reserva_gestion_real: { type: Sequelize.NUMBER },
    calidad_metricas: { type: Sequelize.JSONB }, // cambiar a JSONB
    riesgos: { type: Sequelize.JSONB },
    recursos_requeridos: { type: Sequelize.TEXT },
    supuestos: { type: Sequelize.TEXT },
    restricciones: { type: Sequelize.TEXT },
    max_desvio_presupuesto: { type: Sequelize.NUMBER },
    max_desvio_tiempo: { type: Sequelize.NUMBER },
    dir_autorizado_firmas: { type: Sequelize.BOOLEAN },
    dir_tareas_funciones: { type: Sequelize.TEXT },
    tipos_informes: { type: Sequelize.JSONB },
    incentivo: { type: Sequelize.TEXT },
    autidad_control_cambios: { type: Sequelize.BOOLEAN },
    plazo_periodo: { type: Sequelize.TEXT },
    max_desviacion_periodo: { type: Sequelize.TEXT },
    modo: { type: Sequelize.STRING },
    lecciones_aprendidas: { type: Sequelize.TEXT },
    beneficios: { type: Sequelize.JSONB },
  }, {
    freezeTableName: true,
    tableName: 'proyecto',
  });

  Proyecto.associate = (models) => {
    const {
      TipoProyecto, Empresa, Departamento, DirectorProyecto,
      Patrocinador, Evaluacion, Usuario, UsuarioProyecto, RolProyecto
    } = models;

    Proyecto.TipoProyecto = Proyecto.belongsTo(TipoProyecto, {
      as: 'TipoProyecto',
      foreignKey: 'tipo_proyecto',
    });

    Proyecto.Empresa = Proyecto.belongsTo(Empresa, {
      as: 'Empresa',
      foreignKey: 'empresa',
    });

    Proyecto.Departamento = Proyecto.belongsTo(Departamento, {
      as: 'Departamento',
      foreignKey: 'departamento',
    });

    Proyecto.DirectorProyecto = Proyecto.belongsTo(DirectorProyecto, {
      as: 'DirectorProyecto',
      foreignKey: 'director',
    });

    Proyecto.Patrocinador = Proyecto.belongsTo(Patrocinador, {
      as: 'Patrocinador',
      foreignKey: 'patrocinador',
    });

    Proyecto.Evaluacion = Proyecto.hasMany(Evaluacion, {
      as: 'Evaluacion',
      foreignKey: 'proyecto',
    });

    /*Proyecto.Usuario = Proyecto.belongsTo(Usuario, {
      as: 'Usuario',
      foreignKey: 'usuario_creador',
    });*/

    Proyecto.Usuarios = Proyecto.belongsToMany(Usuario, {
      as: 'Usuarios',
      through: UsuarioProyecto, // Nombre de la tabla pivote que creamos
      foreignKey: 'proyecto_id', // Clave foránea en la tabla pivote que apunta a Proyecto
      otherKey: 'usuario_id', // Clave foránea en la tabla pivote que apunta a Usuario
    });
    // Si necesitas ver los roles asignados a los usuarios en este proyecto:
    Proyecto.UsuariosAsignados = Proyecto.hasMany(UsuarioProyecto, {
      as: 'UsuariosAsignados',
      foreignKey: 'proyecto_id',
    });


  };

  return Proyecto;
};
