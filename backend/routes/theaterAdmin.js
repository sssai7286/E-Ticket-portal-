const express = require('express');
const Theater = require('../models/Theater');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply admin protection to all routes
router.use(protect, adminOnly);

/**
 * @route   GET /api/theater-admin/pending
 * @desc    Get pending theater registrations
 * @access  Private/Admin
 */
router.get('/pending', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const theaters = await Theater.find({ isApproved: false })
      .populate('owner', 'name email mobile')
      .sort({ registrationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Theater.countDocuments({ isApproved: false });

    res.json({
      success: true,
      count: theaters.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      theaters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/theater-admin/all
 * @desc    Get all theaters
 * @access  Private/Admin
 */
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = {};
    if (status === 'approved') query.isApproved = true;
    if (status === 'pending') query.isApproved = false;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const theaters = await Theater.find(query)
      .populate('owner', 'name email mobile')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Theater.countDocuments(query);

    res.json({
      success: true,
      count: theaters.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      theaters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/theater-admin/:id/approve
 * @desc    Approve theater registration
 * @access  Private/Admin
 */
router.put('/:id/approve', async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    if (theater.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Theater is already approved'
      });
    }

    theater.isApproved = true;
    theater.approvedBy = req.user.id;
    theater.approvedAt = new Date();
    await theater.save();

    res.json({
      success: true,
      message: 'Theater approved successfully',
      theater
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/theater-admin/:id/reject
 * @desc    Reject theater registration
 * @access  Private/Admin
 */
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    if (theater.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an approved theater'
      });
    }

    // Remove theater and update user
    await User.findByIdAndUpdate(theater.owner, { $unset: { theater: 1 } });
    await Theater.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Theater registration rejected and removed',
      reason
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/theater-admin/:id/toggle
 * @desc    Toggle theater active status
 * @access  Private/Admin
 */
router.put('/:id/toggle', async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    theater.isActive = !theater.isActive;
    await theater.save();

    res.json({
      success: true,
      message: `Theater ${theater.isActive ? 'activated' : 'deactivated'} successfully`,
      theater
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/theater-admin/:id
 * @desc    Get theater details
 * @access  Private/Admin
 */
router.get('/:id', async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id)
      .populate('owner', 'name email mobile')
      .populate('approvedBy', 'name');

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    res.json({
      success: true,
      theater
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;