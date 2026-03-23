module.exports = (db, Sequelize) => {
    const Log = db.define('log', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: true, // Permitir NULL si la acción es anónima o previa a la creación del usuario
        },
        action_type: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        resource_type: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        resource_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        details: {
            type: Sequelize.JSONB, // Perfecto para guardar estructuras JSON (old/new values)
            allowNull: true,
        },
        timestamp: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            field: 'timestamp', // Usar el nombre de columna en la DB
        },
    }, {
        // Configuraciones del modelo
        freezeTableName: true, // Evita que Sequelize pluralice el nombre
        tableName: 'logs',
        timestamps: false, // Desactivamos timestamps automáticos si usamos el campo `timestamp` definido
    });

    Log.associate = (models) => {
        const { Usuario } = models;
        // Asociación con el Usuario que realizó la acción
        Log.Usuario = Log.belongsTo(Usuario, {
            as: 'Usuario', // Podrías llamarlo 'Actor' para claridad
            foreignKey: 'user_id',
        });
    };

    return Log;
};