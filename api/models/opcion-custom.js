module.exports = (db, Sequelize) => {
  const OpcionCustom = db.define('opcion_custom', {
    descripcion: { type: Sequelize.STRING },
    orden: { type: Sequelize.INTEGER },
    puntos: { type: Sequelize.INTEGER },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'opcion_custom',
  });

  OpcionCustom.associate = (models) => {
    const { CriterioCustom, EvaluacionDetalle } = models;

    OpcionCustom.CriterioCustom = OpcionCustom.belongsTo(CriterioCustom, {
      as: 'CriterioCustom',
      foreignKey: 'criterio_custom',
      onDelete: 'CASCADE',
    });

    OpcionCustom.EvaluacionDetalle = OpcionCustom.hasMany(EvaluacionDetalle, {
      as: 'EvaluacionDetalle',
      foreignKey: 'opcion_custom',
    });
    
  };

  return OpcionCustom;
};
