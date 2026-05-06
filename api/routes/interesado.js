const express = require('express');
const interesadoController = require('../controllers/interesado');

const router = express.Router();

router.get('/interesados/proyecto/:proyectoId/correo/destinatarios', interesadoController.getDestinatariosCorreoProyecto);
router.post('/interesados/proyecto/:proyectoId/correo', interesadoController.postEnviarCorreoInteresados);
router.post('/interesados', interesadoController.createInteresado);
router.put('/interesados/:id', interesadoController.updateInteresado);
router.delete('/interesados/:id', interesadoController.deleteInteresado);
router.get('/interesados', interesadoController.getAllInteresados);
router.get('/interesados/:id', interesadoController.getInteresadoById);
router.get('/interesado/:id', interesadoController.getInteresadosById);

module.exports = router;