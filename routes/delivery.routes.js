// routes/delivery.routes.js
const express = require('express');
const router = express.Router();
const Delivery = require('../models/delivery.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const socketIO = require('../socketio');

// Create a new delivery request
router.post('/', async (req, res) => {
  try {
    const { 
      pickupLocation, 
      dropoffLocation, 
      packageDetails, 
      preferredDeliveryTime,
      fareRecommendation
    } = req.body;
    
    const newDelivery = new Delivery({
      requester: req.user.id,
      pickupLocation,
      dropoffLocation,
      packageDetails,
      preferredDeliveryTime,
      fareRecommendation
    });
    
    await newDelivery.save();
    
    // Notify active delivery persons
    const activeDeliveryPersons = await User.find({
      userType: 'deliveryPerson',
      isDeliveryPersonActive: true,
      isBlocked: false
    }).select('_id');
    
    // Create notifications for active delivery persons
    const notifications = activeDeliveryPersons.map(person => ({
      recipient: person._id,
      sender: req.user.id,
      type: 'new_delivery_request',
      delivery: newDelivery._id,
      message: `New delivery request from ${pickupLocation} to ${dropoffLocation}`
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      
      // Emit socket event for real-time notification
      try {
        const io = socketIO.getIO();
        io.emit('new-delivery-request', {
          deliveryId: newDelivery._id,
          requester: req.user.id,
          pickupLocation,
          dropoffLocation
        });
      } catch (socketError) {
        console.log('Socket not initialized, skipping real-time notification');
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Delivery request created successfully',
      delivery: newDelivery
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create delivery request', 
      error: error.message 
    });
  }
});

// Get all active delivery requests (for delivery persons)
router.get('/active', async (req, res) => {
  try {
    // Only delivery persons can see active requests
    if (req.user.userType !== 'deliveryPerson') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only delivery persons can access this resource.'
      });
    }
    
    const activeDeliveries = await Delivery.find({
      status: 'pending',
      preferredDeliveryTime: { $gte: new Date() }
    })
    .populate('requester', 'fullName avgRating')
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: activeDeliveries.length,
      deliveries: activeDeliveries
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch active deliveries', 
      error: error.message 
    });
  }
});

// Get user's delivery requests (for requesters)
router.get('/my-requests', async (req, res) => {
  try {
    const deliveries = await Delivery.find({ requester: req.user.id })
      .populate('deliveryPerson', 'fullName avgRating mobileNumber')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch your delivery requests', 
      error: error.message 
    });
  }
});

// Get assigned deliveries (for delivery persons)
router.get('/my-deliveries', async (req, res) => {
  try {
    if (req.user.userType !== 'deliveryPerson') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only delivery persons can access this resource.'
      });
    }
    
    const deliveries = await Delivery.find({ deliveryPerson: req.user.id })
      .populate('requester', 'fullName avgRating mobileNumber')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch your assigned deliveries', 
      error: error.message 
    });
  }
});

// Get delivery by ID
router.get('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('requester', 'fullName avgRating mobileNumber')
      .populate('deliveryPerson', 'fullName avgRating mobileNumber');
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Check if user is authorized to view this delivery
    if (
      delivery.requester._id.toString() !== req.user.id && 
      (delivery.deliveryPerson ? delivery.deliveryPerson._id.toString() !== req.user.id : true) &&
      req.user.userType !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not associated with this delivery.'
      });
    }
    
    res.status(200).json({
      success: true,
      delivery
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch delivery details', 
      error: error.message 
    });
  }
});

// Update delivery status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['picked_up', 'in_transit', 'delivered', 'canceled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Only the assigned delivery person can update status (except for cancel)
    if (status !== 'canceled' && delivery.deliveryPerson.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the assigned delivery person can update status.'
      });
    }
    
    // Only the requester or admin can cancel
    if (status === 'canceled' && 
        req.user.id !== delivery.requester.toString() && 
        req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the requester or admin can cancel the delivery.'
      });
    }
    
    delivery.status = status;
    
    // If delivery is completed, update delivery person stats
    if (status === 'delivered') {
      await User.findByIdAndUpdate(delivery.deliveryPerson, {
        $inc: { totalDeliveriesCompleted: 1 }
      });
    }
    
    await delivery.save();
    
    // Create notification for requester about status update
    const notification = new Notification({
      recipient: delivery.requester,
      sender: req.user.id,
      type: 'status_update',
      delivery: delivery._id,
      message: `Your delivery status has been updated to: ${status}`
    });
    
    await notification.save();
    
    // Emit socket event for real-time status update
    try {
      const io = socketIO.getIO();
      io.to(`delivery-${delivery._id}`).emit('delivery-status-updated', {
        deliveryId: delivery._id,
        status,
        updatedAt: new Date()
      });
    } catch (socketError) {
      console.log('Socket not initialized, skipping real-time notification');
    }
    
    res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status}`,
      delivery
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update delivery status', 
      error: error.message 
    });
  }
});

module.exports = router;