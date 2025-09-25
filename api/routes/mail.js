const express = require('express');
const MailController = require('../controllers/mail');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.post('/mail/send', MailController.enviarMail);

module.exports = router;
