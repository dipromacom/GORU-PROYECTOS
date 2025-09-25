const express = require('express');
const MenuController = require('../controllers/menu');

const router = express.Router();

router.get('/menu', MenuController.getAllMenu);
router.get('/menu/activo', MenuController.getActiveMenu);
router.get('/menu/:id', MenuController.getMenuById);

module.exports = router;
