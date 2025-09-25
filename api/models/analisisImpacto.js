module.exports = (db, Sequelize) => {
    const AnalisisImpacto = db.define('AnalisisImpacto', {
        proyecto_id: { type: Sequelize.INTEGER, allowNull: false },
        criterio_id: { type: Sequelize.INTEGER, allowNull: false,
            references: {
                model: 'criterios', // Nombre de la tabla de criterios
                key: 'id',
            },
        },
        weight: { type: Sequelize.DECIMAL(5, 1), allowNull: false },
        rating: {
            type: Sequelize.INTEGER, allowNull: false, validate: {
                min: 0,
                max: 4,
            },
        },
        total: { type: Sequelize.DECIMAL(5, 1) },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    }, {
        freezeTableName: true,
        tableName: 'analisis_impacto',
    });

    AnalisisImpacto.associate = (models) => {
        const { criterioAnalisis, RespuestaAnalisis } = models;

        // Relación con 'Criterio' usando alias 'criterioAnalisis'
        AnalisisImpacto.belongsTo(criterioAnalisis, {
            as: 'criterioAnalisis', // Alias consistente con el de 'criterioAnalisis'
            foreignKey: 'criterio_id',
        });

        AnalisisImpacto.hasMany(RespuestaAnalisis, {
            foreignKey: 'proyecto_id', // Este es el campo que conecta con la tabla de RespuestaAnalisis
            as: 'RespuestaAnalisis',    // Alias para la relación
        });
    };

    return AnalisisImpacto;
};
