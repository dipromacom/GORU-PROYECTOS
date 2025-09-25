module.exports = (db, Sequelize) => {
  const Evaluacion = db.define('evaluacion', {
    fecha_creacion: { type: Sequelize.DATE },
    fecha_modificacion: { type: Sequelize.DATE },
    puntaje_total: { type: Sequelize.DECIMAL },
    peso_total: { type: Sequelize.DECIMAL },
  }, {
    freezeTableName: true,
    tableName: 'evaluacion',
  });

  Evaluacion.associate = (models) => {
    const { Proyecto, TipoEvaluacion, Usuario, EvaluacionDetalle, Batch } = models;

    Evaluacion.Proyecto = Evaluacion.belongsTo(Proyecto, {
      as: 'Proyecto',
      foreignKey: 'proyecto',
    });

    Evaluacion.TipoEvaluacion = Evaluacion.belongsTo(TipoEvaluacion, {
      as: 'TipoEvaluacion',
      foreignKey: 'tipo_evaluacion',
    });

    Evaluacion.Batch = Evaluacion.belongsTo(Batch, {
      as: 'Batch',
      foreignKey: 'batch',
    });

    Evaluacion.Usuario = Evaluacion.belongsTo(Usuario, {
      as: 'Usuario',
      foreignKey: 'usuario',
    });

    Evaluacion.EvaluacionDetalle = Usuario.hasMany(EvaluacionDetalle, {
      as: 'EvaluacionDetalle',
      foreignKey: 'evaluacion',
    });
  };

  return Evaluacion;
};