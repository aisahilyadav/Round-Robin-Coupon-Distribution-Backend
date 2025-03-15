const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Coupon = require('../models/Coupon');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all coupons with claim history
router.get('/coupons', auth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new coupon
router.post('/coupons', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = new Coupon({ code });
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update coupon
router.put('/coupons/:id', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { code },
      { new: true }
    );
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle coupon status
router.patch('/coupons/:id/toggle', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get claim history
router.get('/claims', auth, async (req, res) => {
  try {
    const coupons = await Coupon.find({ 'claimedBy.0': { $exists: true } })
      .select('code claimedBy');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 