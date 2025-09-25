module.exports = (db, Sequelize) => {
  const Direccion = db.define('direccion', {
    id: {
      type: { type: Sequelize.INTEGER },
      primaryKey: true,
      autoIncrement: true,
    },
    pais: { type: Sequelize.STRING },
    calle_principal: { type: Sequelize.STRING },
    calle_secundaria: { type: Sequelize.STRING },
  }, {
    freezeTableName: true,
    tableName: 'direccion',
  });

  Direccion.associate = (models) => {
    const { Persona, TipoDireccion, Ciudad } = models;

    Direccion.Persona = Direccion.belongsTo(Persona, { as: 'Persona', foreignKey: 'persona' });
    Direccion.TipoDireccion = Direccion.belongsTo(TipoDireccion, { as: 'TipoDireccion', foreignKey: 'tipo_direccion' });
    Direccion.Ciudad = Direccion.belongsTo(Ciudad, { as: 'Ciudad', foreignKey: 'ciudad' });
  };

  return Direccion;
};
