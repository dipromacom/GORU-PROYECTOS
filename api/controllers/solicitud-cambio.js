const SolicitudCambioUtils = require('../utils/solicitud-cambio-utils');
const { SolicitudCambio } = require('../models/index');
const { decodeToken } = require('../utils/security-utils');
const PermisoProyectoUtils = require('../utils/permiso-proyecto-utils');
const { P } = PermisoProyectoUtils;

const createSolicitud = async (req, res) => {
    try {
        const proyectoId = req.body.proyecto_id;
        if (!proyectoId) {
            return res.status(400).json({ success: false, message: 'proyecto_id es requerido' });
        }
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const ok = await PermisoProyectoUtils.assertMiembroProyecto(res, usuarioId, proyectoId);
        if (!ok) return;

        const data = await SolicitudCambioUtils.createSolicitud(req.body);
        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSolicitudesProyecto = async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, proyectoId, P.CONTROL_CAMBIO_VER);
        if (!ok) return;

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

        const solicitud = await SolicitudCambio.findByPk(id, { attributes: ['id', 'proyecto_id'] });
        if (!solicitud) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const ok = await PermisoProyectoUtils.assertPermisoProyecto(
            res, usuarioId, solicitud.proyecto_id, P.CONTROL_CAMBIO_GEST
        );
        if (!ok) return;

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