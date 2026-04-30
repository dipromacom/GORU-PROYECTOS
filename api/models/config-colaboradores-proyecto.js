module.exports = (db, Sequelize) => {
    const ConfigColaboradoresProyecto = db.define(
        'ConfigColaboradoresProyecto',
        {
            id: { type: Sequelize.INTEGER, primaryKey: true, defaultValue: 1 },
            max_colaboradores_personal: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 2 },
            max_colaboradores_equipo: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 30 },
            max_colaboradores_programa: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 100 },
            fecha_actualizacion: { type: Sequelize.DATE, allowNull: true },
            usuario_actualizacion_id: { type: Sequelize.INTEGER, allowNull: true },
        },
        {
            freezeTableName: true,
            tableName: 'config_colaboradores_proyecto',
            timestamps: false,
        }
    );

    return ConfigColaboradoresProyecto;
};
