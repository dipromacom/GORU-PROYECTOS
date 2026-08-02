const GoogleDriveService = require('../utils/google-drive-service');
const SecurityUtils = require('../utils/security-utils');
const db = require('../models');

const { Usuario } = db;

const getRedirectUri = (req) => {
    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    return `${protocol}://${host}/api/auth/google/callback`;
};

const connectGoogle = async (req, res) => {
    try {
        let token = req.query.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
        if (!token || token === 'undefined' || token === 'null') {
            return res.status(401).send('Token de autenticación requerido');
        }
        if (token.startsWith('Bearer ')) {
            token = token.slice(7);
        }
        const decoded = SecurityUtils.decodeToken(`Bearer ${token}`);
        const state = JSON.stringify({ userId: decoded.id });
        const redirectUri = getRedirectUri(req);
        const authUrl = GoogleDriveService.getAuthUrl(redirectUri, state);
        return res.redirect(authUrl);
    } catch (e) {
        console.error('Error al iniciar OAuth Google:', e);
        return res.status(400).send(`Token inválido o error en solicitud: ${e.message}`);
    }
};

const googleCallback = async (req, res) => {
    try {
        const { code, state, error } = req.query;
        if (error) {
            return res.status(400).send(`Error de autorización en Google: ${error}`);
        }
        if (!code || !state) {
            return res.status(400).send('Parámetros de callback insuficientes');
        }

        const { userId } = JSON.parse(state);
        const redirectUri = getRedirectUri(req);
        const tokens = await GoogleDriveService.getTokensFromCode(code, redirectUri);

        if (!tokens.refresh_token) {
            console.warn('Google no devolvió refresh_token (posible consentimiento previo)');
        }

        let userEmail = null;
        if (tokens.access_token) {
            try {
                userEmail = await GoogleDriveService.getUserEmail(tokens.access_token);
            } catch (e) {
                console.warn('No se pudo obtener el email del usuario:', e.message);
            }
        }

        const user = await Usuario.findByPk(userId);
        if (user) {
            const updateData = {};
            if (tokens.refresh_token) updateData.google_refresh_token = tokens.refresh_token;
            if (userEmail) updateData.google_connected_email = userEmail;
            await user.update(updateData);
        }

        return res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Google Drive Conectado</title></head>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h2>¡Google Drive conectado con éxito!</h2>
                <p>Ya puedes cerrar esta ventana y regresar a Goru.</p>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({ type: 'GOOGLE_DRIVE_CONNECTED' }, '*');
                        setTimeout(function() { window.close(); }, 1500);
                    }
                </script>
            </body>
            </html>
        `);
    } catch (e) {
        console.error('Error en googleCallback:', e);
        return res.status(500).send(`Error al vincular cuenta de Google Drive: ${e.message}`);
    }
};

const getGoogleStatus = async (req, res) => {
    try {
        const userId = req.userPayload.id;
        const user = await Usuario.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        return res.status(200).json({
            success: true,
            connected: Boolean(user.google_refresh_token),
            email: user.google_connected_email || null,
        });
    } catch (e) {
        console.error('Error en getGoogleStatus:', e);
        return res.status(500).json({ success: false, message: 'Error interno' });
    }
};

const disconnectGoogle = async (req, res) => {
    try {
        const userId = req.userPayload.id;
        const user = await Usuario.findByPk(userId);
        if (user) {
            await user.update({
                google_refresh_token: null,
                google_connected_email: null,
            });
        }
        return res.status(200).json({ success: true, message: 'Google Drive desvinculado' });
    } catch (e) {
        console.error('Error en disconnectGoogle:', e);
        return res.status(500).json({ success: false, message: 'Error al desvincular' });
    }
};

module.exports = {
    connectGoogle,
    googleCallback,
    getGoogleStatus,
    disconnectGoogle,
};
