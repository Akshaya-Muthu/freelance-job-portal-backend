import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getNotifications, markRead } from '../controllers/notificationController.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for logged-in user
// @access  Private
router.get('/', protect, getNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', protect, markRead);

export default router;
