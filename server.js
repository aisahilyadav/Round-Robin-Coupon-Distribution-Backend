const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration - place this BEFORE other middleware
app.use(cors({
  origin: 'https://round-robin-coupon-distribution-red.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Remove this app.options handler - it's conflicting with the cors middleware
// app.options('*', (req, res) => { ... });

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
