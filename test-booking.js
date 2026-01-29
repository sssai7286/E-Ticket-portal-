const axios = require('axios');

const testBookingFlow = async () => {
  console.log('🧪 Testing Complete Booking Flow...\n');
  
  try {
    // Step 1: Login as user
    console.log('1️⃣ Logging in as user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user@test.com',
      password: 'user123',
      role: 'user'
    });
    
    const token = loginResponse.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful\n');

    // Step 2: Get events
    console.log('2️⃣ Fetching events...');
    const eventsResponse = await axios.get('http://localhost:5000/api/events');
    const events = eventsResponse.data.events;
    
    if (events.length === 0) {
      console.log('❌ No events found');
      return;
    }
    
    const event = events[0];
    console.log(`✅ Found event: ${event.title}\n`);

    // Step 3: Lock seats
    console.log('3️⃣ Locking seats...');
    const seatsToLock = [
      { row: 'A', number: 1 },
      { row: 'A', number: 2 }
    ];
    
    const lockResponse = await axios.post('http://localhost:5000/api/bookings/lock-seats', {
      eventId: event._id,
      seats: seatsToLock
    }, { headers: authHeaders });
    
    console.log('✅ Seats locked successfully');
    console.log(`💰 Total Amount: ₹${lockResponse.data.totalAmount}`);
    console.log(`⏰ Lock Expiry: ${new Date(lockResponse.data.lockExpiry).toLocaleString()}\n`);

    // Step 4: Create booking with payment
    console.log('4️⃣ Creating booking with payment...');
    const bookingResponse = await axios.post('http://localhost:5000/api/bookings', {
      eventId: event._id,
      seats: seatsToLock,
      paymentId: 'NETBANKING_TEST_123456',
      paymentMethod: 'netbanking'
    }, { headers: authHeaders });
    
    console.log('✅ Booking created successfully!');
    console.log(`🎫 Booking ID: ${bookingResponse.data.booking.bookingId}`);
    console.log(`💳 Payment Method: ${bookingResponse.data.booking.paymentMethod}`);
    console.log(`📊 Status: ${bookingResponse.data.booking.status}\n`);

    // Step 5: Get user bookings
    console.log('5️⃣ Fetching user bookings...');
    const userBookingsResponse = await axios.get('http://localhost:5000/api/bookings', {
      headers: authHeaders
    });
    
    console.log(`✅ Found ${userBookingsResponse.data.count} booking(s)`);
    userBookingsResponse.data.bookings.forEach(booking => {
      console.log(`   📋 ${booking.bookingId} - ${booking.event.title} - ₹${booking.totalAmount}`);
    });

    console.log('\n🎉 Booking flow test completed successfully!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
  }
};

testBookingFlow();