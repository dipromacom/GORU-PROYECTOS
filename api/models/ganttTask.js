module.exports = (db, Sequelize) => {
    const GanttTask = db.define('gantt_task', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false
        },
        project_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Proyecto',
                key: 'id'
            }
        },
        parent_id: {
            type: Sequelize.UUID, // 🔹 Permite agrupar tareas bajo una tarea padre
            allowNull: true
        },
        type: {
            type: Sequelize.STRING(20), // 🔹 'task' | 'group'
            defaultValue: 'task'
        },
        name: {
            type: Sequelize.STRING(200),
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT
        },
        start_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        end_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        duration: {
            type: Sequelize.INTEGER, // 🔹 días entre start_date y end_date
            allowNull: true
        },
        progress: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        dependencies: {
            type: Sequelize.JSONB,
            defaultValue: []
        },
        interesados_id: {
            type: Sequelize.JSONB,
            defaultValue: []
        },
        usuarios_id: {
            type: Sequelize.JSONB,
            defaultValue: []
        },
        horas_estimadas: {
            type: Sequelize.DECIMAL(8, 2),
            allowNull: true
        },
        status: {
            type: Sequelize.STRING(50),
            defaultValue: 'pending'
        },
        is_critical: {
            type: Sequelize.BOOLEAN, // 🔹 ruta crítica
            defaultValue: false
        },
        created_at: {
            type: Sequelize.DATE,
            field: 'created_at'
        },
        updated_at: {
            type: Sequelize.DATE,
            field: 'updated_at'
        }
    }, {
        tableName: 'gantt_task'
    });
    GanttTask.associate = (models) => {
        GanttTask.belongsTo(models.Proyecto, {
            as: 'Proyecto',
            foreignKey: 'project_id'
        });
    };

    return GanttTask;
};
