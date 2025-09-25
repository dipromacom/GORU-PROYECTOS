module.exports = (db, Sequelize) => {
  const Persona = db.define('persona', {
    tipo_identificacion: { type: Sequelize.STRING },
    identificacion: { type: Sequelize.STRING },
    nombre: { type: Sequelize.STRING },
    apellido: { type: Sequelize.STRING },
    nickname: { type: Sequelize.STRING },
    empresa: { type: Sequelize.STRING },
    fecha_nacimiento: { type: Sequelize.DATE },
    fecha_creacion: { type: Sequelize.DATE },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'persona',
  });

  Persona.associate = (models) => {
    const {
      TipoTelefono, ContactoTelefonico, TipoDireccion, Direccion,
      DirectorProyecto, Patrocinador, Usuario, Ciudad,
    } = models;

    Persona.TipoTelefono = Persona.belongsToMany(TipoTelefono, {
      as: 'ContactoTelefonico',
      through: ContactoTelefonico,
      foreignKey: 'persona',
    });

    Persona.TipoTelefono = Persona.hasMany(ContactoTelefonico, {
      as: 'TipoTelefono',
      foreignKey: 'persona',
    });

    Persona.TipoDireccion = Persona.belongsToMany(TipoDireccion, {
      as: 'DireccionTipoDireccion',
      through: Direccion,
      foreignKey: 'persona',
    });

    Persona.TipoDireccion = Persona.hasMany(Direccion, {
      as: 'TipoDireccion',
      foreignKey: 'persona',
    });

    Persona.Ciudad = Persona.belongsToMany(Ciudad, {
      as: 'DireccionCiudad',
      through: Direccion,
      foreignKey: 'persona',
    });

    Persona.Ciudad = Persona.hasMany(Direccion, {
      as: 'Ciudad',
      foreignKey: 'persona',
    });

    Persona.DirectorProyecto = Persona.hasMany(DirectorProyecto, {
      as: 'DirectorProyecto',
      foreignKey: 'persona',
    });

    Persona.Patrocinador = Persona.hasMany(Patrocinador, {
      as: 'Patrocinador',
      foreignKey: 'persona',
    });

    Persona.Usuario = Persona.hasMany(Usuario, {
      as: 'Usuario',
      foreignKey: 'persona',
    });
  };

  return Persona;
};
