const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

const router = express.Router();

// Initialize Razorpay (for card payments)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST /api/payments/create-order
// @desc    Create payment order for different methods
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    if (!['netbanking', 'qr', 'card'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    let paymentData = {};

    switch (paymentMethod) {
      case 'card':
        // Create Razorpay order for card payments
        const order = await razorpay.orders.create({
          amount: amount * 100, // Convert to paise
          currency,
          receipt: `receipt_${Date.now()}`,
          payment_capture: 1
        });
        
        paymentData = {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID
        };
        break;

      case 'netbanking':
        // Generate mock net banking details
        paymentData = {
          bankOptions: [
            { code: 'SBI', name: 'State Bank of India', logo: '🏦' },
            { code: 'HDFC', name: 'HDFC Bank', logo: '🏛️' },
            { code: 'ICICI', name: 'ICICI Bank', logo: '🏪' },
            { code: 'AXIS', name: 'Axis Bank', logo: '🏢' },
            { code: 'KOTAK', name: 'Kotak Mahindra Bank', logo: '🏬' },
            { code: 'PNB', name: 'Punjab National Bank', logo: '🏦' }
          ],
          transactionId: `NB${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          amount,
          currency
        };
        break;

      case 'qr':
        // Generate mock QR code data
        const qrData = {
          merchantId: 'ETICKET@UPI',
          amount,
          transactionId: `QR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          note: 'E-Ticket Booking Payment'
        };
        
        paymentData = {
          qrString: `upi://pay?pa=${qrData.merchantId}&pn=E-Ticket Portal&am=${amount}&cu=${currency}&tn=${qrData.note}&tr=${qrData.transactionId}`,
          transactionId: qrData.transactionId,
          amount,
          currency,
          merchantId: qrData.merchantId
        };
        break;
    }

    res.json({
      success: true,
      paymentMethod,
      paymentData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment for different methods
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { paymentMethod, paymentData } = req.body;

    let isPaymentValid = false;
    let paymentId = '';

    switch (paymentMethod) {
      case 'card':
        // Verify Razorpay payment
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
        
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(sign.toString())
          .digest('hex');

        if (razorpay_signature === expectedSign) {
          isPaymentValid = true;
          paymentId = razorpay_payment_id;
        }
        break;

      case 'netbanking':
        // Mock net banking verification
        const { bankCode, transactionId, otp } = paymentData;
        
        // Simple mock verification - in real app, integrate with bank APIs
        if (bankCode && transactionId && otp === '123456') {
          isPaymentValid = true;
          paymentId = transactionId;
        }
        break;

      case 'qr':
        // Mock QR payment verification
        const { transactionId: qrTransactionId, upiId } = paymentData;
        
        // Simple mock verification - in real app, verify with UPI gateway
        if (qrTransactionId && upiId) {
          isPaymentValid = true;
          paymentId = qrTransactionId;
        }
        break;
    }

    if (isPaymentValid) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId,
        paymentMethod
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
});

// @route   POST /api/payments/simulate-success
// @desc    Simulate successful payment for testing
// @access  Private
router.post('/simulate-success', protect, async (req, res) => {
  try {
    const { paymentMethod, amount } = req.body;
    
    const mockPaymentId = `${paymentMethod.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      paymentId: mockPaymentId,
      paymentMethod,
      amount,
      status: 'SUCCESS'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment simulation failed',
      error: error.message
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Razorpay webhooks
// @access  Public (but secured with webhook signature)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const payment = req.body.payload.payment.entity;

    switch (event) {
      case 'payment.captured':
        // Update booking status
        await Booking.findOneAndUpdate(
          { paymentId: payment.id },
          { 
            paymentStatus: 'SUCCESS',
            status: 'CONFIRMED'
          }
        );
        break;

      case 'payment.failed':
        // Handle failed payment
        await Booking.findOneAndUpdate(
          { paymentId: payment.id },
          { 
            paymentStatus: 'FAILED',
            status: 'CANCELLED'
          }
        );
        break;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

module.exports = router;