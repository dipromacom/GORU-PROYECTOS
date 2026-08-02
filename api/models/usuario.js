// const { Proyecto } = require(".");

module.exports = (db, Sequelize) => {
  const Usuario = db.define('usuario', {
    username: { type: Sequelize.STRING },
    clave: { type: Sequelize.STRING },
    // ... otras propiedades ...
    fecha_creacion: { type: Sequelize.DATE },
    ultima_sesion: { type: Sequelize.DATE },
    fecha_suspension: { type: Sequelize.DATE },
    fecha_eliminacion: { type: Sequelize.DATE },
    fecha_limite_licencia: { type: Sequelize.DATE },
    suspendido: { type: Sequelize.BOOLEAN },
    eliminado: { type: Sequelize.BOOLEAN },
    aws_id: { type: Sequelize.STRING },
    confirmado: { type: Sequelize.BOOLEAN },
    // **NUEVA CLAVE FORÁNEA PARA ROL**
    rol_id: {
      type: Sequelize.INTEGER,
      allowNull: false, // Es recomendable que todo usuario tenga un rol
      references: {
        model: 'rol', // Nombre de la tabla
        key: 'id'
      }
    },
    es_super_admin: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    google_refresh_token: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    google_connected_email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    tableName: 'usuario',
  });

  Usuario.associate = (models) => {
    const {
      Empresa, Persona, TipoLicencia, NivelPermiso, CriterioCustom, Evaluacion, Proyecto, Rol
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

    /* Usuario.Proyecto = Usuario.hasMany(Proyecto, {
       as: 'Usuario',
       foreignKey: 'usuario_creador',
     });*/

    Usuario.associate = (models) => {
      const {
        Empresa, Persona, TipoLicencia, NivelPermiso, CriterioCustom, Evaluacion, Proyecto
      } = models;

      // ------------------------------------------
      // MODIFICACIÓN CRÍTICA: RELACIÓN N:M con Proyecto
      // ------------------------------------------
      Usuario.Proyectos = Usuario.belongsToMany(Proyecto, {
        as: 'Proyectos',
        through: UsuarioProyecto, // Nombre de la tabla pivote
        foreignKey: 'usuario_id', // Clave foránea en la tabla pivote que apunta a Usuario
        otherKey: 'proyecto_id', // Clave foránea en la tabla pivote que apunta a Proyecto
      });

      // ... (restaurar otras asociaciones existentes)

    };

    Usuario.Rol = Usuario.belongsTo(Rol, {
      as: 'Rol',
      foreignKey: 'rol_id', // Debe coincidir con el campo que agregamos
    });
  };

  return Usuario;
};
