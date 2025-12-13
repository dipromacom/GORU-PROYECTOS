module.exports = (db, Sequelize) => {
    const PermisoProyecto = db.define('PermisoProyecto', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: Sequelize.STRING, allowNull: false, unique: true },
        descripcion: { type: Sequelize.TEXT },
        fecha_creacion: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    }, {
        freezeTableName: true,
        tableName: 'permiso_proyecto',
        timestamps: false,
    });

    PermisoProyecto.associate = (models) => {
        // Un PermisoProyecto pertenece a muchos RolesProyecto (N:M)
        PermisoProyecto.RolesProyecto = PermisoProyecto.belongsToMany(models.RolProyecto, {
            as: 'RolesProyecto',
            through: 'rol_proyecto_permiso',
            foreignKey: 'permiso_proyecto_id',
            otherKey: 'rol_proyecto_id',
        });
    };
    return PermisoProyecto;
};