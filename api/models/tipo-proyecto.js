module.exports = (db, Sequelize) => {
  const TipoProyecto = db.define('tipo_proyecto', {
    nombre: { type: Sequelize.STRING },
    descripcion: { type: Sequelize.STRING },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'tipo_proyecto',
  });

  TipoProyecto.associate = (models) => {
    const { Proyecto } = models;

    TipoProyecto.Proyecto = TipoProyecto.hasMany(Proyecto, {
      as: 'Proyecto',
      foreignKey: 'tipo_proyecto',
    });
  };

  return TipoProyecto;
};
