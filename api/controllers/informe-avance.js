const InformeAvanceUtils = require('../utils/informe-avance-utils');
const { decodeToken } = require('../utils/security-utils');
const PermisoProyectoUtils = require('../utils/permiso-proyecto-utils');
const { P } = PermisoProyectoUtils;

const getAllInformesByProyecto = async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, proyectoId, P.INFORMES_VER);
        if (!ok) return;

        const items = await InformeAvanceUtils.getAllInformesByProyecto(proyectoId);
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getInformeById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await InformeAvanceUtils.getInformeById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Informe no encontrado'
            });
        }

        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const proyectoId = item.proyecto_id || (item.Proyecto && item.Proyecto.id);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, proyectoId, P.INFORMES_VER);
        if (!ok) return;

        return res.status(200).json({ success: true, data: item });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createInforme = async (req, res) => {
    try {
        const data = req.body;
        const usuarioId = data.usuarioId || (req.user && req.user.id);

        if (!usuarioId) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no identificado'
            });
        }

        if (!data.proyectoId) {
            return res.status(400).json({ success: false, message: 'proyectoId es requerido' });
        }

        const { authorization } = req.headers;
        const { id: tokenUserId } = decodeToken(authorization);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, tokenUserId, data.proyectoId, P.INFORMES_GEST);
        if (!ok) return;

        const informe = await InformeAvanceUtils.createInforme(data, usuarioId);

        return res.status(201).json({
            success: true,
            data: informe,
            message: 'Informe creado exitosamente'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateInforme = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const existente = await InformeAvanceUtils.getInformeById(id);
        if (!existente) {
            return res.status(404).json({ success: false, message: 'Informe no encontrado' });
        }
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const proyectoId = existente.proyecto_id || (existente.Proyecto && existente.Proyecto.id);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, proyectoId, P.INFORMES_GEST);
        if (!ok) return;

        const informe = await InformeAvanceUtils.updateInforme(id, data);

        return res.status(200).json({
            success: true,
            data: informe,
            message: 'Informe actualizado exitosamente'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteInforme = async (req, res) => {
    try {
        const { id } = req.params;

        const existente = await InformeAvanceUtils.getInformeById(id);
        if (!existente) {
            return res.status(404).json({ success: false, message: 'Informe no encontrado' });
        }
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const proyectoId = existente.proyecto_id || (existente.Proyecto && existente.Proyecto.id);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, proyectoId, P.INFORMES_GEST);
        if (!ok) return;

        await InformeAvanceUtils.deleteInforme(id);

        return res.status(200).json({
            success: true,
            message: 'Informe eliminado exitosamente'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getInformesDashboard = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { modo } = req.query;
        const data = await InformeAvanceUtils.getInformesByUser(usuarioId, modo);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllInformesByProyecto,
    getInformeById,
    createInforme,
    updateInforme,
    deleteInforme,
    getInformesDashboard
};