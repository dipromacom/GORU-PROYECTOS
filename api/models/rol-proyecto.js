module.exports = (db, Sequelize) => {
    const RolProyecto = db.define('RolProyecto', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: Sequelize.STRING, allowNull: false, unique: true },
        descripcion: { type: Sequelize.TEXT },
        activo: { type: Sequelize.BOOLEAN, defaultValue: true },
        fecha_creacion: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    }, {
        freezeTableName: true,
        tableName: 'rol_proyecto',
        timestamps: false,
    });

    RolProyecto.associate = (models) => {
        // Un RolProyecto tiene muchos PermisosProyecto (N:M)
        RolProyecto.PermisosProyecto = RolProyecto.belongsToMany(models.PermisoProyecto, {
            as: 'PermisosProyecto',
            through: 'rol_proyecto_permiso',
            foreignKey: 'rol_proyecto_id',
            otherKey: 'permiso_proyecto_id',
        });
    };
    return RolProyecto;
};