module.exports = (db, Sequelize) => {
    const MadurezDireccionProyectos = db.define('MadurezDireccionProyectos', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        usuario_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
            references: { model: 'usuario', key: 'id' },
        },
        nombre_contacto: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        empresa: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        celular: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        correo_contacto: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        respuestas: {
            type: Sequelize.JSONB,
            allowNull: false,
        },
        puntajes_dimension: {
            type: Sequelize.JSONB,
            allowNull: false,
        },
        puntaje_total: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        porcentaje_madurez: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
        },
        nivel_madurez: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        nivel_nombre: {
            type: Sequelize.STRING(120),
            allowNull: false,
        },
        interpretacion: {
            type: Sequelize.JSONB,
            allowNull: false,
        },
        createdAt: {
            type: Sequelize.DATE,
            field: 'created_at',
        },
        updatedAt: {
            type: Sequelize.DATE,
            field: 'updated_at',
        },
    }, {
        freezeTableName: true,
        tableName: 'madurez_direccion_proyectos',
        timestamps: true,
    });

    MadurezDireccionProyectos.associate = (models) => {
        MadurezDireccionProyectos.belongsTo(models.Usuario, {
            as: 'Usuario',
            foreignKey: 'usuario_id',
        });
    };

    return MadurezDireccionProyectos;
};
