module.exports = (db, Sequelize) => {
  const EvaluacionDetalle = db.define('evaluacion_detalle', {
    puntaje: { type: Sequelize.DECIMAL },
    peso_obtenido: { type: Sequelize.DECIMAL },
    peso_limite: { type: Sequelize.DECIMAL },
  }, {
    freezeTableName: true,
    tableName: 'evaluacion_detalle',
  });

  EvaluacionDetalle.associate = (models) => {
    const { Evaluacion, Opcion, OpcionCustom } = models;

    EvaluacionDetalle.Evaluacion = EvaluacionDetalle.belongsTo(Evaluacion, {
      as: 'Evaluacion',
      foreignKey: 'evaluacion',
    });

    EvaluacionDetalle.Opcion = EvaluacionDetalle.belongsTo(Opcion, {
      as: 'OpcionBase',
      foreignKey: 'opcion',
    });

    EvaluacionDetalle.OpcionCustom = EvaluacionDetalle.belongsTo(OpcionCustom, {
      as: 'OpcionCustom',
      foreignKey: 'opcion_custom',
    });
  };

  return EvaluacionDetalle;
};