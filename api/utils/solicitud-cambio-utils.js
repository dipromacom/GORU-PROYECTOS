const { SolicitudCambio, Proyecto, Usuario } = require('../models');

const getSolicitudesByProyecto = async (proyectoId) => {
    return await SolicitudCambio.findAll({
        where: { proyecto_id: proyectoId },
        //include: [{ model: Usuario, as: 'Usuario', attributes: ['nombre', 'email'] }],
        order: [['createdAt', 'DESC']]
    });
};

const getSolicitudesByUser = async (usuarioId, modo) => {
    return await SolicitudCambio.findAll({
        include: [{
            model: Proyecto,
            as: 'Proyecto',
            where: { modo },
            required: true,
            include: [{
                model: Usuario,
                as: 'Usuarios',
                where: { id: usuarioId },
                required: true,
                through: { attributes: [] }
            }]
        }],
        order: [['createdAt', 'DESC']]
    });
};

const createSolicitud = async (data) => {
    return await SolicitudCambio.create(data);
};

const updateEstadoSolicitud = async (id, estado, adminName) => {
    return await SolicitudCambio.update(
        { estado, aprobado_por: adminName },
        { where: { id } }
    );
};

module.exports = {
    getSolicitudesByProyecto,
    getSolicitudesByUser,
    createSolicitud,
    updateEstadoSolicitud
};