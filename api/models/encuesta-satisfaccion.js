module.exports = (db, Sequelize) => {
    const EncuestaSatisfaccion = db.define('EncuestaSatisfaccion', {
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
        nombre: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        // Preguntas de la encuesta (valores 0-5)
        comunicacion: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 5 }
        },
        rapidez_respuesta: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 5 }
        },
        manejo_reuniones: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 5 }
        },
        cumplimiento_plazos: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 5 }
        },
        cumplimiento_alcance: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 5 }
        },
        calidad_entregado: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 5 }
        },
        nivel_capacitaciones: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 5 }
        },
        gestion_documentacion: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 5 }
        },
        experiencia_director: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 5 }
        },
        satisfaccion_general: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: { min: 0, max: 5 }
        },
        // Comentarios individuales por pregunta (opcional)
        comentario_comunicacion: { type: Sequelize.TEXT, allowNull: true },
        comentario_rapidez: { type: Sequelize.TEXT, allowNull: true },
        comentario_reuniones: { type: Sequelize.TEXT, allowNull: true },
        comentario_plazos: { type: Sequelize.TEXT, allowNull: true },
        comentario_alcance: { type: Sequelize.TEXT, allowNull: true },
        comentario_calidad: { type: Sequelize.TEXT, allowNull: true },
        comentario_capacitaciones: { type: Sequelize.TEXT, allowNull: true },
        comentario_documentacion: { type: Sequelize.TEXT, allowNull: true },
        comentario_director: { type: Sequelize.TEXT, allowNull: true },
        comentario_general: { type: Sequelize.TEXT, allowNull: true },
        // Comentarios generales
        comentarios_generales: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        // Control de estado
        completada: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        rechazada: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        fecha_completada: {
            type: Sequelize.DATE,
            allowNull: true
        },
        fecha_rechazo: {
            type: Sequelize.DATE,
            allowNull: true
        },
        tipo_proyecto: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        freezeTableName: true,
        tableName: 'encuesta_satisfaccion',
        timestamps: true,
        // Índice único para evitar duplicados
        /*indexes: [
            {
                unique: true,
                fields: ['proyecto_id', 'usuario_id']
            }
        ]*/
    });

    EncuestaSatisfaccion.associate = (models) => {
        // Relación N:1 con Usuario
        EncuestaSatisfaccion.Usuario = EncuestaSatisfaccion.belongsTo(models.Usuario, {
            as: 'Usuario',
            foreignKey: 'usuario_id',
        });

        // Relación N:1 con Proyecto
        EncuestaSatisfaccion.Proyecto = EncuestaSatisfaccion.belongsTo(models.Proyecto, {
            as: 'Proyecto',
            foreignKey: 'proyecto_id',
        });
    };

    return EncuestaSatisfaccion;
};