module.exports = (db, Sequelize) => {
    const ScrumSprint = db.define('scrum_sprint', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        proyecto_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        codigo: { type: Sequelize.STRING(20) },
        nombre: { type: Sequelize.STRING(255), allowNull: false },
        objetivo: { type: Sequelize.TEXT },
        fecha_inicio: { type: Sequelize.DATEONLY, allowNull: true },
        fecha_fin: { type: Sequelize.DATEONLY, allowNull: true },
        capacidad_puntos: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        puntos_comprometidos: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        puntos_completados: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        estado: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'planificado' },
        scrum_master_id: { type: Sequelize.INTEGER, allowNull: true },
        product_owner_id: { type: Sequelize.INTEGER, allowNull: true },
        comentarios_cierre: { type: Sequelize.TEXT },
        riesgos: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        createdAt: { type: Sequelize.DATE, field: 'created_at' },
        updatedAt: { type: Sequelize.DATE, field: 'updated_at' },
    }, {
        freezeTableName: true,
        tableName: 'scrum_sprint',
        timestamps: true,
    });

    ScrumSprint.associate = (models) => {
        const { Proyecto, Usuario, ScrumStory } = models;

        ScrumSprint.Proyecto = ScrumSprint.belongsTo(Proyecto, {
            as: 'Proyecto',
            foreignKey: 'proyecto_id',
        });

        ScrumSprint.ScrumMaster = ScrumSprint.belongsTo(Usuario, {
            as: 'ScrumMaster',
            foreignKey: 'scrum_master_id',
        });

        ScrumSprint.ProductOwner = ScrumSprint.belongsTo(Usuario, {
            as: 'ProductOwner',
            foreignKey: 'product_owner_id',
        });

        ScrumSprint.Stories = ScrumSprint.hasMany(ScrumStory, {
            as: 'Stories',
            foreignKey: 'sprint_id',
        });
    };

    return ScrumSprint;
};
