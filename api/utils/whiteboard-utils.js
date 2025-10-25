const db = require('../db');
const { Whiteboard } = require('../models');
const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

const getWhiteboardByProject = async ({ projectId }) => {
    try {
        return await Whiteboard.findOne({
            where: { project_id: parseInt(projectId) }
        });
    } catch (e) {
        logger.error({
            message: e.message,
            source: file,
            method: "getWhiteboardByProject()",
            params: { projectId }
        });
        throw e;
    }
};

const setWhiteboard = async ({ projectId, title, content }) => {
    const transaction = await db.transaction();
    try {
        const existing = await Whiteboard.findOne({
            where: { project_id: parseInt(projectId) },
            transaction
        });

        if (existing) {
            await existing.update({
                title: title || existing.title,
                content: content || existing.content,
                updatedAt: new Date()
            }, { transaction });
        } else {
            await Whiteboard.create({
                project_id: parseInt(projectId),
                title: title || null,
                content: content || {},
            }, { transaction });
        }

        await transaction.commit();
    } catch (e) {
        await transaction.rollback();
        logger.error({
            message: e.message,
            source: file,
            method: "setWhiteboard()",
            params: { projectId }
        });
        throw e;
    }
};

const deleteWhiteboardByProject = async ({ projectId }) => {
    try {
        const deleted = await Whiteboard.destroy({
            where: { project_id: parseInt(projectId) }
        });
        return deleted > 0;
    } catch (e) {
        logger.error({
            message: e.message,
            source: file,
            method: "deleteWhiteboardByProject()",
            params: { projectId }
        });
        throw e;
    }
};

module.exports = {
    getWhiteboardByProject,
    setWhiteboard,
    deleteWhiteboardByProject
};
