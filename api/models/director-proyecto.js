module.exports = (db, Sequelize) => {
  const DirectorProyecto = db.define('director_proyecto', {
    fecha_creacion: { type: Sequelize.DATE },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'director_proyecto',
  });

  DirectorProyecto.associate = (models) => {
    const { Persona, Proyecto } = models;

    DirectorProyecto.Persona = DirectorProyecto.belongsTo(Persona, {
      as: 'Persona',
      foreignKey: 'persona',
    });

    DirectorProyecto.Proyecto = DirectorProyecto.hasMany(Proyecto, {
      as: 'Proyecto',
      foreignKey: 'director',
    });
  };

  return DirectorProyecto;
};
