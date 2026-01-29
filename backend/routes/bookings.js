const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings/lock-seats
// @desc    Lock seats temporarily for booking
// @access  Private
router.post('/lock-seats', protect, [
  body('eventId').isMongoId().withMessage('Invalid event ID'),
  body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
  body('seats.*.row').notEmpty().withMessage('Seat row is required'),
  body('seats.*.number').isInt({ min: 1 }).withMessage('Valid seat number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { eventId, seats } = req.body;

    const event = await Event.findById(eventId);
    
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or inactive'
      });
    }

    // Check if event is in the future
    if (event.dateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book seats for past events'
      });
    }

    // Validate and lock seats
    const lockedSeats = [];
    const lockExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    for (const seatRequest of seats) {
      const seatIndex = event.seats.findIndex(
        s => s.row === seatRequest.row && s.number === seatRequest.number
      );

      if (seatIndex === -1) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatRequest.row}${seatRequest.number} not found`
        });
      }

      const seat = event.seats[seatIndex];

      // Check if seat is available or lock has expired
      if (seat.status === 'booked') {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat.row}${seat.number} is already booked`
        });
      }

      if (seat.status === 'locked' && seat.lockedUntil > new Date()) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat.row}${seat.number} is temporarily locked`
        });
      }

      // Lock the seat
      event.seats[seatIndex].status = 'locked';
      event.seats[seatIndex].lockedUntil = lockExpiry;
      event.seats[seatIndex].bookedBy = req.user.id;

      lockedSeats.push({
        row: seat.row,
        number: seat.number,
        category: seat.category,
        price: seat.price
      });
    }

    await event.save();

    res.json({
      success: true,
      message: 'Seats locked successfully',
      lockedSeats,
      lockExpiry,
      totalAmount: lockedSeats.reduce((sum, seat) => sum + seat.price, 0)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/bookings
// @desc    Create booking after payment
// @access  Private
router.post('/', protect, [
  body('eventId').isMongoId().withMessage('Invalid event ID'),
  body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('paymentMethod').optional().isIn(['netbanking', 'qr', 'card']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { eventId, seats, paymentId, paymentMethod = 'card' } = req.body;

    const event = await Event.findById(eventId);
    
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or inactive'
      });
    }

    // Verify seats are locked by this user
    const bookingSeats = [];
    let totalAmount = 0;

    for (const seatRequest of seats) {
      const seatIndex = event.seats.findIndex(
        s => s.row === seatRequest.row && s.number === seatRequest.number
      );

      if (seatIndex === -1) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatRequest.row}${seatRequest.number} not found`
        });
      }

      const seat = event.seats[seatIndex];

      if (seat.status !== 'locked' || !seat.bookedBy.equals(req.user.id)) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat.row}${seat.number} is not locked by you`
        });
      }

      // Mark seat as booked
      event.seats[seatIndex].status = 'booked';
      event.seats[seatIndex].lockedUntil = undefined;

      bookingSeats.push({
        row: seat.row,
        number: seat.number,
        category: seat.category,
        price: seat.price
      });

      totalAmount += seat.price;
    }

    // Update available seats count
    event.availableSeats = event.seats.filter(s => s.status === 'available').length;
    await event.save();

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      seats: bookingSeats,
      totalAmount,
      status: 'CONFIRMED',
      paymentId,
      paymentMethod,
      paymentStatus: 'SUCCESS'
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
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

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('event', 'title dateTime venue category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
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

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('event', 'title dateTime venue category');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
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

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('event');

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

    if (booking.status === 'REFUNDED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already refunded'
      });
    }

    // Check if event is at least 24 hours away
    const eventTime = new Date(booking.event.dateTime);
    const now = new Date();
    const timeDiff = eventTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking less than 24 hours before the event'
      });
    }

    // Update booking status
    booking.status = 'CANCELLED';
    await booking.save();

    // Release seats back to available
    const event = await Event.findById(booking.event._id);
    
    booking.seats.forEach(bookedSeat => {
      const seatIndex = event.seats.findIndex(
        s => s.row === bookedSeat.row && s.number === bookedSeat.number
      );
      
      if (seatIndex !== -1) {
        event.seats[seatIndex].status = 'available';
        event.seats[seatIndex].bookedBy = undefined;
      }
    });

    // Update available seats count
    event.availableSeats = event.seats.filter(s => s.status === 'available').length;
    await event.save();

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

// @route   GET /api/bookings/:id/download
// @desc    Download ticket as PDF
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('event', 'title dateTime venue category')
      .populate('user', 'name email mobile');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot download ticket for cancelled booking'
      });
    }

    // Generate ticket data
    const ticketData = {
      bookingId: booking.bookingId,
      eventTitle: booking.event.title,
      eventDate: booking.event.dateTime,
      venue: booking.event.venue,
      customerName: booking.user.name,
      customerEmail: booking.user.email,
      seats: booking.seats,
      totalAmount: booking.totalAmount,
      bookingDate: booking.createdAt
    };

    // In a real application, you would generate a PDF here
    // For now, we'll return the ticket data as JSON
    res.json({
      success: true,
      message: 'Ticket data retrieved successfully',
      ticket: ticketData
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