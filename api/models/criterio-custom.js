module.exports = (db, Sequelize) => {
  const CriterioCustom = db.define('criterio_custom', {
    descripcion: { type: Sequelize.STRING },
    orden: { type: Sequelize.INTEGER },
    peso_limite: { type: Sequelize.DECIMAL },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'criterio_custom',
  });

  CriterioCustom.associate = (models) => {
    const { TipoEvaluacion, OpcionCustom, Usuario, Batch } = models;

    CriterioCustom.Usuario = CriterioCustom.belongsTo(Usuario, {
      as: 'Usuario',
      foreignKey: 'usuario',
    });

    CriterioCustom.TipoEvaluacion = CriterioCustom.belongsTo(TipoEvaluacion, {
      as: 'TipoEvaluacion',
      foreignKey: 'tipo_evaluacion',
    });

    CriterioCustom.Batch = CriterioCustom.belongsTo(Batch, {
      as: 'Batch',
      foreignKey: 'batch',
    });

    CriterioCustom.OpcionCustom = CriterioCustom.hasMany(OpcionCustom, {
      as: 'OpcionCustom',
      foreignKey: 'criterio_custom',
    });

  };

  return CriterioCustom;
};
