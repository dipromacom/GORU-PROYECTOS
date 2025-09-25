
const Proyecto = require('./proyecto')
const Interesados = require('./interesados')
module.exports = (db, Sequelize) => {
    const Tarea = db.define('tarea', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        prioridad: {
            type: Sequelize.STRING,
        },
        label: {
            type: Sequelize.STRING,
        },
        done: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        duedate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        closeDate: {
            type: Sequelize.DATE,
        },
        proyecto_id: {
            type: Sequelize.INTEGER,
            references: {
                model: Proyecto,
                key: 'id',
            },
        },
        interesado: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        id_interesado: {
            type: Sequelize.INTEGER,
            references:{
                model: Interesados,
                key: 'id',
            }
        },
    }, {
        freezeTableName: true,
        tableName: 'tarea',
    });

    return Tarea;
}