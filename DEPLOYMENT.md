# E-Ticket Booking Portal - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd eticket-booking-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Environment Setup**
   ```bash
   cp .env.production .env
   # Edit .env with your actual values
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   # Then seed the database
   npm run seed
   ```

5. **Build Frontend**
   ```bash
   cd frontend && npm run build && cd ..
   ```

6. **Start Production Server**
   ```bash
   npm start
   ```

## 🔑 Default Credentials

**Admin Login:**
- Email: admin@eticket.com
- Password: admin123
- Role: Admin

**User Login:**
- Email: user@test.com
- Password: user123
- Role: User

## 📁 Project Structure

```
eticket-booking-portal/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── seeds/           # Database seeders
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── main.jsx     # App entry point
│   └── dist/            # Built frontend (after build)
└── package.json         # Root package.json
```

## 🌐 Deployment Options

### Option 1: Local Deployment
1. Follow installation steps above
2. Access at http://localhost:5000

### Option 2: Cloud Deployment (Heroku)
1. Create Heroku app
2. Set environment variables
3. Deploy using Git

### Option 3: VPS Deployment
1. Set up Ubuntu/CentOS server
2. Install Node.js and MongoDB
3. Clone and configure project
4. Use PM2 for process management

## 🔧 Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `RAZORPAY_KEY_ID`: Razorpay API key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key

### Features
- ✅ User Authentication & Authorization
- ✅ Event Management
- ✅ Interactive Seat Selection
- ✅ Booking System with Payment
- ✅ Admin Dashboard
- ✅ Theater Admin Panel
- ✅ Responsive Design
- ✅ Real-time Seat Locking

## 🛠️ Development

### Start Development Server
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
cd frontend && npm run lint
```

## 📞 Support
For issues and questions, please create an issue in the repository.
