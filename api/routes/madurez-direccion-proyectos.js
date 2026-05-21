const express = require('express');
const MadurezController = require('../controllers/madurez-direccion-proyectos');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.get(
    '/madurez-direccion-proyectos/usuario/:id',
    SecurityUtils.validateToken(MadurezController.getEstado)
);
router.post(
    '/madurez-direccion-proyectos/usuario/:id',
    SecurityUtils.validateToken(MadurezController.guardar)
);

module.exports = router;
