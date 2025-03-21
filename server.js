const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: 'https://round-robin-coupon-distribution-red.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Explicit OPTIONS handler for preflight requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://round-robin-coupon-distribution-red.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204); // No content
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const couponRoutes = require('./routes/coupon');
const adminRoutes = require('./routes/admin');
const sessionCheck = require('./middleware/sessionCheck');
const rateLimit = require('./middleware/rateLimit');

// Apply session check, skipping OPTIONS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  sessionCheck(req, res, next);
});

// Apply routes
app.use('/api/coupons', rateLimit, couponRoutes);
app.use('/api/admin', adminRoutes);

// Export the app for Vercel
module.exports = app;
