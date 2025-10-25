module.exports = (db, Sequelize) => {
    const Whiteboard = db.define('whiteboard', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        project_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'proyecto',
                key: 'id'
            },
            allowNull: false,
            unique: true
        },
        title: {
            type: Sequelize.STRING(100),
            allowNull: true
        },
        content: {
            type: Sequelize.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        createdAt: {
            type: Sequelize.DATE,
            field: 'createdAt'
        },
        updatedAt: {
            type: Sequelize.DATE,
            field: 'updatedAt'
        }
    }, {
        tableName: 'whiteboard'
    });

    return Whiteboard;
};
