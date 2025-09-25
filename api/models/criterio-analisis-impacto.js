module.exports = (db, Sequelize) => {
    const criterioAnalisis = db.define('criterioAnalisis', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        descripcion: { type: Sequelize.TEXT, allowNull: false },
        activo: { type: Sequelize.BOOLEAN, allowNull: false},
    }, {
        freezeTableName: true,
        tableName: 'criterios', // Nombre de la tabla en la base de datos
    });

    criterioAnalisis.associate = (models) => {
        const { AnalisisImpacto } = models;

        // Relación con 'AnalisisImpacto' usando alias 'analisisImpactos'
        criterioAnalisis.hasMany(AnalisisImpacto, {
            as: 'analisisImpactos', // Alias consistente
            foreignKey: 'criterio_id',
        });
    };

    return criterioAnalisis;
};
