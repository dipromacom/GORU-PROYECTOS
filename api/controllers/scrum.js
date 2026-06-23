const { decodeToken } = require('../utils/security-utils');
const PermisoProyectoUtils = require('../utils/permiso-proyecto-utils');
const ScrumUtils = require('../utils/scrum-utils');

const { P } = PermisoProyectoUtils;

const handleError = (res, e, fallback = 'Error en operación Scrum') => {
    console.error(e);
    const status = e.statusCode || 500;
    return res.status(status).json({
        success: false,
        message: e.message || fallback,
        dorErrors: e.dorErrors || undefined,
    });
};

const withScrumAccess = async (req, res, permiso, handler) => {
    try {
        const { authorization } = req.headers;
        const { id: usuarioId } = decodeToken(authorization);
        const projectId = req.params.id || req.params.proyectoId;

        const ok = await PermisoProyectoUtils.assertPermisoProyecto(res, usuarioId, projectId, permiso);
        if (!ok) return;

        const proyecto = await ScrumUtils.assertProyectoScrumHabilitado(res, projectId);
        if (!proyecto) return;

        await handler({ res, req, usuarioId, projectId, proyecto });
    } catch (e) {
        handleError(res, e);
    }
};

const getScrumOverview = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_VER, async ({ res: r, projectId, proyecto }) => {
        const includeArchived = req.query.archivados === '1' || req.query.archivados === 'true';
        const overview = await ScrumUtils.getScrumOverview(projectId, { includeArchived });
        return r.status(200).json({
            success: true,
            proyecto: { id: proyecto.id, nombre: proyecto.nombre, tipo_proyecto: proyecto.tipo_proyecto },
            ...overview,
        });
    });

const createEpic = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const epic = await ScrumUtils.createEpic(projectId, req.body, usuarioId);
        return r.status(201).json({ success: true, epic });
    });

const updateEpic = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId }) => {
        const epic = await ScrumUtils.updateEpic(req.params.epicId, projectId, req.body);
        return r.status(200).json({ success: true, epic });
    });

const deleteEpic = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId }) => {
        await ScrumUtils.deleteEpic(req.params.epicId, projectId);
        return r.status(200).json({ success: true });
    });

const createStory = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const story = await ScrumUtils.createStory(projectId, req.body, usuarioId);
        return r.status(201).json({ success: true, story });
    });

const updateStory = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const story = await ScrumUtils.updateStory(req.params.storyId, projectId, req.body, usuarioId);
        return r.status(200).json({ success: true, story });
    });

const archiveStory = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        await ScrumUtils.archiveStory(req.params.storyId, projectId, usuarioId);
        return r.status(200).json({ success: true });
    });

const unarchiveStory = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const story = await ScrumUtils.unarchiveStory(req.params.storyId, projectId, usuarioId);
        return r.status(200).json({ success: true, story });
    });

const deleteStory = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId }) => {
        await ScrumUtils.deleteStory(req.params.storyId, projectId);
        return r.status(200).json({ success: true });
    });

const duplicateStory = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const story = await ScrumUtils.duplicateStory(req.params.storyId, projectId, usuarioId);
        return r.status(201).json({ success: true, story });
    });

const reorderStories = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId }) => {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) {
            return r.status(400).json({ success: false, message: 'orderedIds debe ser un array' });
        }
        await ScrumUtils.reorderStories(projectId, orderedIds);
        return r.status(200).json({ success: true });
    });

const recalculatePriorities = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId }) => {
        const result = await ScrumUtils.recalculatePriorities(projectId, req.body.metodo);
        const overview = await ScrumUtils.getScrumOverview(projectId);
        return r.status(200).json({ success: true, ...result, ...overview });
    });

const updateConfig = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId }) => {
        const config = await ScrumUtils.updateConfig(projectId, req.body);
        return r.status(200).json({ success: true, config });
    });

const createSprint = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const sprint = await ScrumUtils.createSprint(projectId, req.body, usuarioId);
        return r.status(201).json({ success: true, sprint });
    });

const updateSprint = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId }) => {
        const sprint = await ScrumUtils.updateSprint(req.params.sprintId, projectId, req.body);
        return r.status(200).json({ success: true, sprint });
    });

const deleteSprint = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId }) => {
        await ScrumUtils.deleteSprint(req.params.sprintId, projectId);
        return r.status(200).json({ success: true });
    });

const getSprintPlanning = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_VER, async ({ res: r, projectId }) => {
        const planning = await ScrumUtils.getSprintPlanning(projectId, req.params.sprintId);
        return r.status(200).json({ success: true, ...planning });
    });

const saveSprintPlanning = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const planning = await ScrumUtils.saveSprintPlanning(
            req.params.sprintId,
            projectId,
            req.body.storyIds,
            usuarioId,
        );
        return r.status(200).json({ success: true, ...planning });
    });

const assignStoryToSprint = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const story = await ScrumUtils.assignStoryToSprint(
            req.params.storyId,
            req.params.sprintId,
            projectId,
            usuarioId,
        );
        return r.status(200).json({ success: true, story });
    });

const removeStoryFromSprint = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        await ScrumUtils.removeStoryFromSprint(
            req.params.storyId,
            req.params.sprintId,
            projectId,
            usuarioId,
        );
        return r.status(200).json({ success: true });
    });

const clearSprintStories = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const planning = await ScrumUtils.clearSprintStories(req.params.sprintId, projectId, usuarioId);
        return r.status(200).json({ success: true, ...planning });
    });

const activateSprint = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const sprint = await ScrumUtils.activateSprint(req.params.sprintId, projectId, usuarioId);
        return r.status(200).json({ success: true, sprint });
    });

const closeSprint = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const sprint = await ScrumUtils.closeSprint(req.params.sprintId, projectId, usuarioId, req.body);
        return r.status(200).json({ success: true, sprint });
    });

const getScrumMetrics = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_VER, async ({ res: r, projectId }) => {
        const metrics = await ScrumUtils.getScrumMetrics(projectId);
        return r.status(200).json({ success: true, metrics });
    });

const listDocuments = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_VER, async ({ res: r, projectId }) => {
        const documents = await ScrumUtils.listDocuments(projectId, req.query);
        return r.status(200).json({ success: true, documents });
    });

const getDocument = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_VER, async ({ res: r, projectId }) => {
        const document = await ScrumUtils.getDocumentById(req.params.docId, projectId);
        return r.status(200).json({ success: true, document });
    });

const createDocument = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const document = await ScrumUtils.createDocument(projectId, req.body, usuarioId);
        const full = await ScrumUtils.getDocumentById(document.id, projectId);
        return r.status(201).json({ success: true, document: full });
    });

const updateDocument = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const document = await ScrumUtils.updateDocument(req.params.docId, projectId, req.body, usuarioId);
        return r.status(200).json({ success: true, document });
    });

const deleteDocument = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId }) => {
        await ScrumUtils.deleteDocument(req.params.docId, projectId);
        return r.status(200).json({ success: true });
    });

const addDocumentAttachment = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const document = await ScrumUtils.addDocumentAttachment(
            req.params.docId,
            projectId,
            req.body,
            usuarioId,
        );
        return r.status(200).json({ success: true, document });
    });

const downloadDocumentAttachment = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_VER, async ({ res: r, projectId }) => {
        const { fileMeta, filePath } = await ScrumUtils.getDocumentAttachmentFile(
            req.params.docId,
            projectId,
            req.params.fileId,
        );
        return r.download(filePath, fileMeta.nombre, (err) => {
            if (err && !r.headersSent) {
                return r.status(404).json({ success: false, message: 'No se pudo descargar el archivo' });
            }
            return undefined;
        });
    });

const removeDocumentAttachment = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId }) => {
        const document = await ScrumUtils.removeDocumentAttachment(
            req.params.docId,
            projectId,
            req.params.fileId,
        );
        return r.status(200).json({ success: true, document });
    });

const addDocumentComment = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const document = await ScrumUtils.addDocumentComment(
            req.params.docId,
            projectId,
            req.body.texto,
            usuarioId,
        );
        return r.status(200).json({ success: true, document });
    });

const deleteDocumentComment = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const document = await ScrumUtils.deleteDocumentComment(
            req.params.docId,
            projectId,
            req.params.commentId,
            usuarioId,
        );
        return r.status(200).json({ success: true, document });
    });

const restoreDocumentVersion = (req, res) =>
    withScrumAccess(req, res, P.SCRUM_GEST, async ({ res: r, projectId, usuarioId }) => {
        const document = await ScrumUtils.restoreDocumentVersion(
            req.params.docId,
            projectId,
            req.body.version,
            usuarioId,
        );
        return r.status(200).json({ success: true, document });
    });

module.exports = {
    getScrumOverview,
    createEpic,
    updateEpic,
    deleteEpic,
    createStory,
    updateStory,
    archiveStory,
    unarchiveStory,
    deleteStory,
    duplicateStory,
    reorderStories,
    recalculatePriorities,
    updateConfig,
    createSprint,
    updateSprint,
    deleteSprint,
    getSprintPlanning,
    saveSprintPlanning,
    assignStoryToSprint,
    removeStoryFromSprint,
    clearSprintStories,
    activateSprint,
    closeSprint,
    getScrumMetrics,
    listDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    addDocumentAttachment,
    downloadDocumentAttachment,
    removeDocumentAttachment,
    addDocumentComment,
    deleteDocumentComment,
    restoreDocumentVersion,
};
