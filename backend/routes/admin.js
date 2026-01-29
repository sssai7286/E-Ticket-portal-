const express = require('express');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply admin protection to all routes
router.use(protect, adminOnly);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      recentBookings
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Event.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: 'CONFIRMED' }),
      Booking.aggregate([
        { $match: { status: 'CONFIRMED' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.find({ status: 'CONFIRMED' })
        .populate('user', 'name email')
        .populate('event', 'title dateTime')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Monthly revenue chart data
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'CONFIRMED',
          createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue,
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings with filters
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
  try {
    const { status, eventId, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (eventId) query.event = eventId;

    const bookings = await Booking.find(query)
      .populate('user', 'name email mobile')
      .populate('event', 'title dateTime venue')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private/Admin
router.put('/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking status
    booking.status = 'CANCELLED';
    await booking.save();

    // Free up the seats
    const event = await Event.findById(booking.event);
    if (event) {
      booking.seats.forEach(bookedSeat => {
        const seatIndex = event.seats.findIndex(
          s => s.row === bookedSeat.row && s.number === bookedSeat.number
        );
        if (seatIndex !== -1) {
          event.seats[seatIndex].status = 'available';
          event.seats[seatIndex].bookedBy = undefined;
        }
      });
      
      event.availableSeats = event.seats.filter(s => s.status === 'available').length;
      await event.save();
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/events
// @desc    Get all events (including inactive)
// @access  Private/Admin
router.get('/events', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const events = await Event.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments();

    res.json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/events/:id/toggle
// @desc    Toggle event active status
// @access  Private/Admin
router.put('/events/:id/toggle', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.isActive = !event.isActive;
    await event.save();

    res.json({
      success: true,
      message: `Event ${event.isActive ? 'activated' : 'deactivated'} successfully`,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ role: 'user' });

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      users
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