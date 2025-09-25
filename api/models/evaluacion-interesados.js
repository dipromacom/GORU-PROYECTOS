module.exports = (db, Sequelize) => {
    const EvaluacionInteresado = db.define('evaluaciones_interesados', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        interesadoId: { type: Sequelize.INTEGER, allowNull: false, field: 'interesado_id' },
        compromiso: {
            type: Sequelize.INTEGER, allowNull: true,
            validate: { min: 1, max: 5 }
        },
        poder: {
            type: Sequelize.INTEGER, allowNull: true,
            validate: { min: 1, max: 5 }
        },
        influencia: { type: Sequelize.INTEGER, allowNull: true,
            validate: { min: 1, max: 5 }
        },
        conocimiento: { type: Sequelize.INTEGER, allowNull: true,
            validate: { min: 1, max: 5 }, field: 'conocimiento'
        },
        interesActitud: { type: Sequelize.INTEGER, allowNull: true,
            validate: { min: -1, max: 1 }, field: 'interes_actitud'
        },
        valoracion: {
            type: Sequelize.INTEGER, allowNull: true,
        },
        accionEstrategica: { type: Sequelize.STRING(255), allowNull: true, field: 'accion_estrategica' },
        responsableEstrategia: { type: Sequelize.STRING(255), allowNull: true, field: 'responsable_estrategia' },
        fechaEvaluacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW, field: 'fecha_evaluacion' }
    },
        {
            freezeTableName: true,
            tableName: 'evaluaciones_interesados'
        });

    // Definición de las asociaciones del modelo
    EvaluacionInteresado.associate = (models) => {
        EvaluacionInteresado.belongsTo(models.Interesado, {
            as: 'Interesado',  // Alias debe ser consistente
            foreignKey: 'interesadoId',
        });
    };

    return EvaluacionInteresado;
};
