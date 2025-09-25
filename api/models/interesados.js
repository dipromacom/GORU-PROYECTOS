module.exports = (db, Sequelize) => {
    const Interesado = db.define('interesados', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        proyecto_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'proyecto', // Asegúrate de que el nombre de la tabla en el modelo es correcto
                key: 'id'
            },
            onDelete: 'CASCADE',  // Asegura que si se elimina un proyecto, también se elimina el interesado
            onUpdate: 'CASCADE'
        },
        id_interesado: { type: Sequelize.INTEGER, allowNull: false },
        nombre_interesado: { type: Sequelize.STRING(255), allowNull: false },
        telefono: { type: Sequelize.STRING(15), allowNull: true },
        email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
        otros_datos_contacto: { type: Sequelize.TEXT, allowNull: true },
        codigo: { type: Sequelize.STRING(10), allowNull: false, unique: true },
        rol: { type: Sequelize.STRING(100), allowNull: false },
        cargo: { type: Sequelize.STRING(100), allowNull: false },
        compania_clasificacion: { type: Sequelize.STRING(255), allowNull: true },
        expectativas: { type: Sequelize.TEXT, allowNull: true },
        fecha_creacion: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    }, {
        freezeTableName: true,
        tableName: 'interesados',
        indexes: [
            {
                unique: true,
                fields: ['proyecto_id', 'id_interesado']
            }
        ]
    });

    Interesado.associate = (models) => {
        const { NoDisponibilidad, EvaluacionInteresado, Proyecto } = models;
        Interesado.hasMany(NoDisponibilidad, {
            as: 'NoDisponibilidad',
            foreignKey: 'interesadoId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // Relación uno a muchos con EvaluacionInteresado
        Interesado.hasMany(EvaluacionInteresado, {
            as: 'EvaluacionInteresado',
            foreignKey: 'interesadoId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // Relación uno a muchos con Proyecto (Asegúrate de tener este modelo)
        Interesado.belongsTo(Proyecto, {
            foreignKey: 'proyecto_id',
            targetKey: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return Interesado;
};
