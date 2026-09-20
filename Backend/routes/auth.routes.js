const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/demo-login', authController.demoLogin);
router.post('/admin-login', authController.adminLogin);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
