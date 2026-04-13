module.exports = (db, Sequelize) => {
    const InformeAvance = db.define('informe_avance', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        proyecto_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'proyecto',
                key: 'id',
            },
        },
        nombre_persona: { 
            type: Sequelize.STRING,
            allowNull: false,
        },
        fecha_informe: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        conclusiones: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        proximos_pasos: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        recomendaciones_ia: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        plan_sugerido_ia: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        creado_por: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id',
            },
        },
        createdAt: {
            type: Sequelize.DATE,
            field: 'created_at',
        },
        updatedAt: {
            type: Sequelize.DATE,
            field: 'updated_at',
        },
    }, {
        freezeTableName: true,
        tableName: 'informe_avance',
        timestamps: true,
    });

    InformeAvance.associate = (models) => {
        const { Proyecto, Usuario } = models;

        InformeAvance.Proyecto = InformeAvance.belongsTo(Proyecto, {
            as: 'Proyecto',
            foreignKey: 'proyecto_id',
        });

        InformeAvance.Usuario = InformeAvance.belongsTo(Usuario, {
            as: 'CreadoPor',
            foreignKey: 'creado_por',
        });
    };

    return InformeAvance;
};