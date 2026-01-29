const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theater name is required'],
    trim: true,
    maxlength: [100, 'Theater name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  facilities: [{
    type: String,
    enum: ['Parking', 'Food Court', 'AC', 'Wheelchair Access', 'IMAX', '3D', 'Dolby Atmos']
  }],
  screens: [{
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    screenType: {
      type: String,
      enum: ['Regular', 'IMAX', '3D', '4DX'],
      default: 'Regular'
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
theaterSchema.index({ 'address.city': 1 });
theaterSchema.index({ owner: 1 });
theaterSchema.index({ isApproved: 1, isActive: 1 });

module.exports = mongoose.model('Theater', theaterSchema);