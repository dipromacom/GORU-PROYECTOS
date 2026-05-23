const path = require('path');
const MadurezUtils = require('../utils/madurez-direccion-proyectos-utils');
const logger = require('../logger/logger');

const file = path.basename(__filename);

const getEstado = async (req, res) => {
    const { id: usuarioId } = req.params;
    try {
        const estado = await MadurezUtils.getEstadoUsuario(usuarioId);
        return res.status(200).json({
            success: true,
            ...estado,
        });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: 'getEstado()',
            params: { usuarioId },
        });
        return res.status(500).json({ success: false, message: 'Error al consultar el assessment' });
    }
};

const guardar = async (req, res) => {
    const { id: usuarioId } = req.params;
    const { body } = req;

    try {
        const {
            nombreContacto,
            empresa,
            celular,
            correoContacto,
            respuestas,
            pdfBase64,
        } = body;

        if (!nombreContacto || !empresa || !celular || !correoContacto) {
            return res.status(400).json({ success: false, message: 'Datos de contacto incompletos' });
        }
        if (!respuestas || !pdfBase64) {
            return res.status(400).json({ success: false, message: 'Respuestas o PDF incompletos' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(correoContacto).trim())) {
            return res.status(400).json({ success: false, message: 'Correo electrónico inválido' });
        }

        await MadurezUtils.guardarResultado(usuarioId, {
            nombreContacto: String(nombreContacto).trim(),
            empresa: String(empresa).trim(),
            celular: String(celular).trim(),
            correoContacto: String(correoContacto).trim(),
            respuestas,
            pdfBase64,
        });

        const estado = await MadurezUtils.getEstadoUsuario(usuarioId);
        const ultimo = estado.resultados.length
            ? estado.resultados[estado.resultados.length - 1]
            : null;

        return res.status(200).json({
            success: true,
            resultado: ultimo,
            ...estado,
        });
    } catch (error) {
        const esDuplicado = error.message.includes('cupo máximo');
        logger.error({
            message: error.message,
            source: file,
            method: 'guardar()',
            params: { usuarioId },
        });
        return res.status(esDuplicado ? 409 : 500).json({
            success: false,
            message: error.message || 'Error al guardar el assessment',
        });
    }
};

const listAllAdmin = async (req, res) => {
    try {
        const { assertSuperAdmin } = require('../utils/super-admin-utils');
        if (!(await assertSuperAdmin(req, res))) return;

        const { fechaDesde, fechaHasta } = req.query;
        if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
            return res.status(400).json({
                success: false,
                message: 'La fecha "Desde" no puede ser posterior a la fecha "Hasta".',
            });
        }

        const lista = await MadurezUtils.listAll({ fechaDesde, fechaHasta });
        return res.status(200).json({ success: true, data: lista });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: 'listAllAdmin()',
        });
        return res.status(500).json({ success: false, message: 'Error al listar assessments' });
    }
};

module.exports = {
    getEstado,
    guardar,
    listAllAdmin,
};
