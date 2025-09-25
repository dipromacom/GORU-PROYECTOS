module.exports = (db, Sequelize) => {
    const KanbanStatus = db.define('kanban_status',{
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false
        },
        title: {
            type: Sequelize.STRING(250),
        },
        index: {
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
        project_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Proyecto', // Name of the referenced model
                key: 'id' // Key in the referenced model
            }
        }
    },{
        freezeTableName: true,
        tableName: 'kanban_status',    
    });

    KanbanStatus.associate = (models) => {
        const { KanbanTask } = models;

        KanbanStatus.tasks = KanbanStatus.hasMany(
            KanbanTask,{
                as: 'tasks',
                foreignKey: 'status_id'
            }
        )
    }

    return KanbanStatus
}