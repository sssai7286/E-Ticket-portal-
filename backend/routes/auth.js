const express = require('express');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

// Simple validation helper
const validateInput = (req, res, next) => {
  const errors = [];
  
  if (req.path === '/register') {
    const { name, email, mobile, password, role } = req.body;
    
    if (!name || name.length < 2 || name.length > 50) {
      errors.push({ field: 'name', message: 'Name must be 2-50 characters' });
    }
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email' });
    }
    
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      errors.push({ field: 'mobile', message: 'Please enter a valid 10-digit mobile number' });
    }
    
    if (!password || password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    if (role && !['user', 'admin', 'theater_admin'].includes(role)) {
      errors.push({ field: 'role', message: 'Role must be user, admin, or theater_admin' });
    }
  }
  
  if (req.path === '/login') {
    const { email, password, role } = req.body;
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email' });
    }
    
    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    if (role && !['user', 'admin', 'theater_admin'].includes(role)) {
      errors.push({ field: 'role', message: 'Role must be user, admin, or theater_admin' });
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