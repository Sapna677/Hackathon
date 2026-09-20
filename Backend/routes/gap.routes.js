const express = require('express');
const router = express.Router();
const gapController = require('../controllers/gap.controller');
const { optionalAuthMiddleware } = require('../middleware/auth.middleware');

router.post('/analyze', optionalAuthMiddleware, gapController.analyzeGap);
router.get('/latest', optionalAuthMiddleware, gapController.getLatestAnalysis);

module.exports = router;
