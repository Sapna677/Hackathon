const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { optionalAuthMiddleware } = require('../middleware/auth.middleware');

router.get('/dashboard', optionalAuthMiddleware, progressController.getDashboardProgress);

module.exports = router;
