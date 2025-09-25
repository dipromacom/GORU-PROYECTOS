const AnalisisImpactoUtils = require('../utils/analisis-impacto-utils');

// Obtener todos los análisis de impacto
const getAllAnalisisImpacto = async (req, res) => {
    try {
        const items = await AnalisisImpactoUtils.getAllAnalisisImpacto();
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllEvaluacion = async (req, res) => {
    try {
        const items = await AnalisisImpactoUtils.getAllEvaluacion();
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Obtener un análisis de impacto por su ID
const getAnalisisImpactoById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await AnalisisImpactoUtils.getAnalisisImpactoById(id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Análisis de Impacto no existe' });
        }

        return res.status(200).json({ success: true, data: item });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Crear un nuevo análisis de impacto
const createAnalisisImpacto = async (req, res) => {
    const { body } = req;
    try {
        const analisisImpacto = await AnalisisImpactoUtils.createAnalisisImpacto(body);
        return res.status(201).json({ success: true, data: analisisImpacto });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateAnalisisImpacto = async (req, res) => {
    const { id } = req.params; 
    const { body } = req; 
    try {
        const success = await AnalisisImpactoUtils.updateAnalisisImpacto(id, body);

        if (success) {
            return res.status(200).json({ success: true, message: 'El análisis de impacto fue actualizado correctamente.' });
        } else {
            return res.status(404).json({ success: false, message: 'El análisis de impacto no se encontró.' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllAnalisisImpacto,
    getAllEvaluacion,
    getAnalisisImpactoById,
    createAnalisisImpacto,
    updateAnalisisImpacto,
};
