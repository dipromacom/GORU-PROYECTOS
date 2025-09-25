const express = require('express');
const NivelPermisoController = require('../controllers/nivel-permiso');

const router = express.Router();

router.get('/nivel-permiso', NivelPermisoController.getAllNivelPermiso);
router.get('/nivel-permiso/activo', NivelPermisoController.getActiveNivelPermiso);
router.get('/nivel-permiso/:id', NivelPermisoController.getNivelPermisoById);

module.exports = router;
