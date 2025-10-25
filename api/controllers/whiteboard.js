const WhiteboardUtils = require('../utils/whiteboard-utils');

const getWhiteboard = async (req, res) => {
    const { id: projectId } = req.params;

    try {
        const whiteboard = await WhiteboardUtils.getWhiteboardByProject({ projectId });

        if (!whiteboard) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la pizarra para este proyecto'
            });
        }

        return res.status(200).json({
            success: true,
            whiteboard
        });
    } catch (e) {
        console.error("Error en getWhiteboard:", e);
        return res.status(500).json({ success: false, message: "Error interno al obtener la pizarra" });
    }
};

const setWhiteboard = async (req, res) => {
    const { id: projectId } = req.params;
    const { title, content } = req.body;

    try {
        await WhiteboardUtils.setWhiteboard({ projectId, title, content });
        return res.status(200).json({ success: true });
    } catch (e) {
        console.error("Error en setWhiteboard:", e);
        return res.status(500).json({ success: false, message: "Error interno al guardar la pizarra" });
    }
};

const deleteWhiteboard = async (req, res) => {
    const { id: projectId } = req.params;

    try {
        const deleted = await WhiteboardUtils.deleteWhiteboardByProject({ projectId });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la pizarra para eliminar'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Pizarra eliminada correctamente'
        });
    } catch (e) {
        console.error("Error en deleteWhiteboard:", e);
        return res.status(500).json({ success: false, message: "Error interno al eliminar la pizarra" });
    }
};

module.exports = {
    getWhiteboard,
    setWhiteboard,
    deleteWhiteboard
};
