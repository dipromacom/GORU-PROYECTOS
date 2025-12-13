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
    };

    return UsuarioProyecto;
};