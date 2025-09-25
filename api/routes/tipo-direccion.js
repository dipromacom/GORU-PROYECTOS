const express = require('express');
const TipoDireccionController = require('../controllers/tipo-direccion');

const router = express.Router();

router.get('/tipo-direccion', TipoDireccionController.getAllTipoDireccion);
router.get('/tipo-direccion/activo', TipoDireccionController.getActiveTipoDireccion);
router.get('/tipo-direccion/:id', TipoDireccionController.getTipoDireccionById);

module.exports = router;
