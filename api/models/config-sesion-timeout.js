/**
 * Modelo Sequelize para la tabla config_sesion_timeout.
 * Tabla singleton (id = 1): un único registro con el timeout de inactividad global.
 */
module.exports = (db, Sequelize) => {
    const ConfigSesionTimeout = db.define(
        'ConfigSesionTimeout',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                defaultValue: 1,
            },
            timeout_minutos: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 30,
                comment: 'Minutos de inactividad antes de cerrar la sesión automáticamente',
            },
            fecha_actualizacion: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            usuario_actualizacion_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
        },
        {
            freezeTableName: true,
            tableName: 'config_sesion_timeout',
            timestamps: false,
        }
    );

    return ConfigSesionTimeout;
};
