const TimesheetUtils = require('../utils/timesheet-utils');
const path = require('path');
const file = path.basename(__filename);
const logger = require('../logger/logger');

const getMyTimesheet = async (req, res) => {
    try {
        const usuarioId = req.userPayload.id;
        const { desde, hasta } = req.query;

        if (!desde || !hasta) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren los parámetros desde y hasta (YYYY-MM-DD)'
            });
        }

        const data = await TimesheetUtils.getMyTimesheet({
            usuarioId,
            desde,
            hasta
        });

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "getMyTimesheet",
            params: req.query
        });
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const saveTimesheet = async (req, res) => {
    try {
        const usuarioId = req.userPayload.id;
        const { entries } = req.body;

        if (!Array.isArray(entries)) {
            return res.status(400).json({
                success: false,
                message: 'entries debe ser un arreglo'
            });
        }

        const result = await TimesheetUtils.saveTimesheet({
            usuarioId,
            entries
        });

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "saveTimesheet",
            params: req.body
        });
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const submitTimesheet = async (req, res) => {
    try {
        const usuarioId = req.userPayload.id;
        const { desde, hasta, entries } = req.body;

        if (!desde || !hasta) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren desde y hasta'
            });
        }

        const result = await TimesheetUtils.submitTimesheet({
            usuarioId,
            desde,
            hasta,
            entries
        });

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error({
            message: error.message,
            source: file,
            method: "submitTimesheet",
            params: req.body
        });
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getMyTimesheet,
    saveTimesheet,
    submitTimesheet
};
