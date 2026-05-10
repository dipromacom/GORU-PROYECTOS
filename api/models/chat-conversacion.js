module.exports = (db, Sequelize) => {
    const ChatConversacion = db.define(
        'ChatConversacion',
        {
            id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
            usuario_a_id: { type: Sequelize.INTEGER, allowNull: false },
            usuario_b_id: { type: Sequelize.INTEGER, allowNull: false },
            fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
            ultimo_mensaje_id: { type: Sequelize.BIGINT, allowNull: true },
            ultimo_mensaje_fecha: { type: Sequelize.DATE, allowNull: true },
        },
        {
            freezeTableName: true,
            tableName: 'chat_conversacion',
            timestamps: false,
        }
    );

    ChatConversacion.associate = (models) => {
        const { Usuario, ChatMensaje, ChatLectura } = models;

        ChatConversacion.UsuarioA = ChatConversacion.belongsTo(Usuario, {
            as: 'UsuarioA',
            foreignKey: 'usuario_a_id',
        });

        ChatConversacion.UsuarioB = ChatConversacion.belongsTo(Usuario, {
            as: 'UsuarioB',
            foreignKey: 'usuario_b_id',
        });

        ChatConversacion.Mensajes = ChatConversacion.hasMany(ChatMensaje, {
            as: 'Mensajes',
            foreignKey: 'conversacion_id',
        });

        ChatConversacion.Lecturas = ChatConversacion.hasMany(ChatLectura, {
            as: 'Lecturas',
            foreignKey: 'conversacion_id',
        });
    };

    return ChatConversacion;
};
