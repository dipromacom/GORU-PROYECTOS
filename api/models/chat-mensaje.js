module.exports = (db, Sequelize) => {
    const ChatMensaje = db.define(
        'ChatMensaje',
        {
            id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
            conversacion_id: { type: Sequelize.BIGINT, allowNull: false },
            usuario_id: { type: Sequelize.INTEGER, allowNull: false },
            texto: { type: Sequelize.STRING(2000), allowNull: false },
            fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        },
        {
            freezeTableName: true,
            tableName: 'chat_mensaje',
            timestamps: false,
        }
    );

    ChatMensaje.associate = (models) => {
        const { Usuario, ChatConversacion } = models;

        ChatMensaje.Usuario = ChatMensaje.belongsTo(Usuario, {
            as: 'Usuario',
            foreignKey: 'usuario_id',
        });

        ChatMensaje.Conversacion = ChatMensaje.belongsTo(ChatConversacion, {
            as: 'Conversacion',
            foreignKey: 'conversacion_id',
        });
    };

    return ChatMensaje;
};
