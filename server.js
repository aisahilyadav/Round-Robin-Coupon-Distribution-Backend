const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [ 'https://round-robin-coupon-distribution-git-main-sahilsky-ais-projects.vercel.app',
           'https://round-robin-coupon-distribution-nu.vercel.app'],
  credentials: true
}));
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cache-Control', 'no-store'); // Disable caching for preflight responses
  res.sendStatus(200);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const couponRoutes = require('./routes/coupon');
const adminRoutes = require('./routes/admin');
const sessionCheck = require('./middleware/sessionCheck');
const rateLimit = require('./middleware/rateLimit');

// Apply session check middleware globally
app.use(sessionCheck);

// Apply routes
app.use('/api/coupons', rateLimit, couponRoutes);
app.use('/api/admin', adminRoutes);

// Routes will be added here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
