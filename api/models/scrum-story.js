module.exports = (db, Sequelize) => {
    const ScrumStory = db.define('scrum_story', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        proyecto_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        epic_id: { type: Sequelize.INTEGER, allowNull: true },
        sprint_id: { type: Sequelize.INTEGER, allowNull: true },
        codigo: { type: Sequelize.STRING(20) },
        tipo: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'historia' },
        titulo: { type: Sequelize.STRING(255), allowNull: false },
        rol_usuario: { type: Sequelize.STRING(255) },
        necesidad: { type: Sequelize.TEXT },
        beneficio: { type: Sequelize.TEXT },
        descripcion: { type: Sequelize.TEXT },
        criterios_aceptacion: {
            type: Sequelize.JSONB,
            allowNull: false,
            defaultValue: [],
        },
        reglas_negocio: { type: Sequelize.TEXT },
        dependencias: { type: Sequelize.TEXT },
        supuestos: { type: Sequelize.TEXT },
        riesgos_asociados: { type: Sequelize.TEXT },
        riesgo: { type: Sequelize.STRING(20) },
        prioridad: { type: Sequelize.STRING(20) },
        valor_negocio: { type: Sequelize.SMALLINT },
        urgencia: { type: Sequelize.SMALLINT },
        reduccion_riesgo: { type: Sequelize.SMALLINT },
        dependencia_estrategica: { type: Sequelize.SMALLINT },
        impacto_cliente: { type: Sequelize.SMALLINT },
        complejidad: { type: Sequelize.SMALLINT },
        esfuerzo: { type: Sequelize.SMALLINT },
        costo_demora: { type: Sequelize.SMALLINT },
        prioridad_score: { type: Sequelize.DECIMAL(10, 2) },
        moscow: { type: Sequelize.STRING(20) },
        story_points: { type: Sequelize.INTEGER },
        estado: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'idea' },
        kanban_column: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'todo' },
        orden_backlog: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        asignado_a: { type: Sequelize.INTEGER, allowNull: true },
        aprobado_po: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        aprobado_po_por: { type: Sequelize.INTEGER, allowNull: true },
        aprobado_po_at: { type: Sequelize.DATE, allowNull: true },
        dependencias_criticas_abiertas: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        archivado: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        comentarios: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        historial: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        estimacion_historial: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        estimacion_comentario: { type: Sequelize.TEXT },
        estimado_por: { type: Sequelize.INTEGER, allowNull: true },
        estimado_at: { type: Sequelize.DATE, allowNull: true },
        created_by: { type: Sequelize.INTEGER, allowNull: true },
        createdAt: { type: Sequelize.DATE, field: 'created_at' },
        updatedAt: { type: Sequelize.DATE, field: 'updated_at' },
    }, {
        freezeTableName: true,
        tableName: 'scrum_story',
        timestamps: true,
    });

    ScrumStory.associate = (models) => {
        const { Proyecto, Usuario, ScrumEpic, ScrumSprint } = models;

        ScrumStory.Proyecto = ScrumStory.belongsTo(Proyecto, {
            as: 'Proyecto',
            foreignKey: 'proyecto_id',
        });

        ScrumStory.Epic = ScrumStory.belongsTo(ScrumEpic, {
            as: 'Epic',
            foreignKey: 'epic_id',
        });

        ScrumStory.Sprint = ScrumStory.belongsTo(ScrumSprint, {
            as: 'Sprint',
            foreignKey: 'sprint_id',
        });

        ScrumStory.Asignado = ScrumStory.belongsTo(Usuario, {
            as: 'Asignado',
            foreignKey: 'asignado_a',
        });

        ScrumStory.AprobadoPoPor = ScrumStory.belongsTo(Usuario, {
            as: 'AprobadoPoPor',
            foreignKey: 'aprobado_po_por',
        });
    };

    return ScrumStory;
};
