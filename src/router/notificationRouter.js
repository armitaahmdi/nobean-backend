const express = require('express');
const router = express.Router();
const authMiddleware = require('../middelware/authMiddelware');
const isAdmin = require('../middelware/isAdmin');
const NotificationController = require('../controller/notificationController');

// دریافت notifications برای ادمین
router.get('/', authMiddleware, isAdmin, NotificationController.getNotifications);

// mark notification as read
router.post('/:id/read', authMiddleware, isAdmin, NotificationController.markAsRead);

// mark all as read
router.post('/read-all', authMiddleware, isAdmin, NotificationController.markAllAsRead);

module.exports = router;

