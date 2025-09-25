module.exports = (db, Sequelize) => {
  const Empresa = db.define('empresa', {
    tipo_identificacion: { type: Sequelize.STRING },
    identificacion: { type: Sequelize.STRING },
    nombre: { type: Sequelize.STRING },
    activo: { type: Sequelize.BOOLEAN },
  }, {
    freezeTableName: true,
    tableName: 'empresa',
  });

  Empresa.associate = (models) => {
    const { Proyecto, Usuario } = models;

    Empresa.Proyecto = Empresa.hasMany(Proyecto, {
      as: 'Proyecto',
      foreignKey: 'empresa',
    });

    Empresa.Usuario = Empresa.hasMany(Usuario, {
      as: 'Usuario',
      foreignKey: 'empresa',
    });
  };

  return Empresa;
};
