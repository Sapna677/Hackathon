const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const upload = require('../middleware/upload.middleware');
const { optionalAuthMiddleware } = require('../middleware/auth.middleware');

router.post('/upload', optionalAuthMiddleware, upload.single('resumeFile'), resumeController.uploadResume);
router.get('/samples', resumeController.getSampleResumes);
router.get('/history', optionalAuthMiddleware, resumeController.getResumeHistory);

module.exports = router;
