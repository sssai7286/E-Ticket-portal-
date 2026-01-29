const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  seats: [{
    row: { type: String, required: true },
    number: { type: Number, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentId: { type: String },
  paymentMethod: {
    type: String,
    enum: ['netbanking', 'qr', 'card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  },
  qrCode: { type: String },
  ticketPdf: { type: String },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  }
}, {
  timestamps: true
});

// Generate booking ID before saving
bookingSchema.pre('save', function() {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
});

// Index for better performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Booking', bookingSchema);