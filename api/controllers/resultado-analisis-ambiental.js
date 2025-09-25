const resultadosAnalisiUtils = require('../utils/resultado-analisis-utils');

// Obtener todos los análisis de impacto
const getAllResultadosAnalisisImpacto = async (req, res) => {
    try {
        const items = await resultadosAnalisiUtils.getAllResultadoAnalisisImpacto();
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Obtener un análisis de impacto por su ID
const getResultadoAnalisisImpactoById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await resultadosAnalisiUtils.getResultadosAnalisisImpactoById(id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'El resultado de Analisis de Impacto no existe' });
        }

        return res.status(200).json({ success: true, data: item });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Crear un nuevo análisis de impacto
const createResultadoAnalisisImpacto = async (req, res) => {
    const { body } = req;
    try {
        const resultadoAnalisisImpacto = await resultadosAnalisiUtils.createResultadoAnalisisImpacto(body);
        return res.status(201).json({ success: true, data: resultadoAnalisisImpacto });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateResultadoAnalisisImpacto = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const success = await resultadosAnalisiUtils.updateResultadoAnalisisImpacto(id, body);
        if (success) {
            return res.status(200).json({ success: true, message: 'El resultado del análisis de impacto fue actualizado correctamente.' });
        } else {
            return res.status(404).json({ success: false, message: 'El resultado del análisis de impacto no se encontró.' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllResultadosAnalisisImpacto,
    getResultadoAnalisisImpactoById,
    createResultadoAnalisisImpacto,
    updateResultadoAnalisisImpacto,
};
