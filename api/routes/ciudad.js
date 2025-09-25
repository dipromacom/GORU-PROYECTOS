const express = require('express');
const CiudadController = require('../controllers/ciudad');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.get('/ciudad/pais/:pais', SecurityUtils.validateToken(CiudadController.getCiudadByPais));

module.exports = router;
