const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  row: { type: String, required: true },
  number: { type: Number, required: true },
  category: {
    type: String,
    enum: ['Silver', 'Gold', 'Platinum'],
    required: true
  },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'booked', 'locked'],
    default: 'available'
  },
  lockedUntil: { type: Date },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Movie', 'Concert', 'Sports', 'Theater', 'Comedy']
  },
  dateTime: {
    type: Date,
    required: [true, 'Event date and time is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true }
  },
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater'
  },
  screen: {
    type: String,
    required: function() {
      return this.theater != null;
    }
  },
  seats: [seatSchema],
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
eventSchema.index({ category: 1, dateTime: 1 });
eventSchema.index({ 'venue.city': 1 });

module.exports = mongoose.model('Event', eventSchema);