// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');

// Get user's notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'fullName')
      .populate('delivery', 'pickupLocation dropoffLocation')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications', 
      error: error.message 
    });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This notification does not belong to you.'
      });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read', 
      error: error.message 
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all notifications as read', 
      error: error.message 
    });
  }
});

module.exports = router;