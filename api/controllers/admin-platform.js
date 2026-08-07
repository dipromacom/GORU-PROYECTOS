const { Usuario } = require('../models/index');
const UsuarioUtils = require('../utils/usuario-utils');
const EmpresaUtils = require('../utils/empresa-utils');
const { assertSuperAdmin } = require('../utils/super-admin-utils');
const ColabConfigUtils = require('../utils/config-colaboradores-proyecto-utils');
const SesionTimeoutUtils = require('../utils/sesion-timeout-utils');

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
        const { nombre } = req.body || {};
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ success: false, message: 'El nombre de la empresa es obligatorio.' });
        }
        const exists = await EmpresaUtils.existsEmpresaNombreCaseInsensitive(nombre);
        if (exists) {
            return res.status(400).json({ success: false, message: 'Ya existe una empresa con ese nombre.' });
        }
        const empresa = await EmpresaUtils.createEmpresa(req.body);
        return res.status(201).json({ success: true, data: empresa });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateEmpresa = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const { id } = req.params;
        const { nombre } = req.body || {};
        const eid = parseInt(id, 10);
        if (Number.isNaN(eid)) {
            return res.status(400).json({ success: false, message: 'ID de empresa inválido.' });
        }

        if (nombre !== undefined) {
            if (!nombre || !nombre.trim()) {
                return res.status(400).json({ success: false, message: 'El nombre de la empresa es obligatorio.' });
            }
            const exists = await EmpresaUtils.existsEmpresaNombreCaseInsensitive(nombre, eid);
            if (exists) {
                return res.status(400).json({ success: false, message: 'Ya existe una empresa con ese nombre.' });
            }
        }

        const updated = await EmpresaUtils.updateEmpresa(eid, req.body || {});
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Empresa no encontrada.' });
        }

        return res.status(200).json({ success: true, data: updated });
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

const getSesionTimeoutConfig = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const data = await SesionTimeoutUtils.getConfigPlain();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

const putSesionTimeoutConfig = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const { timeout_minutos } = req.body || {};
        if (timeout_minutos === undefined || timeout_minutos === null || timeout_minutos === '') {
            return res.status(400).json({
                success: false,
                message: 'Debe enviar timeout_minutos (entero entre 1 y 1440).',
            });
        }
        const payload = req.userPayload || {};
        const uid = payload.id != null ? parseInt(payload.id, 10) : null;
        const data = await SesionTimeoutUtils.updateConfig(
            { timeout_minutos },
            Number.isFinite(uid) ? uid : null
        );
        return res.status(200).json({ success: true, data });
    } catch (error) {
        const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

const deleteUsuario = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const { id } = req.params;
        const uid = parseInt(id, 10);
        if (Number.isNaN(uid)) {
            return res.status(400).json({ success: false, message: 'ID de usuario inválido.' });
        }

        const usuario = await Usuario.findByPk(uid);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        await usuario.update({
            eliminado: true,
            suspendido: true,
            fecha_eliminacion: new Date(),
            fecha_suspension: new Date(),
        });

        return res.status(200).json({ success: true, message: 'Usuario suspendido y marcado como eliminado. Sus datos históricos en proyectos se conservan.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteEmpresa = async (req, res) => {
    try {
        if (!(await assertSuperAdmin(req, res))) return;
        const { id } = req.params;
        const eid = parseInt(id, 10);
        if (Number.isNaN(eid)) {
            return res.status(400).json({ success: false, message: 'ID de empresa inválido.' });
        }

        const result = await EmpresaUtils.deleteEmpresa(eid);
        return res.status(200).json({ success: true, message: result.message, deleted: result.deleted });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    listUsuarios,
    patchUsuarioTipoLicencia,
    patchUsuarioEmpresa,
    deleteUsuario,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    getColaboradoresProyectoConfig,
    putColaboradoresProyectoConfig,
    getSesionTimeoutConfig,
    putSesionTimeoutConfig,
};
