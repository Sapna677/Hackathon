const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmap.controller');
const { optionalAuthMiddleware } = require('../middleware/auth.middleware');

router.post('/generate', optionalAuthMiddleware, roadmapController.createRoadmap);
router.post('/toggle-task', optionalAuthMiddleware, roadmapController.toggleTask);
router.get('/latest', optionalAuthMiddleware, roadmapController.getLatestRoadmap);

module.exports = router;
