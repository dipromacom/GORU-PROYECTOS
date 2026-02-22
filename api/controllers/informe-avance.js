const InformeAvanceUtils = require('../utils/informe-avance-utils');

const getAllInformesByProyecto = async (req, res) => {
    try {
        const { proyectoId } = req.params;
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

module.exports = {
    getAllInformesByProyecto,
    getInformeById,
    createInforme,
    updateInforme,
    deleteInforme,
};