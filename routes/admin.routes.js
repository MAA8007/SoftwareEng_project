// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Delivery = require('../models/delivery.model');
const { adminMiddleware } = require('../middleware/admin.middleware');

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users', 
      error: error.message 
    });
  }
});

// Block/unblock user
router.patch('/users/:id/block', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.isBlocked = isBlocked;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status', 
      error: error.message 
    });
  }
});

// Get all deliveries
router.get('/deliveries', async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('requester', 'fullName email')
      .populate('deliveryPerson', 'fullName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch deliveries', 
      error: error.message 
    });
  }
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequesters = await User.countDocuments({ userType: 'requester' });
    const totalDeliveryPersons = await User.countDocuments({ userType: 'deliveryPerson' });
    
    const totalDeliveries = await Delivery.countDocuments();
    const pendingDeliveries = await Delivery.countDocuments({ status: 'pending' });
    const activeDeliveries = await Delivery.countDocuments({ 
      status: { $in: ['assigned', 'picked_up', 'in_transit'] }
    });
    const completedDeliveries = await Delivery.countDocuments({ status: 'delivered' });
    const canceledDeliveries = await Delivery.countDocuments({ status: 'canceled' });
    
    // Get top delivery persons
    const topDeliveryPersons = await User.find({ userType: 'deliveryPerson' })
      .sort({ totalDeliveriesCompleted: -1, avgRating: -1 })
      .limit(5)
      .select('fullName totalDeliveriesCompleted avgRating');
    
    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          requesters: totalRequesters,
          deliveryPersons: totalDeliveryPersons
        },
        deliveries: {
          total: totalDeliveries,
          pending: pendingDeliveries,
          active: activeDeliveries,
          completed: completedDeliveries,
          canceled: canceledDeliveries
        },
        topDeliveryPersons
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics', 
      error: error.message 
    });
  }
});

module.exports = router;