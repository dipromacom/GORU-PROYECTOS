const express = require('express');
const SecurityUtils = require('../utils/security-utils');
const ChatController = require('../controllers/chat');

const router = express.Router();

// Listado de usuarios con los que se puede chatear (mismo empresa o todos si super admin).
router.get('/chat/usuarios', SecurityUtils.validateToken(ChatController.listarUsuariosDisponibles));

// Conversaciones del usuario autenticado (con últimos mensajes y no-leídos).
router.get('/chat/conversaciones', SecurityUtils.validateToken(ChatController.listarConversaciones));

// Abrir o reutilizar conversación con otro usuario.
router.post('/chat/conversaciones', SecurityUtils.validateToken(ChatController.abrirConversacion));

// Mensajes de una conversación. Soporta polling incremental con ?desdeId=
router.get('/chat/conversaciones/:id/mensajes', SecurityUtils.validateToken(ChatController.listarMensajes));

// Enviar nuevo mensaje a una conversación.
router.post('/chat/conversaciones/:id/mensajes', SecurityUtils.validateToken(ChatController.enviarMensaje));

// Marcar como leído hasta cierto id (o el último de la conversación).
router.post('/chat/conversaciones/:id/leido', SecurityUtils.validateToken(ChatController.marcarLeido));

// Conteo barato de no leídos para badge global.
router.get('/chat/no-leidos', SecurityUtils.validateToken(ChatController.noLeidos));

module.exports = router;
