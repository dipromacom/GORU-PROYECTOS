module.exports = (db, Sequelize) => {
    const ScrumEpic = db.define('scrum_epic', {
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
        descripcion: { type: Sequelize.TEXT },
        objetivo_estrategico: { type: Sequelize.TEXT },
        beneficio_esperado: { type: Sequelize.TEXT },
        valor_negocio: { type: Sequelize.STRING(20) },
        prioridad: { type: Sequelize.STRING(20) },
        estado: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'propuesta' },
        responsable_id: { type: Sequelize.INTEGER, allowNull: true },
        fecha_objetivo: { type: Sequelize.DATEONLY, allowNull: true },
        entregable_ref: { type: Sequelize.STRING(255), allowNull: true },
        riesgos_asociados: { type: Sequelize.TEXT },
        created_by: { type: Sequelize.INTEGER, allowNull: true },
        createdAt: { type: Sequelize.DATE, field: 'created_at' },
        updatedAt: { type: Sequelize.DATE, field: 'updated_at' },
    }, {
        freezeTableName: true,
        tableName: 'scrum_epic',
        timestamps: true,
    });

    ScrumEpic.associate = (models) => {
        const { Proyecto, Usuario, ScrumStory } = models;

        ScrumEpic.Proyecto = ScrumEpic.belongsTo(Proyecto, {
            as: 'Proyecto',
            foreignKey: 'proyecto_id',
        });

        ScrumEpic.Responsable = ScrumEpic.belongsTo(Usuario, {
            as: 'Responsable',
            foreignKey: 'responsable_id',
        });

        ScrumEpic.Stories = ScrumEpic.hasMany(ScrumStory, {
            as: 'Stories',
            foreignKey: 'epic_id',
        });
    };

    return ScrumEpic;
};
