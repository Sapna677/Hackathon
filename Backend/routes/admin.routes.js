const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Admin Analytics & Progress Monitoring Routes
router.get('/overview', adminController.getAdminOverview);
router.get('/users', adminController.getAllUsersWithProgress);
router.get('/user/:userId', adminController.getUserDetailedDossier);

module.exports = router;
