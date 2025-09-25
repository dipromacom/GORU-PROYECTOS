
module.exports = (db, Sequelize) => {
    const KanbanTask = db.define('kanban_task',{
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false
        },
        content: {
            type: Sequelize.TEXT,
        },
        index: {
            type: Sequelize.INTEGER,
        },
        priority: {
            type: Sequelize.STRING(100),
        },
        interesadoId: {
            type: Sequelize.INTEGER,
        },
        created_at: {
            type: Sequelize.DATE,
            field: 'created_at' // Maps to the SQL column name
        },
        updated_at: {
            type: Sequelize.DATE,
            field: 'updated_at' // Maps to the SQL column name
        },
        status_id: {
            type: Sequelize.UUID,
            references: {
                model: 'kanban_status', // Name of the referenced model
                key: 'id' // Key in the referenced model
            }
        }
    }, {
        tableName: 'kanban_task', // Specify the table name
    });

    return KanbanTask
}


