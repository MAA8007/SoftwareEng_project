// routes/user.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// Update user profile
router.patch('/profile', async (req, res) => {
  try {
    const { fullName, mobileNumber } = req.body;
    
    // Create update object with allowed fields
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    
    // Check if mobile number already exists
    if (mobileNumber) {
      const existingUser = await User.findOne({ 
        mobileNumber, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number already in use'
        });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Toggle delivery person active status
router.patch('/toggle-active', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.userType !== 'deliveryPerson') {
      return res.status(403).json({
        success: false,
        message: 'Only delivery persons can toggle active status'
      });
    }
    
    user.isDeliveryPersonActive = !user.isDeliveryPersonActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `You are now ${user.isDeliveryPersonActive ? 'active' : 'inactive'} as a delivery person`,
      isActive: user.isDeliveryPersonActive
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle active status',
      error: error.message
    });
  }
});

module.exports = router;