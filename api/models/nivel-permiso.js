module.exports = (db, Sequelize) => {
  const NivelPermiso = db.define('nivel_permiso', {
    nombre: { type: Sequelize.STRING },
    abreviatura: { type: Sequelize.STRING },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'nivel_permiso',
  });

  NivelPermiso.associate = (models) => {
    const { Usuario } = models;

    NivelPermiso.Usuario = NivelPermiso.hasMany(Usuario, {
      as: 'Usuario',
      foreignKey: 'nivel_permiso',
    });
  };

  return NivelPermiso;
};
