/* eslint-disable consistent-return */
const path = require('path');
const ChatUtils = require('../utils/chat-utils');
const logger = require('../logger/logger');

const file = path.basename(__filename);

const _getAuthId = (req) => {
    const payload = req.userPayload || {};
    return payload.id;
};

const _resolveUsuarioAuth = async (req, res) => {
    const id = _getAuthId(req);
    if (!id) {
        res.status(401).json({ success: false, message: 'No autorizado' });
        return null;
    }
    const usuario = await ChatUtils.getUsuarioAuth(id);
    if (!usuario) {
        res.status(401).json({ success: false, message: 'Usuario no válido' });
        return null;
    }
    return usuario;
};

// GET /chat/usuarios?q=...
const listarUsuariosDisponibles = async (req, res) => {
    try {
        const auth = await _resolveUsuarioAuth(req, res);
        if (!auth) return;

        const data = await ChatUtils.listarUsuariosDisponibles(auth, req.query.q);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        logger.error({ message: error.message, source: file, method: 'listarUsuariosDisponibles()' });
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /chat/conversaciones
const listarConversaciones = async (req, res) => {
    try {
        const auth = await _resolveUsuarioAuth(req, res);
        if (!auth) return;

        const data = await ChatUtils.listarConversacionesDelUsuario(auth.id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        logger.error({ message: error.message, source: file, method: 'listarConversaciones()' });
        return res.status(500).json({ success: false, message: error.message });
    }
};

// POST /chat/conversaciones { otroUsuarioId }
const abrirConversacion = async (req, res) => {
    try {
        const auth = await _resolveUsuarioAuth(req, res);
        if (!auth) return;

        const otroUsuarioId = parseInt(req.body && req.body.otroUsuarioId, 10);
        if (!otroUsuarioId || Number.isNaN(otroUsuarioId)) {
            return res.status(400).json({ success: false, message: 'otroUsuarioId es obligatorio.' });
        }

        const ok = await ChatUtils.puedeChatearCon(auth, otroUsuarioId);
        if (!ok) {
            return res.status(403).json({ success: false, message: 'No tiene permiso para chatear con este usuario.' });
        }

        const conv = await ChatUtils.obtenerOCrearConversacion(auth.id, otroUsuarioId);
        return res.status(200).json({
            success: true,
            data: { conversacion_id: Number(conv.id), otro_usuario_id: otroUsuarioId },
        });
    } catch (error) {
        logger.error({ message: error.message, source: file, method: 'abrirConversacion()' });
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /chat/conversaciones/:id/mensajes?desdeId=&antesId=&limite=
const listarMensajes = async (req, res) => {
    try {
        const auth = await _resolveUsuarioAuth(req, res);
        if (!auth) return;

        const conversacionId = parseInt(req.params.id, 10);
        if (!conversacionId || Number.isNaN(conversacionId)) {
            return res.status(400).json({ success: false, message: 'ID de conversación inválido.' });
        }

        const conv = await ChatUtils.cargarConversacion(conversacionId);
        if (!conv) {
            return res.status(404).json({ success: false, message: 'Conversación no encontrada.' });
        }
        if (!ChatUtils.esParticipante(conv, auth.id) && !auth.es_super_admin) {
            return res.status(403).json({ success: false, message: 'No participa en esta conversación.' });
        }

        const { desdeId, antesId, limite } = req.query;
        const data = await ChatUtils.obtenerMensajes(conversacionId, { desdeId, antesId, limite });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        logger.error({ message: error.message, source: file, method: 'listarMensajes()' });
        return res.status(500).json({ success: false, message: error.message });
    }
};

// POST /chat/conversaciones/:id/mensajes { texto }
const enviarMensaje = async (req, res) => {
    try {
        const auth = await _resolveUsuarioAuth(req, res);
        if (!auth) return;

        const conversacionId = parseInt(req.params.id, 10);
        if (!conversacionId || Number.isNaN(conversacionId)) {
            return res.status(400).json({ success: false, message: 'ID de conversación inválido.' });
        }

        const conv = await ChatUtils.cargarConversacion(conversacionId);
        if (!conv) {
            return res.status(404).json({ success: false, message: 'Conversación no encontrada.' });
        }
        if (!ChatUtils.esParticipante(conv, auth.id)) {
            return res.status(403).json({ success: false, message: 'No participa en esta conversación.' });
        }

        const texto = req.body && req.body.texto;
        const data = await ChatUtils.crearMensaje({
            conversacionId,
            usuarioId: auth.id,
            texto,
        });

        return res.status(201).json({ success: true, data });
    } catch (error) {
        const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
        if (status >= 500) {
            logger.error({ message: error.message, source: file, method: 'enviarMensaje()' });
        }
        return res.status(status).json({ success: false, message: error.message });
    }
};

// POST /chat/conversaciones/:id/leido { hastaId? }
const marcarLeido = async (req, res) => {
    try {
        const auth = await _resolveUsuarioAuth(req, res);
        if (!auth) return;

        const conversacionId = parseInt(req.params.id, 10);
        if (!conversacionId || Number.isNaN(conversacionId)) {
            return res.status(400).json({ success: false, message: 'ID de conversación inválido.' });
        }

        const conv = await ChatUtils.cargarConversacion(conversacionId);
        if (!conv) {
            return res.status(404).json({ success: false, message: 'Conversación no encontrada.' });
        }
        if (!ChatUtils.esParticipante(conv, auth.id)) {
            return res.status(403).json({ success: false, message: 'No participa en esta conversación.' });
        }

        const data = await ChatUtils.marcarLeidoHasta({
            conversacionId,
            usuarioId: auth.id,
            hastaId: req.body && req.body.hastaId,
        });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        logger.error({ message: error.message, source: file, method: 'marcarLeido()' });
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /chat/no-leidos
const noLeidos = async (req, res) => {
    try {
        const auth = await _resolveUsuarioAuth(req, res);
        if (!auth) return;

        const data = await ChatUtils.contarNoLeidosGlobales(auth.id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        logger.error({ message: error.message, source: file, method: 'noLeidos()' });
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    listarUsuariosDisponibles,
    listarConversaciones,
    abrirConversacion,
    listarMensajes,
    enviarMensaje,
    marcarLeido,
    noLeidos,
};
