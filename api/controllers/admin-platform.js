const { Usuario } = require('../models/index');
const UsuarioUtils = require('../utils/usuario-utils');
const EmpresaUtils = require('../utils/empresa-utils');
const { assertSuperAdmin } = require('../utils/super-admin-utils');

const toPlainUsuario = (instance) => {
    if (!instance) return null;
    const plain = instance.get ? instance.get({ plain: true }) : instance;
    if (plain && plain.clave !== undefined) delete plain.clave;
    return plain;
};

const listUsuarios = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const { limit, offset, q } = req.query;
        const data = await UsuarioUtils.listUsuariosForAdmin({ limit, offset, q });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const patchUsuarioTipoLicencia = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const { id } = req.params;
        const { tipoLicenciaId } = req.body;
        if (tipoLicenciaId === undefined || tipoLicenciaId === null || tipoLicenciaId === '') {
            return res.status(400).json({ success: false, message: 'tipoLicenciaId es obligatorio.' });
        }
        const uid = parseInt(id, 10);
        const tid = parseInt(tipoLicenciaId, 10);
        if (Number.isNaN(uid) || Number.isNaN(tid)) {
            return res.status(400).json({ success: false, message: 'IDs inválidos.' });
        }
        const updated = await UsuarioUtils.setTipoLicenciaForUsuarioId(uid, tid);
        return res.status(200).json({ success: true, data: toPlainUsuario(updated) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const patchUsuarioEmpresa = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const { id } = req.params;
        const { empresaId } = req.body;
        const uid = parseInt(id, 10);
        if (Number.isNaN(uid)) {
            return res.status(400).json({ success: false, message: 'ID de usuario inválido.' });
        }

        if (empresaId === null || empresaId === '' || empresaId === undefined) {
            const usuario = await Usuario.findByPk(uid);
            if (!usuario) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
            }
            await usuario.update({ empresa: null });
        } else {
            const eid = parseInt(empresaId, 10);
            if (Number.isNaN(eid)) {
                return res.status(400).json({ success: false, message: 'empresaId inválido.' });
            }
            await UsuarioUtils.updateUsuarioEmpresa(uid, eid);
        }

        const updated = await UsuarioUtils.getUsuarioById(uid);
        return res.status(200).json({ success: true, data: toPlainUsuario(updated) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createEmpresa = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const empresa = await EmpresaUtils.createEmpresa(req.body);
        return res.status(201).json({ success: true, data: empresa });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    listUsuarios,
    patchUsuarioTipoLicencia,
    patchUsuarioEmpresa,
    createEmpresa,
};
