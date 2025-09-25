module.exports = (db, Sequelize) => {
  const TipoEvaluacion = db.define('tipo_evaluacion', {
    nombre: { type: Sequelize.STRING },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'tipo_evaluacion',
  });

  TipoEvaluacion.associate = (models) => {
    const { Criterio, CriterioCustom, Evaluacion } = models;

    TipoEvaluacion.Criterio = TipoEvaluacion.hasMany(Criterio, {
      as: 'Criterio',
      foreignKey: 'tipo_evaluacion',
    });

    TipoEvaluacion.CriterioCustom = TipoEvaluacion.hasMany(CriterioCustom, {
      as: 'CriterioCustom',
      foreignKey: 'tipo_evaluacion',
    });

    Criterio.Evaluacion = Criterio.hasMany(Evaluacion, {
      as: 'Evaluacion',
      foreignKey: 'tipo_evaluacion',
    });
  };

  return TipoEvaluacion;
};
