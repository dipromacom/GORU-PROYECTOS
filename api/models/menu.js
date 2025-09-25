module.exports = (db, Sequelize) => {
  const Menu = db.define('menu', {
    nombre: { type: Sequelize.STRING },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'menu',
  });

  Menu.associate = (models) => {
    const { PermisoLicencia, TipoLicencia } = models;
    Menu.Menu = Menu.hasMany(Menu, {
      as: 'Menu',
      foreignKey: 'menu_padre',
    });

    Menu.TipoLicencia = Menu.belongsToMany(TipoLicencia, {
      as: 'PermisoLicencia',
      through: PermisoLicencia,
      foreignKey: 'menu',
    });

    Menu.TipoLicencia = Menu.hasMany(PermisoLicencia, {
      as: 'TipoLicencia',
      foreignKey: 'menu',
    });
  };

  return Menu;
};
