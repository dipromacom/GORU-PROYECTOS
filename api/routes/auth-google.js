const express = require('express');
const AuthGoogleController = require('../controllers/auth-google');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.get('/auth/google/connect', AuthGoogleController.connectGoogle);
router.get('/auth/google/callback', AuthGoogleController.googleCallback);
router.get('/auth/google/status', SecurityUtils.validateToken(AuthGoogleController.getGoogleStatus));
router.delete('/auth/google/disconnect', SecurityUtils.validateToken(AuthGoogleController.disconnectGoogle));

module.exports = router;
