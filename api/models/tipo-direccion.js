module.exports = (db, Sequelize) => {
  const TipoDireccion = db.define('tipo_direccion', {
    nombre: { type: Sequelize.STRING },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'tipo_direccion',
  });

  TipoDireccion.associate = (models) => {
    const { Persona, Direccion } = models;

    TipoDireccion.Persona = TipoDireccion.belongsToMany(Persona, {
      as: 'Direccion',
      through: Direccion,
      foreignKey: 'tipo_direccion',
    });

    TipoDireccion.Persona = TipoDireccion.hasMany(Direccion, {
      as: 'Persona',
      foreignKey: 'tipo_direccion',
    });
  };

  return TipoDireccion;
};
