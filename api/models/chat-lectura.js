module.exports = (db, Sequelize) => {
    const ChatLectura = db.define(
        'ChatLectura',
        {
            conversacion_id: { type: Sequelize.BIGINT, primaryKey: true, allowNull: false },
            usuario_id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false },
            ultimo_mensaje_leido_id: { type: Sequelize.BIGINT, allowNull: false, defaultValue: 0 },
            fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        },
        {
            freezeTableName: true,
            tableName: 'chat_lectura',
            timestamps: false,
        }
    );

    ChatLectura.associate = (models) => {
        const { Usuario, ChatConversacion } = models;

        ChatLectura.Usuario = ChatLectura.belongsTo(Usuario, {
            as: 'Usuario',
            foreignKey: 'usuario_id',
        });

        ChatLectura.Conversacion = ChatLectura.belongsTo(ChatConversacion, {
            as: 'Conversacion',
            foreignKey: 'conversacion_id',
        });
    };

    return ChatLectura;
};
