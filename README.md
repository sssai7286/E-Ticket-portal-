# E-Ticket Booking Portal

A complete full-stack e-ticket booking system with seat management, payment integration, and admin dashboard.

## Features

### 🎫 Core Booking Features
- **User Authentication** - JWT-based secure login/registration
- **Event Management** - Browse events by category, date, location
- **Smart Seat Selection** - Interactive seat map with real-time availability
- **Seat Locking** - Prevents double booking with 15-minute temporary locks
- **Payment Integration** - Razorpay payment gateway integration
- **E-Ticket Generation** - QR code tickets with PDF download

### 🛡️ Security & Performance
- **Rate Limiting** - Prevents API abuse
- **Input Validation** - Server-side validation with Joi
- **Password Hashing** - bcrypt for secure password storage
- **Database Transactions** - Ensures data consistency
- **Role-based Access** - User and Admin role management

### 📊 Admin Dashboard
- **Revenue Analytics** - Monthly revenue charts and statistics
- **Booking Management** - View, cancel, and manage all bookings
- **Event Management** - Create, update, and manage events
- **User Management** - View and manage registered users

## Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **Razorpay** - Payment processing
- **bcryptjs** - Password hashing
- **express-rate-limit** - API rate limiting

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Axios** - HTTP client

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Razorpay account (for payments)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd e-ticket-booking-portal
npm install
cd frontend && npm install
```

2. **Environment Setup**
```bash
# Copy and configure environment variables
cp .env.example .env
# Update MongoDB URI, JWT secret, and Razorpay keys
```

3. **Start Development Servers**
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000
```

### Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eticket-booking
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event with seats
- `POST /api/events` - Create event (Admin only)

### Bookings
- `POST /api/bookings/lock-seats` - Lock seats temporarily
- `POST /api/bookings` - Create booking after payment
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get single booking

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature
- `POST /api/payments/webhook` - Handle payment webhooks

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/bookings` - All bookings management
- `GET /api/admin/events` - All events management
- `GET /api/admin/users` - User management

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  mobile: String,
  password: String (hashed),
  role: ['user', 'admin'],
  isActive: Boolean
}
```

### Event Model
```javascript
{
  title: String,
  description: String,
  category: ['Movie', 'Concert', 'Sports', 'Theater', 'Comedy'],
  dateTime: Date,
  venue: { name, address, city },
  seats: [{ row, number, category, price, status, lockedUntil, bookedBy }],
  totalSeats: Number,
  availableSeats: Number,
  isActive: Boolean
}
```

### Booking Model
```javascript
{
  bookingId: String (unique),
  user: ObjectId,
  event: ObjectId,
  seats: [{ row, number, category, price }],
  totalAmount: Number,
  status: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  paymentId: String,
  paymentStatus: ['PENDING', 'SUCCESS', 'FAILED']
}
```

## Key Features Implementation

### 🔒 Seat Locking Mechanism
- Seats are locked for 15 minutes during booking process
- Prevents double booking using MongoDB transactions
- Automatic cleanup of expired locks

### 💳 Payment Flow
1. User selects seats → Seats get locked
2. Payment order created via Razorpay
3. User completes payment
4. Payment verified via signature
5. Booking confirmed, seats marked as booked

### 🎟️ Ticket Generation
- QR codes generated for each booking
- PDF tickets with event and seat details
- Email delivery of tickets

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Considerations
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure proper CORS settings
- Set up SSL certificates
- Configure email service
- Set up Razorpay webhooks

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@eticket-portal.com or create an issue in the repository.