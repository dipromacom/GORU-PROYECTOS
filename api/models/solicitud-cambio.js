module.exports = (db, Sequelize) => {
    const SolicitudCambio = db.define('SolicitudCambio', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        proyecto_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'proyecto', key: 'id' }
        },
        usuario_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'usuario', key: 'id' }
        },
        nombre_cambio: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        descripcion_cambio: {
            type: Sequelize.TEXT
        },
        nombre_solicitante: {
            type: Sequelize.TEXT
        },
        fecha_solicitud: {
            type: Sequelize.DATEONLY,
            defaultValue: Sequelize.NOW
        },
        revision_director: {
            type: Sequelize.TEXT
        },
        asignado_a: {
            type: Sequelize.TEXT
        },
        analisis_impacto: {
            type: Sequelize.TEXT
        },
        recomendacion: {
            type: Sequelize.TEXT
        },
        resolucion: {
            type: Sequelize.TEXT
        },
        impacto_proyecto: {
            type: Sequelize.ENUM('Alto', 'Mediano', 'Bajo'),
            allowNull: true
        },
        estado: {
            type: Sequelize.ENUM('Creado', 'En Revisión', 'Aprobado', 'No Aprobado'),
            defaultValue: 'Creado'
        },
        aprobado_por: {
            type: Sequelize.TEXT
        }
    }, {
        freezeTableName: true,
        tableName: 'solicitud_cambio',
        timestamps: true
    });

    SolicitudCambio.associate = (models) => {
        SolicitudCambio.belongsTo(models.Usuario, { as: 'Usuario', foreignKey: 'usuario_id' });
        SolicitudCambio.belongsTo(models.Proyecto, { as: 'Proyecto', foreignKey: 'proyecto_id' });
    };

    return SolicitudCambio;
};