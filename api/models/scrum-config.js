module.exports = (db, Sequelize) => {
    const ScrumConfig = db.define('scrum_config', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        proyecto_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
        },
        metodo_priorizacion: {
            type: Sequelize.STRING(30),
            allowNull: false,
            defaultValue: 'manual',
        },
        createdAt: { type: Sequelize.DATE, field: 'created_at' },
        updatedAt: { type: Sequelize.DATE, field: 'updated_at' },
    }, {
        freezeTableName: true,
        tableName: 'scrum_config',
        timestamps: true,
    });

    ScrumConfig.associate = (models) => {
        ScrumConfig.Proyecto = ScrumConfig.belongsTo(models.Proyecto, {
            as: 'Proyecto',
            foreignKey: 'proyecto_id',
        });
    };

    return ScrumConfig;
};
