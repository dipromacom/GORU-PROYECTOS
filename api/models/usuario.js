// const { Proyecto } = require(".");

module.exports = (db, Sequelize) => {
  const Usuario = db.define('usuario', {
    username: { type: Sequelize.STRING },
    clave: { type: Sequelize.STRING },
    fecha_creacion: { type: Sequelize.DATE },
    ultima_sesion: { type: Sequelize.DATE },
    fecha_suspension: { type: Sequelize.DATE },
    fecha_eliminacion: { type: Sequelize.DATE },
    fecha_limite_licencia: { type: Sequelize.DATE },
    suspendido: { type: Sequelize.BOOLEAN },
    eliminado: { type: Sequelize.BOOLEAN },
    aws_id: { type: Sequelize.STRING },
    confirmado: { type: Sequelize.BOOLEAN }
  }, {
    freezeTableName: true,
    tableName: 'usuario',
  });

  Usuario.associate = (models) => {
    const {
      Empresa, Persona, TipoLicencia, NivelPermiso, CriterioCustom, Evaluacion, Proyecto
    } = models;

    Usuario.Empresa = Usuario.belongsTo(Empresa, {
      as: 'Empresa',
      foreignKey: 'empresa',
    });

    Usuario.Persona = Usuario.belongsTo(Persona, {
      as: 'Persona',
      foreignKey: 'persona',
    });

    Usuario.TipoLicencia = Usuario.belongsTo(TipoLicencia, {
      as: 'TipoLicencia',
      foreignKey: 'tipo_licencia',
    });

    Usuario.NivelPermiso = Usuario.belongsTo(NivelPermiso, {
      as: 'NivelPermiso',
      foreignKey: 'nivel_permiso',
    });

    Usuario.CriterioCustom = Usuario.hasMany(CriterioCustom, {
      as: 'CriterioCustom',
      foreignKey: 'usuario',
    });

    Usuario.Evaluacion = Usuario.hasMany(Evaluacion, {
      as: 'Evaluacion',
      foreignKey: 'usuario',
    });

    Usuario.Proyecto = Usuario.hasMany(Proyecto, {
      as: 'Usuario',
      foreignKey: 'usuario_creador',
    });
  };

  return Usuario;
};
