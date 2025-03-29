// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/payment.model');
const Delivery = require('../models/delivery.model');
const Notification = require('../models/notification.model');
const socketIO = require('../socketio');

// Create payment record (confirm payment received)
router.post('/', async (req, res) => {
  try {
    const { deliveryId, amount } = req.body;
    
    const delivery = await Delivery.findById(deliveryId);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Only the delivery person can confirm payment received
    if (delivery.deliveryPerson.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the delivery person can confirm payment.'
      });
    }
    
    // Check if delivery status is delivered
    if (delivery.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be confirmed for delivered orders.'
      });
    }
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({ delivery: deliveryId });
    
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed for this delivery'
      });
    }
    
    // Create payment record
    const payment = new Payment({
      delivery: deliveryId,
      amount,
      method: 'cash',
      status: 'completed'
    });
    
    await payment.save();
    
    // Create notification for requester
    const notification = new Notification({
      recipient: delivery.requester,
      sender: req.user.id,
      type: 'payment_completed',
      delivery: deliveryId,
      message: `Payment of ₨${amount} confirmed for your delivery`
    });
    
    await notification.save();
    
    // Emit socket event for payment confirmation
    try {
      const io = socketIO.getIO();
      io.to(`delivery-${deliveryId}`).emit('payment-completed', {
        deliveryId,
        amount,
        paymentId: payment._id
      });
    } catch (socketError) {
      console.log('Socket not initialized, skipping real-time notification');
    }
    
    res.status(201).json({
      success: true,
      message: 'Payment confirmed successfully',
      payment
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm payment', 
      error: error.message 
    });
  }
});

// Get payment by delivery ID
router.get('/delivery/:deliveryId', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Only participants or admin can view payment
    if (
      delivery.requester.toString() !== req.user.id && 
      delivery.deliveryPerson.toString() !== req.user.id && 
      req.user.userType !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not associated with this delivery.'
      });
    }
    
    const payment = await Payment.findOne({ delivery: req.params.deliveryId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this delivery'
      });
    }
    
    res.status(200).json({
      success: true,
      payment
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment details', 
      error: error.message 
    });
  }
});

module.exports = router;