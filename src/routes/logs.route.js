const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');

router.get('/', logsController.getNextLogs);

module.exports = router;