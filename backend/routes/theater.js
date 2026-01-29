const express = require('express');
const { body, validationResult } = require('express-validator');
const Theater = require('../models/Theater');
const User = require('../models/User');
const Event = require('../models/Event');
const { protect, theaterAdminOnly, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/theater/register
 * @desc    Register a new theater (for theater admins)
 * @access  Private/Theater Admin
 */
router.post(
  '/register',
  protect,
  theaterAdminOnly,
  [
    body('name')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Theater name must be 3-100 characters'),

    body('address.street')
      .trim()
      .notEmpty()
      .withMessage('Street address is required'),

    body('address.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),

    body('address.state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),

    body('address.zipCode')
      .trim()
      .isLength({ min: 5, max: 10 })
      .withMessage('Valid zip code is required'),

    body('contact.phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Please enter a valid 10-digit phone number'),

    body('contact.email')
      .isEmail()
      .withMessage('Please enter a valid email'),

    body('screens')
      .isArray({ min: 1 })
      .withMessage('At least one screen is required'),

    body('screens.*.name')
      .trim()
      .notEmpty()
      .withMessage('Screen name is required'),

    body('screens.*.capacity')
      .isInt({ min: 50, max: 500 })
      .withMessage('Screen capacity must be between 50-500')
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

      // Check if user already has a theater
      const existingTheater = await Theater.findOne({ owner: req.user.id });
      if (existingTheater) {
        return res.status(400).json({
          success: false,
          message: 'You already have a registered theater'
        });
      }

      const theaterData = {
        ...req.body,
        owner: req.user.id
      };

      const theater = await Theater.create(theaterData);

      // Update user's theater reference
      await User.findByIdAndUpdate(req.user.id, { theater: theater._id });

      res.status(201).json({
        success: true,
        message: 'Theater registered successfully. Awaiting admin approval.',
        theater
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
 * @route   GET /api/theater/my-theater
 * @desc    Get theater admin's theater details
 * @access  Private/Theater Admin
 */
router.get('/my-theater', protect, theaterAdminOnly, async (req, res) => {
  try {
    const theater = await Theater.findOne({ owner: req.user.id })
      .populate('owner', 'name email')
      .populate('approvedBy', 'name');

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'No theater found. Please register your theater first.'
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

/**
 * @route   PUT /api/theater/my-theater
 * @desc    Update theater details
 * @access  Private/Theater Admin
 */
router.put('/my-theater', protect, theaterAdminOnly, async (req, res) => {
  try {
    const theater = await Theater.findOne({ owner: req.user.id });

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    // Don't allow updates if theater is not approved
    if (!theater.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update theater details until approved by admin'
      });
    }

    const allowedUpdates = ['description', 'contact', 'facilities', 'screens'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedTheater = await Theater.findByIdAndUpdate(
      theater._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Theater updated successfully',
      theater: updatedTheater
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
 * @route   GET /api/theater/my-events
 * @desc    Get events for theater admin's theater
 * @access  Private/Theater Admin
 */
router.get('/my-events', protect, theaterAdminOnly, async (req, res) => {
  try {
    const theater = await Theater.findOne({ owner: req.user.id });

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    let query = { theater: theater._id };

    if (status) {
      query.isActive = status === 'active';
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name')
      .sort({ dateTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

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

/**
 * @route   POST /api/theater/events
 * @desc    Create new event for theater
 * @access  Private/Theater Admin
 */
router.post(
  '/events',
  protect,
  theaterAdminOnly,
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

    body('screen')
      .trim()
      .notEmpty()
      .withMessage('Screen selection is required')
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

      const theater = await Theater.findOne({ owner: req.user.id });

      if (!theater) {
        return res.status(404).json({
          success: false,
          message: 'Theater not found'
        });
      }

      if (!theater.isApproved) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create events until theater is approved'
        });
      }

      // Verify screen exists in theater
      const screenExists = theater.screens.some(s => s.name === req.body.screen);
      if (!screenExists) {
        return res.status(400).json({
          success: false,
          message: 'Selected screen does not exist in your theater'
        });
      }

      const eventData = {
        ...req.body,
        theater: theater._id,
        venue: {
          name: theater.name,
          address: `${theater.address.street}, ${theater.address.city}`,
          city: theater.address.city
        },
        createdBy: req.user.id
      };

      // Generate seat layout based on screen capacity
      const selectedScreen = theater.screens.find(s => s.name === req.body.screen);
      if (!eventData.seats || eventData.seats.length === 0) {
        eventData.seats = generateSeatLayoutForScreen(selectedScreen.capacity);
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
 * @route   PUT /api/theater/events/:id
 * @desc    Update event for theater
 * @access  Private/Theater Admin
 */
router.put('/events/:id', protect, theaterAdminOnly, async (req, res) => {
  try {
    const theater = await Theater.findOne({ owner: req.user.id });

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    const event = await Event.findOne({ 
      _id: req.params.id, 
      theater: theater._id 
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or not owned by your theater'
      });
    }

    const allowedUpdates = ['title', 'description', 'dateTime', 'image', 'isActive'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
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
 * Generate seat layout based on screen capacity
 */
function generateSeatLayoutForScreen(capacity) {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = Math.ceil(capacity / rows.length);

  let seatCount = 0;
  
  for (let rowIndex = 0; rowIndex < rows.length && seatCount < capacity; rowIndex++) {
    const row = rows[rowIndex];
    const seatsInThisRow = Math.min(seatsPerRow, capacity - seatCount);
    
    for (let seatNum = 1; seatNum <= seatsInThisRow; seatNum++) {
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
      
      seatCount++;
    }
  }

  return seats;
}

module.exports = router;