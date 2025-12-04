module.exports = (db, Sequelize) => {
    const Permiso = db.define('permiso', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        descripcion: {
            type: Sequelize.STRING
        }
    }, {
        freezeTableName: true,
        tableName: 'permiso',
        timestamps: false // Asumiendo que no necesitas timestamps para esta tabla
    });

    Permiso.associate = (models) => {
        // Relación Muchos a Muchos (N:M) con Rol
        Permiso.belongsToMany(models.Rol, {
            through: 'rol_permiso',
            foreignKey: 'permiso_id',
            as: 'roles'
        });
    };

    return Permiso;
};