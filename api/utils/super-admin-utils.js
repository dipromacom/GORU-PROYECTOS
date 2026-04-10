const { Usuario } = require('../models/index');

/**
 * Comprueba que el usuario del JWT tenga es_super_admin en BD.
 * @returns {Promise<boolean>}
 */
async function assertSuperAdmin(req, res) {
    const payload = req.userPayload;
    const id = payload && payload.id;
    if (!id) {
        res.status(401).json({ success: false, message: 'No autorizado' });
        return false;
    }
    const u = await Usuario.findByPk(id, { attributes: ['id', 'es_super_admin'] });
    if (!u || !u.es_super_admin) {
        res.status(403).json({ success: false, message: 'No tiene acceso al panel de administración.' });
        return false;
    }
    return true;
}

module.exports = {
    assertSuperAdmin,
};
