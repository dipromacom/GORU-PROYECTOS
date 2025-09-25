module.exports = (db, Sequelize) => {
  const TipoLicencia = db.define('tipo_licencia', {
    nombre: { type: Sequelize.STRING },
    descripcion: { type: Sequelize.STRING },
    fecha_creacion: { type: Sequelize.DATE },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'tipo_licencia',
  });

  TipoLicencia.associate = (models) => {
    const { PermisoLicencia, Menu, Usuario } = models;

    TipoLicencia.Menu = TipoLicencia.belongsToMany(Menu, {
      as: 'PermisoLicencia',
      through: PermisoLicencia,
      foreignKey: 'tipo_licencia',
    });

    TipoLicencia.Menu = TipoLicencia.hasMany(PermisoLicencia, {
      as: 'Menu',
      foreignKey: 'tipo_licencia',
    });

    TipoLicencia.Usuario = TipoLicencia.hasMany(Usuario, {
      as: 'Usuario',
      foreignKey: 'tipo_licencia',
    });
  };

  return TipoLicencia;
};
