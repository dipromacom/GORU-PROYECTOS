const express = require('express');
const PersonaController = require('../controllers/persona');

const router = express.Router();

router.get('/persona', PersonaController.getAllPersona);
router.get('/persona/activo', PersonaController.getActivePersona);
router.get('/persona/:id', PersonaController.getPersonaById);
router.post('/persona', PersonaController.createPersona);
router.put('/persona/:id/telefono', PersonaController.addContactoTelefonico);

module.exports = router;
