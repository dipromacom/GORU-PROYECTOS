module.exports = (db, Sequelize) => {
    const UsuarioProyecto = db.define('UsuarioProyecto', {
        usuario_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            references: { model: 'usuario', key: 'id' }
        },
        proyecto_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            references: { model: 'proyecto', key: 'id' }
        },
        fecha_asignacion: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        // CAMPO CLAVE AÑADIDO
        rol_proyecto_id: {
            type: Sequelize.INTEGER,
            allowNull: true, // Puede ser NULL si aún no se asigna rol
            references: { model: 'rol_proyecto', key: 'id' }
        }
    }, {
        freezeTableName: true,
        tableName: 'usuario_proyecto',
        timestamps: false,
    });

    UsuarioProyecto.associate = (models) => {
        // Relación N:1 con RolProyecto
        UsuarioProyecto.RolProyecto = UsuarioProyecto.belongsTo(models.RolProyecto, {
            as: 'RolProyecto',
            foreignKey: 'rol_proyecto_id',
        });

        // Relación N:1 con Usuario
        UsuarioProyecto.Usuario = UsuarioProyecto.belongsTo(models.Usuario, {
            as: 'Usuario', // ¡Debe coincidir con el alias usado en utils/rol-proyecto-utils.js!
            foreignKey: 'usuario_id',
        });

        // Relación N:1 con Proyecto (Aunque no se use ahora, es buena práctica)
        UsuarioProyecto.Proyecto = UsuarioProyecto.belongsTo(models.Proyecto, {
            as: 'Proyecto', // ¡Debe coincidir con el alias!
            foreignKey: 'proyecto_id',
        });
    };

    return UsuarioProyecto;
};