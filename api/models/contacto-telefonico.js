module.exports = (db, Sequelize) => {
  const ContactoTelefonico = db.define('contacto_telefonico', {
    id: {
      type: { type: Sequelize.INTEGER },
      primaryKey: true,
      autoIncrement: true,
      // allowNull: false,
    },
    telefono: { type: Sequelize.STRING },
    fecha_creacion: { type: Sequelize.DATE },
  }, {
    freezeTableName: true,
    tableName: 'contacto_telefonico',
  });

  ContactoTelefonico.associate = (models) => {
    const { Persona, TipoTelefono } = models;

    ContactoTelefonico.Persona = ContactoTelefonico.belongsTo(Persona, { as: 'Persona', foreignKey: 'persona' });
    ContactoTelefonico.TipoTelefono = ContactoTelefonico.belongsTo(TipoTelefono, { as: 'TipoTelefono', foreignKey: 'tipo_telefono' });
  };

  return ContactoTelefonico;
};
