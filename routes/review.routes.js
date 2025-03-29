// routes/review.routes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/review.model');
const Delivery = require('../models/delivery.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// Create a review
router.post('/', async (req, res) => {
  try {
    const { deliveryId, rating, comment } = req.body;
    
    const delivery = await Delivery.findById(deliveryId);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Check if delivery is completed
    if (delivery.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot review a delivery that is not completed'
      });
    }
    
    // Only requester can review delivery person
    if (delivery.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the requester can review the delivery person.'
      });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      delivery: deliveryId,
      reviewer: req.user.id
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this delivery'
      });
    }
    
    // Create review
    const review = new Review({
      delivery: deliveryId,
      reviewer: req.user.id,
      reviewee: delivery.deliveryPerson,
      rating,
      comment
    });
    
    await review.save();
    
    // Update delivery person's average rating
    const deliveryPersonReviews = await Review.find({ reviewee: delivery.deliveryPerson });
    const totalRating = deliveryPersonReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / deliveryPersonReviews.length;
    
    await User.findByIdAndUpdate(
      delivery.deliveryPerson,
      { avgRating: Math.round(avgRating * 10) / 10 } // round to 1 decimal place
    );
    
    // Create notification for delivery person
    const notification = new Notification({
      recipient: delivery.deliveryPerson,
      sender: req.user.id,
      type: 'new_review',
      delivery: deliveryId,
      message: `You received a ${rating}-star review for your delivery`
    });
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit review', 
      error: error.message 
    });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'fullName')
      .populate('delivery', 'pickupLocation dropoffLocation createdAt')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews', 
      error: error.message 
    });
  }
});

module.exports = router;