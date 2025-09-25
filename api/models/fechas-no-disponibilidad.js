module.exports = (db, Sequelize) => {
    const NoDisponibilidad = db.define('no_disponibilidad', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        interesadoId: 
        { 
            type: Sequelize.INTEGER, 
            allowNull: false, 
            field: 'interesado_id'
        },
        fechaInicio: { type: Sequelize.DATE, allowNull: false,field: 'fecha_inicio' },
        fechaFin: { type: Sequelize.DATE, allowNull: false,field: 'fecha_fin' },
        motivo: {  type: Sequelize.STRING(255), allowNull: false, field: 'motivo'}
    }, {
        freezeTableName: true, // Evitar que Sequelize modifique el nombre de la tabla
        tableName: 'no_disponibilidad',  // Definir el nombre de la tabla
    });

    NoDisponibilidad.associate = (models) => {
        const { Interesado } = models;

        // Relación inversa con Interesado
        NoDisponibilidad.belongsTo(Interesado, {
            foreignKey: 'interesado_id',  // Este debe coincidir con el campo de la tabla 'no_disponibilidad'
            targetKey: 'id',  // Relacionar con el campo 'id' de la tabla 'interesados'
        });
    };

    return NoDisponibilidad;
};
