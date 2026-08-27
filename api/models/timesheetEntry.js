module.exports = (db, Sequelize) => {
    const TimesheetEntry = db.define('timesheet_entry', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        usuario_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id'
            }
        },
        project_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'proyecto',
                key: 'id'
            }
        },
        task_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'gantt_task',
                key: 'id'
            }
        },
        fecha: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        horas: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0
        },
        estado: {
            type: Sequelize.STRING(20),
            allowNull: false,
            defaultValue: 'borrador' // 'borrador' | 'enviado'
        },
        fecha_envio: {
            type: Sequelize.DATE,
            allowNull: true
        }
    }, {
        tableName: 'timesheet_entry',
        timestamps: true,
        underscored: true
    });

    TimesheetEntry.associate = (models) => {
        TimesheetEntry.belongsTo(models.Usuario, {
            as: 'Usuario',
            foreignKey: 'usuario_id'
        });
        TimesheetEntry.belongsTo(models.Proyecto, {
            as: 'Proyecto',
            foreignKey: 'project_id'
        });
        TimesheetEntry.belongsTo(models.GanttTask, {
            as: 'GanttTask',
            foreignKey: 'task_id'
        });
    };

    return TimesheetEntry;
};
