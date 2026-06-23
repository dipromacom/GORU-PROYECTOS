module.exports = (db, Sequelize) => {
    const ScrumDocument = db.define('scrum_document', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        proyecto_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        tipo: { type: Sequelize.STRING(50), allowNull: false },
        titulo: { type: Sequelize.STRING(255), allowNull: false },
        descripcion: { type: Sequelize.TEXT },
        contenido: { type: Sequelize.TEXT },
        sprint_id: { type: Sequelize.INTEGER, allowNull: true },
        epic_id: { type: Sequelize.INTEGER, allowNull: true },
        story_id: { type: Sequelize.INTEGER, allowNull: true },
        relacion_ref: { type: Sequelize.STRING(255) },
        relacion_tipo: { type: Sequelize.STRING(30), allowNull: true },
        solicitud_cambio_id: { type: Sequelize.INTEGER, allowNull: true },
        riesgo_ref: { type: Sequelize.STRING(255), allowNull: true },
        archivos: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        comentarios: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        version: { type: Sequelize.STRING(20), allowNull: false, defaultValue: '1.0' },
        estado: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'borrador' },
        autor_id: { type: Sequelize.INTEGER, allowNull: true },
        historial: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        createdAt: { type: Sequelize.DATE, field: 'created_at' },
        updatedAt: { type: Sequelize.DATE, field: 'updated_at' },
    }, {
        freezeTableName: true,
        tableName: 'scrum_document',
        timestamps: true,
    });

    ScrumDocument.associate = (models) => {
        const {
            Proyecto, ScrumSprint, ScrumEpic, ScrumStory, Usuario, SolicitudCambio,
        } = models;

        ScrumDocument.Proyecto = ScrumDocument.belongsTo(Proyecto, {
            as: 'Proyecto',
            foreignKey: 'proyecto_id',
        });
        ScrumDocument.Sprint = ScrumDocument.belongsTo(ScrumSprint, {
            as: 'Sprint',
            foreignKey: 'sprint_id',
        });
        ScrumDocument.Epic = ScrumDocument.belongsTo(ScrumEpic, {
            as: 'Epic',
            foreignKey: 'epic_id',
        });
        ScrumDocument.Story = ScrumDocument.belongsTo(ScrumStory, {
            as: 'Story',
            foreignKey: 'story_id',
        });
        ScrumDocument.Autor = ScrumDocument.belongsTo(Usuario, {
            as: 'Autor',
            foreignKey: 'autor_id',
        });
        ScrumDocument.SolicitudCambio = ScrumDocument.belongsTo(SolicitudCambio, {
            as: 'SolicitudCambio',
            foreignKey: 'solicitud_cambio_id',
        });
    };

    return ScrumDocument;
};
