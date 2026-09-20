const express = require('express');
const router = express.Router();
const jdController = require('../controllers/jd.controller');
const { optionalAuthMiddleware } = require('../middleware/auth.middleware');

router.get('/roles', jdController.getPredefinedRoles);
router.post('/analyze', optionalAuthMiddleware, jdController.analyzeJobDescription);

module.exports = router;
