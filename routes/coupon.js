const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// Cooldown period in milliseconds (e.g., 24 hours)
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000;

router.post('/claim', async (req, res) => {
  try {
    const clientIP = req.ip;
    const sessionId = req.cookies.sessionId;

    // Check IP-based claims
    const ipClaim = await Coupon.findOne({
      'claimedBy.ip': clientIP,
      'claimedBy.claimedAt': { $gt: new Date(Date.now() - COOLDOWN_PERIOD) }
    });

    if (ipClaim) {
      const timeLeft = Math.ceil((COOLDOWN_PERIOD - (Date.now() - new Date(ipClaim.claimedBy[ipClaim.claimedBy.length - 1].claimedAt).getTime())) / (1000 * 60 * 60));
      return res.status(429).json({ 
        message: `Please wait ${timeLeft} hours before claiming another coupon from this IP` 
      });
    }

    // Check session-based claims
    const sessionClaim = await Coupon.findOne({
      'claimedBy.sessionId': sessionId,
      'claimedBy.claimedAt': { $gt: new Date(Date.now() - COOLDOWN_PERIOD) }
    });

    if (sessionClaim) {
      return res.status(429).json({ 
        message: 'You have already claimed a coupon from this browser session' 
      });
    }

    // Find next available coupon using round-robin
    const coupon = await Coupon.findOne({ 
      isActive: true,
      $or: [
        { lastClaimed: { $exists: false } },
        { lastClaimed: { $lt: new Date(Date.now() - 1000) } }
      ]
    }).sort({ lastClaimed: 1 });

    if (!coupon) {
      return res.status(404).json({ message: 'No coupons available at the moment. Please try again later.' });
    }

    // Update coupon with claim information
    coupon.claimedBy.push({ ip: clientIP, sessionId, claimedAt: new Date() });
    coupon.lastClaimed = new Date();
    await coupon.save();

    res.json({ 
      code: coupon.code,
      message: 'Coupon claimed successfully! Make sure to save your code.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router; 