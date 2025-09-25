module.exports = (db, Sequelize) => {
  const Departamento = db.define('departamento', {
    nombre: { type: Sequelize.STRING },
    abreviacion: { type: Sequelize.STRING },
    fecha_creacion: { type: Sequelize.DATE },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'departamento',
  });

  Departamento.associate = (models) => {
    const { Proyecto } = models;

    Departamento.Proyecto = Departamento.hasMany(Proyecto, {
      as: 'Proyecto',
      foreignKey: 'departamento',
    });
  };

  return Departamento;
};
