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
                model: 'Proyecto', // Name of the referenced model
                key: 'id' // Key in the referenced model
            }
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
        progress: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        dependencies: {
            type: Sequelize.JSONB, // array con IDs de otras actividades
            defaultValue: []
        },
        interesados_id: {
            type: Sequelize.JSONB, // array con IDs de interesados
            defaultValue: []
        },
        status: {
            type: Sequelize.STRING(50), // pending, in_progress, done
            defaultValue: 'pending'
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

    return GanttTask;
};