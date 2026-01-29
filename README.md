# 🎫 E-Ticket Booking Portal

A complete full-stack e-ticket booking system with interactive seat selection, real-time booking, and comprehensive admin dashboard. Built with modern technologies for scalability and performance.

## 🌟 Features

### 🎫 Core Booking Features
- **Interactive Seat Selection** - Visual seat map with real-time availability
- **Smart Seat Locking** - 15-minute temporary locks prevent double booking
- **User Authentication** - JWT-based secure login/registration with role management
- **Event Management** - Browse events by category, date, location with advanced filters
- **Payment Integration** - Razorpay payment gateway ready for production
- **E-Ticket Generation** - QR code tickets with booking confirmation

### 🛡️ Security & Performance
- **Rate Limiting** - Prevents API abuse with configurable limits
- **Input Validation** - Comprehensive server-side validation
- **Password Hashing** - bcrypt for secure password storage
- **Database Transactions** - Ensures data consistency during bookings
- **Role-based Access** - User, Admin, and Theater Admin roles

### 📊 Admin Dashboard
- **Revenue Analytics** - Monthly revenue charts and booking statistics
- **Booking Management** - View, cancel, and manage all bookings
- **Event Management** - Create, update, and manage events with seat layouts
- **User Management** - View and manage registered users
- **Theater Management** - Approve and manage theater registrations

### 🎭 Theater Admin Panel
- **Theater Registration** - Theater owners can register their venues
- **Event Creation** - Create and manage events for their theaters
- **Booking Analytics** - View bookings and revenue for their events
- **Screen Management** - Manage multiple screens and seat layouts

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API server
- **MongoDB** + **Mongoose** - Database with schema validation
- **JWT** - Stateless authentication
- **Razorpay** - Payment processing
- **bcryptjs** - Password hashing
- **express-rate-limit** - API protection

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **React Router v6** - Client-side routing
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Performant form handling
- **Axios** - HTTP client with interceptors

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sssai7286/E-Ticket-portal-.git
cd E-Ticket-portal-
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install && cd ..
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.production .env
# Update with your actual values
```

4. **Database Setup**
```bash
# Seed database with sample data
npm run seed
```

5. **Start Development**
```bash
# Start both servers
npm run dev
```

### 🔑 Default Login Credentials

**Admin Login:**
- Email: `admin@eticket.com`
- Password: `admin123`

**User Login:**
- Email: `user@test.com`
- Password: `user123`

## 🌐 Production Deployment

### Local Production
```bash
cd frontend && npm run build && cd ..
node production.js
```

### Heroku Deployment
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
git push heroku main
```

### VPS Deployment
```bash
# Install PM2
npm install -g pm2

# Build and start
npm run build
pm2 start production.js --name "eticket-portal"
```

## 📁 Project Structure

```
E-Ticket-portal-/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & validation
│   ├── seeds/           # Sample data
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Route components
│   │   ├── contexts/    # React contexts
│   │   └── main.jsx     # App entry
│   └── dist/            # Production build
├── production.js        # Production server
└── DEPLOYMENT-GUIDE.md  # Detailed deployment guide
```

## 🎯 Key Features

### 💺 Interactive Seat Selection
- Visual seat map with color-coded categories
- Real-time seat availability updates
- Seat locking during booking process
- Multiple seat selection (up to 10 seats)

### 🔄 Booking Flow
1. **Browse Events** - Filter by category, date, location
2. **Select Event** - View details and seat layout
3. **Choose Seats** - Interactive seat selection
4. **Lock Seats** - 15-minute reservation
5. **Payment** - Secure payment processing
6. **Confirmation** - Booking confirmation with ticket

### 🎭 Event Categories
- **Movies** - Cinema screenings with multiple showtimes
- **Concerts** - Live music events and performances
- **Sports** - Cricket, football, and other sporting events
- **Theater** - Stage plays and theatrical performances
- **Comedy** - Stand-up comedy shows and events

### 💰 Pricing Tiers
- **Platinum** - Premium seats (₹500)
- **Gold** - Standard seats (₹300)
- **Silver** - Economy seats (₹200)

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
```

### Event Endpoints
```
GET  /api/events           # List events with filters
GET  /api/events/:id       # Get event details with seats
POST /api/events           # Create event (Admin only)
PUT  /api/events/:id       # Update event (Admin only)
```

### Booking Endpoints
```
POST /api/bookings/lock-seats  # Lock seats temporarily
POST /api/bookings             # Create booking
GET  /api/bookings             # Get user bookings
GET  /api/bookings/:id         # Get booking details
PUT  /api/bookings/:id/cancel  # Cancel booking
```

### Admin Endpoints
```
GET  /api/admin/dashboard      # Dashboard statistics
GET  /api/admin/bookings       # All bookings
GET  /api/admin/users          # User management
POST /api/admin/events         # Create events
```

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  mobile: String,
  password: String (hashed),
  role: ['user', 'admin', 'theater_admin'],
  isActive: Boolean,
  theater: ObjectId (for theater admins)
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
  seats: [{
    row: String,
    number: Number,
    category: ['Silver', 'Gold', 'Platinum'],
    price: Number,
    status: ['available', 'booked', 'locked'],
    lockedUntil: Date,
    bookedBy: ObjectId
  }],
  totalSeats: Number,
  availableSeats: Number,
  isActive: Boolean,
  createdBy: ObjectId
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
  status: ['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED'],
  paymentId: String,
  paymentStatus: ['PENDING', 'SUCCESS', 'FAILED'],
  qrCode: String,
  createdAt: Date
}
```

## 🔒 Security Features

- **JWT Authentication** - Stateless token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Comprehensive request validation
- **CORS Configuration** - Cross-origin request handling
- **Environment Variables** - Secure configuration management

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** - Full-featured experience
- **Tablet** - Touch-optimized interface
- **Mobile** - Mobile-first responsive design
- **All Browsers** - Cross-browser compatibility

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for detailed setup instructions
- Review the documentation for troubleshooting

---

**Built with ❤️ for seamless event booking experiences**
