#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎫 E-Ticket Booking Portal Setup\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('\n⚙️  Creating .env file...');
  const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eticket-booking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Math.random().toString(36).substring(7)}
JWT_EXPIRE=7d

# Razorpay (Test Mode) - Replace with your actual keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🎉 Setup completed successfully!\n');

console.log('📋 Next Steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Update .env file with your MongoDB URI and Razorpay keys');
console.log('3. Run "npm run seed" to populate sample data');
console.log('4. Run "npm run dev" to start both servers');
console.log('\n🚀 Your E-Ticket Booking Portal will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend:  http://localhost:5000');
console.log('\n👤 Admin Login Credentials (after seeding):');
console.log('   Email:    admin@eticket.com');
console.log('   Password: admin123');

console.log('\n📚 Available Commands:');
console.log('   npm run dev    - Start both frontend and backend');
console.log('   npm run server - Start backend only');
console.log('   npm run client - Start frontend only');
console.log('   npm run seed   - Populate database with sample data');
console.log('   npm run build  - Build frontend for production');

console.log('\n🔧 MongoDB Setup:');
console.log('   If you don\'t have MongoDB installed:');
console.log('   - Install MongoDB Community Edition from mongodb.com');
console.log('   - Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env');

console.log('\n💳 Razorpay Setup:');
console.log('   1. Sign up at razorpay.com');
console.log('   2. Get your test API keys from the dashboard');
console.log('   3. Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');

console.log('\n🎯 Ready to start? Run: npm run seed && npm run dev');