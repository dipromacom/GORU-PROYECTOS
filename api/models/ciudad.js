module.exports = (db, Sequelize) => {
  const Ciudad = db.define('ciudad', {
    id: {
      type: { type: Sequelize.INTEGER },
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: { type: Sequelize.STRING },
    pais: { type: Sequelize.STRING },
  }, {
    freezeTableName: true,
    tableName: 'ciudad',
  });

  Ciudad.associate = (models) => {
    const { Persona, Direccion } = models;

    Ciudad.Persona = Ciudad.belongsToMany(Persona, {
      as: 'Direccion',
      through: Direccion,
      foreignKey: 'ciudad',

    });

    Ciudad.Persona = Ciudad.hasMany(Direccion, {
      as: 'Persona',
      foreignKey: 'ciudad',
    });
  };

  return Ciudad;
};
