const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  claimedBy: [{
    ip: String,
    sessionId: String,
    claimedAt: Date
  }],
  lastClaimed: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema); 