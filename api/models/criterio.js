module.exports = (db, Sequelize) => {
  const Criterio = db.define('criterio', {
    descripcion: { type: Sequelize.STRING },
    orden: { type: Sequelize.INTEGER },
    peso_limite: { type: Sequelize.DECIMAL },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'criterio',
  });

  Criterio.associate = (models) => {
    const { TipoEvaluacion, Opcion } = models;

    Criterio.TipoEvaluacion = Criterio.belongsTo(TipoEvaluacion, {
      as: 'TipoEvaluacion',
      foreignKey: 'tipo_evaluacion',
    });

    Criterio.Opcion = Criterio.hasMany(Opcion, {
      as: 'Opcion',
      foreignKey: 'criterio',
    });

  };

  return Criterio;
};
