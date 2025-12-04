module.exports = (db, Sequelize) => {
    const Rol = db.define('rol', {
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
        tableName: 'rol',
        timestamps: false
    });

    Rol.associate = (models) => {
        // 1. Relación Muchos a Muchos (N:M) con Permiso
        Rol.belongsToMany(models.Permiso, {
            through: 'rol_permiso',
            foreignKey: 'rol_id',
            as: 'permisos'
        });

        // 2. Relación Uno a Muchos (1:N) con Usuario (Un rol tiene muchos usuarios)
        Rol.hasMany(models.Usuario, {
            as: 'Usuarios',
            foreignKey: 'rol_id'
        });
    };

    return Rol;
};