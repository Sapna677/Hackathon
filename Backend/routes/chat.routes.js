const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { optionalAuthMiddleware } = require('../middleware/auth.middleware');

router.post('/', optionalAuthMiddleware, chatController.handleChatMessage);

module.exports = router;
