const SolicitudCambioUtils = require('../utils/solicitud-cambio-utils');

const createSolicitud = async (req, res) => {
    try {
        const data = await SolicitudCambioUtils.createSolicitud(req.body);
        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSolicitudesProyecto = async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const data = await SolicitudCambioUtils.getSolicitudesByProyecto(proyectoId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, adminName } = req.body;
        await SolicitudCambioUtils.updateEstadoSolicitud(id, estado, adminName);
        return res.status(200).json({ success: true, message: 'Estado actualizado' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createSolicitud,
    getSolicitudesProyecto,
    changeStatus
};