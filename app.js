// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const dotenv = require('dotenv');
const socketIO = require('./socketio');

// App initialization
dotenv.config();
const app = express();
const httpServer = createServer(app);
// Initialize socketIO before importing routes
const io = socketIO.init(httpServer);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes AFTER initializing socketIO
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const bidRoutes = require('./routes/bid.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');

// Middleware
const { authMiddleware } = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/error.middleware');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/deliveries', authMiddleware, deliveryRoutes);
app.use('/api/bids', authMiddleware, bidRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/reviews', authMiddleware, reviewRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Socket.io for real-time tracking and notifications
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join room for specific delivery
  socket.on('join-delivery-room', (deliveryId) => {
    socket.join(`delivery-${deliveryId}`);
  });
  
  // Update delivery status
  socket.on('update-delivery-status', (data) => {
    io.to(`delivery-${data.deliveryId}`).emit('delivery-status-updated', data);
  });
  
  // New bid notification
  socket.on('new-bid', (data) => {
    io.to(`delivery-${data.deliveryId}`).emit('bid-received', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handler
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { app };