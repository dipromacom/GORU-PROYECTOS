module.exports = (db, Sequelize) => {
  const Patrocinador = db.define('patrocinador', {
    fecha_creacion: { type: Sequelize.DATE },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'patrocinador',
  });

  Patrocinador.associate = (models) => {
    const { Persona, Proyecto } = models;

    Patrocinador.Persona = Patrocinador.belongsTo(Persona, {
      as: 'Persona',
      foreignKey: 'persona',
    });

    Patrocinador.Proyecto = Patrocinador.hasMany(Proyecto, {
      as: 'Proyecto',
      foreignKey: 'empresa',
    });
  };
  return Patrocinador;
};
