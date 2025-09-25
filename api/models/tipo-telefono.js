module.exports = (db, Sequelize) => {
  const TipoTelefono = db.define('tipo_telefono', {
    nombre: { type: Sequelize.STRING },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'tipo_telefono',
  });

  TipoTelefono.associate = (models) => {
    const { Persona, ContactoTelefonico } = models;

    TipoTelefono.Persona = TipoTelefono.belongsToMany(Persona, {
      as: 'ContactoTelefonico',
      through: ContactoTelefonico,
      foreignKey: 'tipo_telefono',
    });

    TipoTelefono.Persona = TipoTelefono.hasMany(ContactoTelefonico, {
      as: 'Persona',
      foreignKey: 'tipo_telefono',
    });
  };

  return TipoTelefono;
};
