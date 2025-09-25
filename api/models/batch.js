module.exports = (db, Sequelize) => {
  const Batch = db.define('batch', {
    id: {
      type: { type: Sequelize.INTEGER },
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: { type: Sequelize.STRING },
    descripcion: { type: Sequelize.STRING },
    periodo: { type: Sequelize.INTEGER },
    activo: { type: Sequelize.BOOLEAN },
    cerrado: { type: Sequelize.BOOLEAN }, 
    paso_actual: { type: Sequelize.STRING },
    setup_terminado: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'batch',
  });

  Batch.associate = (models) => {
    const { Usuario, CriterioCustom, Evaluacion } = models;

    Batch.Usuario = Batch.belongsTo(Usuario, {
      as: 'Usuario',
      foreignKey: 'usuario',
    });

    Batch.CriterioCustom = Batch.hasMany(CriterioCustom, {
      as: 'CriterioCustom',
      foreignKey: 'batch'
    });

    Batch.Evaluacion = Batch.hasMany(Evaluacion, {
      as: 'Evaluacion',
      foreignKey: 'batch'
    });
  };

  return Batch;
};