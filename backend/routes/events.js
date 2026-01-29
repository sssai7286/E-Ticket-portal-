const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/events
 * @desc    Get all events with filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      city,
      date,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let query = {
      isActive: true,
      dateTime: { $gte: new Date() }
    };

    if (category) query.category = category;
    if (city) query['venue.city'] = new RegExp(city, 'i');

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.dateTime = { $gte: startDate, $lt: endDate };
    }

    const events = await Event.find(query)
      .select('-seats')
      .sort({ dateTime: 1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .populate('createdBy', 'name');

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
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

/**
 * @route   GET /api/events/:id
 * @desc    Get single event with seat layout
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
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

/**
 * @route   POST /api/events
 * @desc    Create new event (Admin only)
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be 3-100 characters'),

    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be 10-1000 characters'),

    body('category')
      .isIn(['Movie', 'Concert', 'Sports', 'Theater', 'Comedy'])
      .withMessage('Invalid category'),

    body('dateTime')
      .isISO8601()
      .withMessage('Invalid date format'),

    body('venue.name')
      .trim()
      .notEmpty()
      .withMessage('Venue name is required'),

    body('venue.address')
      .trim()
      .notEmpty()
      .withMessage('Venue address is required'),

    body('venue.city')
      .trim()
      .notEmpty()
      .withMessage('Venue city is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const eventData = {
        ...req.body,
        createdBy: req.user.id
      };

      if (!eventData.seats || eventData.seats.length === 0) {
        eventData.seats = generateSeatLayout();
      }

      eventData.totalSeats = eventData.seats.length;
      eventData.availableSeats = eventData.seats.length;

      const event = await Event.create(eventData);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * Generate default seat layout
 */
function generateSeatLayout() {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  rows.forEach((row, rowIndex) => {
    for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
      let category, price;

      if (rowIndex < 2) {
        category = 'Platinum';
        price = 500;
      } else if (rowIndex < 5) {
        category = 'Gold';
        price = 300;
      } else {
        category = 'Silver';
        price = 200;
      }

      seats.push({
        row,
        number: seatNum,
        category,
        price,
        status: 'available'
      });
    }
  });

  return seats;
}

module.exports = router;