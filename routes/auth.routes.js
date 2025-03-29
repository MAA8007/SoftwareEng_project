// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/auth.middleware');

// Remove the socket.io import and initialization - this route doesn't use it

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, mobileNumber, dateOfBirth, userType } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { mobileNumber }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or mobile number already exists' 
      });
    }
    
    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      mobileNumber,
      dateOfBirth,
      userType: userType || 'requester'
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been blocked. Please contact administration.' 
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    });
  }
});


// ONLY USE IN DEVELOPMENT - DELETE IN PRODUCTION
router.delete('/reset-db', async (req, res) => {
  try {
    // Get all collection names
    const collections = Object.keys(mongoose.connection.collections);
    
    // Drop each collection
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany({});
    }
    
    res.status(200).json({
      success: true,
      message: 'All database collections cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear database',
      error: error.message
    });
  }
});

//curl -X DELETE http://localhost:5001/api/auth/reset-db


// Get current user
router.get('/me', authMiddleware, async (req, res) => {
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
      message: 'Failed to get user data', 
      error: error.message 
    });
  }
});



module.exports = router;











/* # Register a requester
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Requester User",
    "email": "requester@example.com",
    "password": "password123",
    "mobileNumber": "1234567890",
    "dateOfBirth": "1990-01-01",
    "userType": "requester"
  }'
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTgzZGI3YmUyZDZkODUyZDhkYTc2NiIsImVtYWlsIjoicmVxdWVzdGVyQGV4YW1wbGUuY29tIiwidXNlclR5cGUiOiJyZXF1ZXN0ZXIiLCJpYXQiOjE3NDMyNzMzOTksImV4cCI6MTc0MzM1OTc5OX0.4aaIUz0-5s11hlGqx19d1I22wHVoM-QTiTwelr_k-lA

# Register a delivery person
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Delivery Person",
    "email": "delivery@example.com",
    "password": "password123",
    "mobileNumber": "9876543210",
    "dateOfBirth": "1992-05-15",
    "userType": "deliveryPerson"
  }'

# Login as requester (save the token from response)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "requester@example.com",
    "password": "password123"
  }'
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTgzZGI3YmUyZDZkODUyZDhkYTc2NiIsImVtYWlsIjoicmVxdWVzdGVyQGV4YW1wbGUuY29tIiwidXNlclR5cGUiOiJyZXF1ZXN0ZXIiLCJpYXQiOjE3NDMyNzM0NDQsImV4cCI6MTc0MzM1OTg0NH0.9XRRiBWxC5Awh7tYM5yT4IxDNGh72SePWpVhle42BUE

# Login as delivery person (save the token from response)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "delivery@example.com",
    "password": "password123"
  }'
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTgzZGQ4MWYxZGM3Nzc5NjQ1NTRmYiIsImVtYWlsIjoiZGVsaXZlcnlAZXhhbXBsZS5jb20iLCJ1c2VyVHlwZSI6ImRlbGl2ZXJ5UGVyc29uIiwiaWF0IjoxNzQzMjczNDU4LCJleHAiOjE3NDMzNTk4NTh9.qkEbo7LWMcBV3Eqwk6zvZgNJME0tFS63SUZUc06C0FY


# Get current user profile (use requester token)
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer REQUESTER_TOKEN_HERE" */