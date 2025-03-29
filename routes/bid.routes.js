// routes/bid.routes.js
const express = require('express');
const router = express.Router();
const Bid = require('../models/bid.model');
const Delivery = require('../models/delivery.model');
const Notification = require('../models/notification.model');
const socketIO = require('../socketio');

// Place a bid on a delivery
router.post('/', async (req, res) => {
  try {
    const { deliveryId, amount } = req.body;
    
    // Validate delivery exists and is in pending status
    const delivery = await Delivery.findById(deliveryId);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery request not found'
      });
    }
    
    if (delivery.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot bid on a delivery that is not in pending status'
      });
    }
    
    // Check if user is a delivery person
    if (req.user.userType !== 'deliveryPerson') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only delivery persons can place bids.'
      });
    }
    
    // Check if user already placed a bid
    const existingBid = await Bid.findOne({
      delivery: deliveryId,
      deliveryPerson: req.user.id
    });
    
    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already placed a bid on this delivery'
      });
    }
    
    // Create new bid
    const bid = new Bid({
      delivery: deliveryId,
      deliveryPerson: req.user.id,
      amount
    });
    
    await bid.save();
    
    // Create notification for requester
    const notification = new Notification({
      recipient: delivery.requester,
      sender: req.user.id,
      type: 'new_bid',
      delivery: deliveryId,
      message: `New bid of ₨${amount} received on your delivery request`
    });
    
    await notification.save();
    
    // Emit socket event for real-time notification
    try {
      const io = socketIO.getIO();
      io.to(`delivery-${deliveryId}`).emit('bid-received', {
        deliveryId,
        bidId: bid._id,
        deliveryPersonId: req.user.id,
        amount
      });
    } catch (socketError) {
      console.log('Socket not initialized, skipping real-time notification');
    }
    
    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      bid
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to place bid', 
      error: error.message 
    });
  }
});

// Get all bids for a delivery (for requester)
router.get('/delivery/:deliveryId', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Check if user is the requester or admin
    if (delivery.requester.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the requester can view bids.'
      });
    }
    
    const bids = await Bid.find({ delivery: req.params.deliveryId })
      .populate('deliveryPerson', 'fullName avgRating totalDeliveriesCompleted')
      .sort({ amount: 1 });
    
    res.status(200).json({
      success: true,
      count: bids.length,
      bids
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bids', 
      error: error.message 
    });
  }
});

// Accept a bid
router.patch('/:id/accept', async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }
    
    const delivery = await Delivery.findById(bid.delivery);
    
    // Check if user is the requester
    if (delivery.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the requester can accept bids.'
      });
    }
    
    // Check if delivery is still pending
    if (delivery.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept bid. Delivery is no longer in pending status.'
      });
    }
    
    // Update bid status
    bid.status = 'accepted';
    await bid.save();
    
    // Update delivery with accepted bid info
    delivery.deliveryPerson = bid.deliveryPerson;
    delivery.finalFare = bid.amount;
    delivery.status = 'assigned';
    await delivery.save();
    
    // Reject all other bids
    await Bid.updateMany(
      { 
        delivery: delivery._id, 
        _id: { $ne: bid._id }
      },
      { status: 'rejected' }
    );
    
    // Create notification for delivery person
    const notification = new Notification({
      recipient: bid.deliveryPerson,
      sender: req.user.id,
      type: 'bid_accepted',
      delivery: delivery._id,
      message: `Your bid of ₨${bid.amount} has been accepted for delivery from ${delivery.pickupLocation} to ${delivery.dropoffLocation}`
    });
    
    await notification.save();
    
    // Emit socket event for real-time notification
    try {
      const io = socketIO.getIO();
      io.to(`delivery-${delivery._id}`).emit('bid-accepted', {
        deliveryId: delivery._id,
        bidId: bid._id,
        deliveryPersonId: bid.deliveryPerson
      });
    } catch (socketError) {
      console.log('Socket not initialized, skipping real-time notification');
    }
    
    res.status(200).json({
      success: true,
      message: 'Bid accepted successfully',
      bid,
      delivery
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to accept bid', 
      error: error.message 
    });
  }
});

module.exports = router;