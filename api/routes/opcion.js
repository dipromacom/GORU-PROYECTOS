const express = require('express');
const OpcionController = require('../controllers/opcion');

const router = express.Router();

router.get('/opcion/:id', OpcionController.getOpcionById);
module.exports = router;
