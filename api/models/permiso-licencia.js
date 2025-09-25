module.exports = (db, Sequelize) => {
  const PermisoLicencia = db.define('permiso_licencia', {
    fecha_creacion: { type: Sequelize.DATE },
  }, {
    freezeTableName: true,
    tableName: 'permiso_licencia',
  });

  PermisoLicencia.associate = (models) => {
    const { TipoLicencia, Menu } = models;

    PermisoLicencia.TipoLicencia = PermisoLicencia.belongsTo(TipoLicencia, { as: 'TipoLicencia', foreignKey: 'tipo_licencia' });
    PermisoLicencia.Menu = PermisoLicencia.belongsTo(Menu, { as: 'Menu', foreignKey: 'menu' });
  };

  return PermisoLicencia;
};
