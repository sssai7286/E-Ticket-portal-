#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 E-Ticket Booking Portal - Production Mode\n');

// Check if frontend is built
const distPath = path.join(__dirname, 'frontend', 'dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ Frontend not built. Please run: cd frontend && npm run build');
  process.exit(1);
}

console.log('✅ Frontend build found');

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🌐 Starting production server...\n');

// Start the server
const server = spawn('node', ['backend/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\n🛑 Server stopped with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  server.kill('SIGTERM');
});