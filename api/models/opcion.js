module.exports = (db, Sequelize) => {
  const Opcion = db.define('opcion', {
    descripcion: { type: Sequelize.STRING },
    orden: { type: Sequelize.INTEGER },
    puntos: { type: Sequelize.INTEGER },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'opcion',
  });

  Opcion.associate = (models) => {
    const { Criterio, EvaluacionDetalle } = models;

    Opcion.Criterio = Opcion.belongsTo(Criterio, {
      as: 'Criterio',
      foreignKey: 'criterio',
    });

    Opcion.EvaluacionDetalle = Opcion.hasMany(EvaluacionDetalle, {
      as: 'EvaluacionDetalle',
      foreignKey: 'opcion',
    });
    
  };

  return Opcion;
};
