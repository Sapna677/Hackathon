const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { optionalAuthMiddleware } = require('../middleware/auth.middleware');

router.post('/generate', optionalAuthMiddleware, quizController.createQuiz);
router.post('/submit', optionalAuthMiddleware, quizController.submitQuiz);
router.get('/history', optionalAuthMiddleware, quizController.getQuizHistory);

module.exports = router;
