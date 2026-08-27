const express = require('express');
const TimesheetController = require('../controllers/timesheet');
const SecurityUtils = require('../utils/security-utils');

const router = express.Router();

router.get('/timesheet/my-sheet', SecurityUtils.validateToken(TimesheetController.getMyTimesheet));
router.post('/timesheet/save', SecurityUtils.validateToken(TimesheetController.saveTimesheet));
router.post('/timesheet/submit', SecurityUtils.validateToken(TimesheetController.submitTimesheet));

module.exports = router;
