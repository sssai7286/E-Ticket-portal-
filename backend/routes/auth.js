const express = require('express');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

// Enhanced validation helper with better email and phone validation
const validateInput = (req, res, next) => {
  const errors = [];
  
  // Enhanced email validation regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Enhanced phone validation - supports Indian mobile numbers
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers start with 6-9 and have 10 digits
  
  if (req.path === '/register') {
    const { name, email, mobile, password, role } = req.body;
    
    // Name validation
    if (!name || typeof name !== 'string') {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
    } else if (name.trim().length > 50) {
      errors.push({ field: 'name', message: 'Name cannot exceed 50 characters' });
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      errors.push({ field: 'name', message: 'Name can only contain letters and spaces' });
    }
    
    // Enhanced email validation
    if (!email || typeof email !== 'string') {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!emailRegex.test(email.toLowerCase().trim())) {
      errors.push({ field: 'email', message: 'Please enter a valid email address (e.g., user@example.com)' });
    } else if (email.length > 254) {
      errors.push({ field: 'email', message: 'Email address is too long' });
    }
    
    // Enhanced mobile validation
    if (!mobile || typeof mobile !== 'string') {
      errors.push({ field: 'mobile', message: 'Mobile number is required' });
    } else if (!phoneRegex.test(mobile.trim())) {
      errors.push({ field: 'mobile', message: 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)' });
    }
    
    // Password validation
    if (!password || typeof password !== 'string') {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
    } else if (password.length > 128) {
      errors.push({ field: 'password', message: 'Password cannot exceed 128 characters' });
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' });
    }

    // Role validation
    if (role && !['user', 'admin', 'theater_admin'].includes(role)) {
      errors.push({ field: 'role', message: 'Role must be user, admin, or theater_admin' });
    }
  }
  
  if (req.path === '/login') {
    const { email, password, role } = req.body;
    
    // Email validation for login
    if (!email || typeof email !== 'string') {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!emailRegex.test(email.toLowerCase().trim())) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    
    // Password validation for login
    if (!password || typeof password !== 'string') {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
    }

    // Role validation
    if (role && !['user', 'admin', 'theater_admin'].includes(role)) {
      errors.push({ field: 'role', message: 'Invalid role specified' });
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateInput, async (req, res) => {
  try {
    const { name, email, mobile, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { mobile }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or mobile number'
      });
    }

    // Create user with specified role
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role: role // This will be 'user' or 'admin'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `${role === 'admin' ? 'Admin' : 'User'} registered successfully`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
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

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateInput, async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user role matches requested role
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Invalid credentials for ${role} login`
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
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

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        createdAt: user.createdAt
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

module.exports = router;