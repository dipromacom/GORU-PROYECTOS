module.exports = (db, Sequelize) => {
    const RespuestaAnalisis = db.define('RespuestaAnalisis', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        proyecto_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'proyectos', // Tabla de proyectos
                key: 'id',
            },
        },
        total_calificacion: {
            type: Sequelize.DECIMAL,
            allowNull: false
        },
        link: {
            type: Sequelize.STRING, // URL asociada al resultado
            allowNull: true, // Opcional
        },
        usuario_id: {
            type: Sequelize.INTEGER,
            allowNull: true, // Permanece null 
            references: {
                model: 'usuario',
                key: 'id',
            },
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    }, {
        freezeTableName: true,
        tableName: 'respuesta_analisis',
    });

    RespuestaAnalisis.associate = (models) => {
        const { Proyecto, AnalisisImpacto } = models;

        // Relación con 'Proyecto'
        RespuestaAnalisis.belongsTo(Proyecto, {
            as: 'proyecto',
            foreignKey: 'proyecto_id',
        });

        // Relación con 'AnalisisImpacto'
        RespuestaAnalisis.belongsTo(AnalisisImpacto, {
            foreignKey: 'proyecto_id', // Este es el campo que conecta con la tabla de AnalisisImpacto
            as: 'RespuestaAnalisis',    // Alias para la relación
        });
    };

    return RespuestaAnalisis;
};
