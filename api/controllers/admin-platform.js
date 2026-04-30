const { Usuario } = require('../models/index');
const UsuarioUtils = require('../utils/usuario-utils');
const EmpresaUtils = require('../utils/empresa-utils');
const { assertSuperAdmin } = require('../utils/super-admin-utils');
const ColabConfigUtils = require('../utils/config-colaboradores-proyecto-utils');

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

const getColaboradoresProyectoConfig = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const data = await ColabConfigUtils.getConfigPlain();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

const putColaboradoresProyectoConfig = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const { max_colaboradores_personal, max_colaboradores_equipo, max_colaboradores_programa } = req.body || {};
        if (
            max_colaboradores_personal === undefined
            || max_colaboradores_equipo === undefined
            || max_colaboradores_programa === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'Debe enviar max_colaboradores_personal, max_colaboradores_equipo y max_colaboradores_programa.',
            });
        }
        const payload = req.userPayload || {};
        const uid = payload.id != null ? parseInt(payload.id, 10) : null;
        const data = await ColabConfigUtils.updateConfig(
            { max_colaboradores_personal, max_colaboradores_equipo, max_colaboradores_programa },
            Number.isFinite(uid) ? uid : null
        );
        return res.status(200).json({ success: true, data });
    } catch (error) {
        const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

module.exports = {
    listUsuarios,
    patchUsuarioTipoLicencia,
    patchUsuarioEmpresa,
    createEmpresa,
    getColaboradoresProyectoConfig,
    putColaboradoresProyectoConfig,
};
