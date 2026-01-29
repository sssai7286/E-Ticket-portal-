import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import { ArrowLeft, Clock, MapPin, Calendar, Users, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const fetchEvent = async (eventId) => {
  const response = await axios.get(`/api/events/${eventId}`);
  return response.data.event;
};

const lockSeats = async ({ eventId, seats }) => {
  const response = await axios.post('/api/bookings/lock-seats', { eventId, seats });
  return response.data;
};

const createBooking = async ({ eventId, seats, paymentId, paymentMethod }) => {
  const response = await axios.post('/api/bookings', { eventId, seats, paymentId, paymentMethod });
  return response.data;
};

export default function Booking() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [lockExpiry, setLockExpiry] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [step, setStep] = useState('select'); // 'select', 'locked', 'payment', 'confirmed'
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: event, isLoading, error } = useQuery(
    ['event', eventId],
    () => fetchEvent(eventId),
    { enabled: !!eventId }
  );

  const lockSeatsMutation = useMutation(lockSeats, {
    onSuccess: (data) => {
      setLockedSeats(data.lockedSeats);
      setLockExpiry(new Date(data.lockExpiry));
      setStep('locked');
      toast.success('Seats locked successfully! Complete payment within 15 minutes.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to lock seats');
    }
  });

  const createBookingMutation = useMutation(createBooking, {
    onSuccess: (data) => {
      setStep('confirmed');
      toast.success('Booking confirmed successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  });

  // Timer for locked seats
  useEffect(() => {
    if (lockExpiry && step === 'locked') {
      const timer = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, lockExpiry.getTime() - now.getTime());
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setStep('select');
          setSelectedSeats([]);
          setLockedSeats([]);
          setLockExpiry(null);
          toast.error('Seat lock expired. Please select seats again.');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockExpiry, step]);

  const handleSeatClick = (seat) => {
    if (step !== 'select') return;
    if (seat.status === 'booked') return;
    if (seat.status === 'locked' && seat.lockedUntil > new Date()) return;

    const seatId = `${seat.row}-${seat.number}`;
    const isSelected = selectedSeats.some(s => `${s.row}-${s.number}` === seatId);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => `${s.row}-${s.number}` !== seatId));
    } else {
      if (selectedSeats.length >= 10) {
        toast.error('Maximum 10 seats can be selected');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleLockSeats = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    const seatsToLock = selectedSeats.map(seat => ({
      row: seat.row,
      number: seat.number
    }));

    lockSeatsMutation.mutate({ eventId, seats: seatsToLock });
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    
    try {
      const totalAmount = lockedSeats.reduce((sum, seat) => sum + seat.price, 0);
      
      // Simulate payment processing based on method
      let paymentId = '';
      
      if (paymentMethod === 'netbanking') {
        paymentId = await handleNetBankingPayment(totalAmount);
      } else if (paymentMethod === 'qr') {
        paymentId = await handleQRPayment(totalAmount);
      } else if (paymentMethod === 'card') {
        paymentId = await handleCardPayment(totalAmount);
      }
      
      if (paymentId) {
        const seatsToBook = lockedSeats.map(seat => ({
          row: seat.row,
          number: seat.number
        }));

        createBookingMutation.mutate({
          eventId,
          seats: seatsToBook,
          paymentId,
          paymentMethod
        });
      }
      
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNetBankingPayment = async (amount) => {
    return new Promise((resolve, reject) => {
      // Create payment data
      const paymentData = {
        bankOptions: [
          { code: 'SBI', name: 'State Bank of India', logo: '🏦' },
          { code: 'HDFC', name: 'HDFC Bank', logo: '🏛️' },
          { code: 'ICICI', name: 'ICICI Bank', logo: '🏪' },
          { code: 'AXIS', name: 'Axis Bank', logo: '🏢' },
          { code: 'KOTAK', name: 'Kotak Mahindra Bank', logo: '🏬' },
          { code: 'PNB', name: 'Punjab National Bank', logo: '🏦' }
        ],
        amount
      };
      
      setPaymentData(paymentData);
      setStep('payment');
      
      // Mock bank selection and OTP verification
      setTimeout(() => {
        const selectedBank = paymentData.bankOptions[0]; // Auto-select first bank for demo
        const transactionId = `NB${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        // Simulate OTP verification
        const otp = '123456'; // Mock OTP
        
        toast.success(`Payment successful via ${selectedBank.name}`);
        resolve(transactionId);
      }, 3000);
    });
  };

  const handleQRPayment = async (amount) => {
    return new Promise((resolve, reject) => {
      const transactionId = `QR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const qrData = {
        qrString: `upi://pay?pa=ETICKET@UPI&pn=E-Ticket Portal&am=${amount}&cu=INR&tn=E-Ticket Booking Payment&tr=${transactionId}`,
        transactionId,
        amount,
        merchantId: 'ETICKET@UPI'
      };
      
      setPaymentData(qrData);
      setStep('payment');
      
      // Simulate QR code scan and payment
      setTimeout(() => {
        toast.success('Payment successful via UPI QR Code');
        resolve(transactionId);
      }, 4000);
    });
  };

  const handleCardPayment = async (amount) => {
    return new Promise((resolve, reject) => {
      // Simulate card payment
      setTimeout(() => {
        const paymentId = `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        toast.success('Payment successful via Card');
        resolve(paymentId);
      }, 3000);
    });
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTotalAmount = () => {
    const seats = step === 'select' ? selectedSeats : lockedSeats;
    return seats.reduce((sum, seat) => sum + seat.price, 0);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        <div className="h-64 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Event not found or error loading event details.</p>
        <Link to="/events" className="text-blue-600 hover:underline">
          ← Back to Events
        </Link>
      </div>
    );
  }

  // Group seats by row for display
  const seatsByRow = event.seats?.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          to={`/events/${eventId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event Details
        </Link>
        
        {step === 'locked' && (
          <div className="flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-lg">
            <Clock className="w-4 h-4 mr-2" />
            Time remaining: {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Event Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(event.dateTime), 'MMM dd, yyyy')}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {format(new Date(event.dateTime), 'h:mm a')}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {event.venue.name}, {event.venue.city}
              </div>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {event.category}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Seat Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Select Your Seats</h2>
            
            {/* Screen/Stage */}
            <div className="text-center mb-6">
              <div className="inline-block bg-gray-800 text-white px-8 py-2 rounded-t-lg">
                SCREEN / STAGE
              </div>
            </div>

            {/* Seat Map */}
            <div className="space-y-3 max-w-4xl mx-auto">
              {Object.keys(seatsByRow).sort().map(row => (
                <div key={row} className="flex items-center justify-center space-x-2">
                  <span className="w-8 text-center text-sm font-medium text-gray-600">
                    {row}
                  </span>
                  <div className="flex space-x-1">
                    {seatsByRow[row]
                      .sort((a, b) => a.number - b.number)
                      .map(seat => {
                        const seatId = `${seat.row}-${seat.number}`;
                        const isSelected = selectedSeats.some(s => `${s.row}-${s.number}` === seatId);
                        const isLocked = lockedSeats.some(s => `${s.row}-${s.number}` === seatId);
                        
                        let seatClass = 'w-8 h-8 rounded border-2 cursor-pointer transition-colors text-xs flex items-center justify-center font-medium ';
                        
                        if (seat.status === 'booked') {
                          seatClass += 'bg-red-500 border-red-600 text-white cursor-not-allowed';
                        } else if (seat.status === 'locked' && seat.lockedUntil > new Date() && !isLocked) {
                          seatClass += 'bg-orange-300 border-orange-400 text-orange-800 cursor-not-allowed';
                        } else if (isSelected || isLocked) {
                          seatClass += 'bg-blue-500 border-blue-600 text-white';
                        } else {
                          // Available seat colors by category
                          if (seat.category === 'Platinum') {
                            seatClass += 'bg-yellow-200 border-yellow-400 text-yellow-800 hover:bg-yellow-300';
                          } else if (seat.category === 'Gold') {
                            seatClass += 'bg-orange-200 border-orange-400 text-orange-800 hover:bg-orange-300';
                          } else {
                            seatClass += 'bg-gray-200 border-gray-400 text-gray-800 hover:bg-gray-300';
                          }
                        }

                        return (
                          <button
                            key={seatId}
                            className={seatClass}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'booked' || (seat.status === 'locked' && seat.lockedUntil > new Date() && !isLocked) || step !== 'select'}
                            title={`${seat.row}${seat.number} - ${seat.category} - ₹${seat.price}`}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-6 mt-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded mr-2"></div>
                Platinum
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-200 border border-orange-400 rounded mr-2"></div>
                Gold
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded mr-2"></div>
                Silver
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded mr-2"></div>
                Selected
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 border border-red-600 rounded mr-2"></div>
                Booked
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-300 border border-orange-400 rounded mr-2"></div>
                Locked
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          {/* Selected Seats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {step === 'select' ? 'Selected Seats' : 'Locked Seats'}
            </h3>
            
            {(step === 'select' ? selectedSeats : lockedSeats).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No seats selected</p>
            ) : (
              <div className="space-y-2">
                {(step === 'select' ? selectedSeats : lockedSeats).map(seat => (
                  <div key={`${seat.row}-${seat.number}`} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <span className="font-medium">{seat.row}{seat.number}</span>
                      <span className="text-sm text-gray-600 ml-2">({seat.category})</span>
                    </div>
                    <span className="font-medium">₹{seat.price}</span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-2 border-t-2 font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{getTotalAmount()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {user?.name}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Mobile:</strong> {user?.mobile}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {step === 'select' && (
              <button
                onClick={handleLockSeats}
                disabled={selectedSeats.length === 0 || lockSeatsMutation.isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {lockSeatsMutation.isLoading ? 'Locking Seats...' : `Lock ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''}`}
              </button>
            )}

            {step === 'locked' && (
              <div className="space-y-4">
                <h4 className="font-semibold">Select Payment Method</h4>
                <div className="space-y-3">
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'netbanking' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === 'netbanking'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🏦</span>
                      <div>
                        <div className="font-medium">Net Banking</div>
                        <div className="text-sm text-gray-600">Pay using your bank account</div>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'qr' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="qr"
                      checked={paymentMethod === 'qr'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📱</span>
                      <div>
                        <div className="font-medium">UPI QR Code</div>
                        <div className="text-sm text-gray-600">Scan QR code with any UPI app</div>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💳</span>
                      <div>
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-gray-600">Pay using your card</div>
                      </div>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!paymentMethod || isProcessing || createBookingMutation.isLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isProcessing || createBookingMutation.isLoading ? 'Processing Payment...' : `Pay ₹${getTotalAmount()}`}
                </button>
              </div>
            )}

            {step === 'payment' && paymentData && (
              <div className="space-y-4">
                {paymentMethod === 'netbanking' && (
                  <div className="text-center">
                    <div className="bg-blue-100 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-blue-800">Net Banking Payment</h4>
                      <p className="text-sm text-blue-600 mt-1">Redirecting to your bank...</p>
                    </div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Please complete the payment on your bank's website</p>
                  </div>
                )}

                {paymentMethod === 'qr' && (
                  <div className="text-center">
                    <div className="bg-green-100 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-green-800">UPI QR Payment</h4>
                      <p className="text-sm text-green-600 mt-1">Scan the QR code with any UPI app</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mx-auto w-48 h-48 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">📱</div>
                        <p className="text-xs text-gray-600">QR Code</p>
                        <p className="text-xs text-gray-500 mt-1">₹{paymentData.amount}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Waiting for payment confirmation...</p>
                    <div className="animate-pulse flex justify-center mt-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="text-center">
                    <div className="bg-purple-100 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-purple-800">Card Payment</h4>
                      <p className="text-sm text-purple-600 mt-1">Processing your card payment...</p>
                    </div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Please wait while we process your payment</p>
                  </div>
                )}
              </div>
            )}

            {step === 'confirmed' && (
              <div className="text-center space-y-4">
                <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                  <h3 className="font-semibold">Booking Confirmed!</h3>
                  <p className="text-sm mt-1">You will be redirected to your profile shortly.</p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  View My Bookings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}