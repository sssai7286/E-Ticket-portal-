const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
require('dotenv').config();

// Sample movies and events data
const sampleEvents = [
  // Movies
  {
    title: "Avengers: Endgame",
    description: "The epic conclusion to the Infinity Saga. After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
    category: "Movie",
    dateTime: new Date('2024-02-15T19:30:00'),
    venue: {
      name: "PVR Cinemas",
      address: "Phoenix MarketCity Mall, Whitefield",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=1200&fit=crop&crop=center"
  },
  {
    title: "Spider-Man: No Way Home",
    description: "Peter Parker's secret identity is revealed to the entire world. Desperate for help, Peter turns to Doctor Strange to make the world forget that he is Spider-Man. The spell goes horribly wrong, forcing Peter to discover what it truly means to be Spider-Man.",
    category: "Movie",
    dateTime: new Date('2024-02-16T16:00:00'),
    venue: {
      name: "INOX Multiplex",
      address: "Forum Mall, Koramangala",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop&crop=center"
  },
  {
    title: "The Batman",
    description: "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
    category: "Movie",
    dateTime: new Date('2024-02-17T21:00:00'),
    venue: {
      name: "Cinepolis",
      address: "Nexus Mall, Koramangala",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1509347528160-9329d33b2588?w=500"
  },
  {
    title: "Top Gun: Maverick",
    description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN's elite graduates on a mission that demands the ultimate sacrifice from those chosen to fly it.",
    category: "Movie",
    dateTime: new Date('2024-02-18T14:30:00'),
    venue: {
      name: "PVR Cinemas",
      address: "Orion Mall, Rajajinagar",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1489599162810-1e666c2c3d9b?w=500"
  },
  {
    title: "Dune",
    description: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
    category: "Movie",
    dateTime: new Date('2024-02-19T20:15:00'),
    venue: {
      name: "IMAX Theatre",
      address: "Mantri Square Mall, Malleshwaram",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500"
  },

  // Telugu Movies in Guntur
  {
    title: "RRR - Rise Roar Revolt",
    description: "A fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s. An epic tale of friendship, sacrifice, and the fight for freedom.",
    category: "Movie",
    dateTime: new Date('2024-02-20T18:00:00'),
    venue: {
      name: "Sudarshan 35MM",
      address: "Brodipet Main Road",
      city: "Guntur"
    },
    image: "https://images.unsplash.com/photo-1489599904472-84978f312f2e?w=800&h=1200&fit=crop&crop=center"
  },
  {
    title: "Pushpa: The Rise",
    description: "A laborer named Pushpa makes enemies as he rises in the world of red sandalwood smuggling. However, violence erupts when the police attempt to bring down his illegal business.",
    category: "Movie",
    dateTime: new Date('2024-02-21T20:30:00'),
    venue: {
      name: "Cinepolis Guntur",
      address: "Vijaya Krishna Mall, Lakshmipuram",
      city: "Guntur"
    },
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=1200&fit=crop&crop=center"

  // Concerts
  {
    title: "AR Rahman Live in Concert",
    description: "Experience the magic of Oscar-winning composer AR Rahman live in concert. An evening filled with his greatest hits from Bollywood and regional cinema, performed with a full orchestra.",
    category: "Concert",
    dateTime: new Date('2024-02-20T19:00:00'),
    venue: {
      name: "Palace Grounds",
      address: "Jayamahal Road, Near Cantonment Railway Station",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center"
  },
  {
    title: "Coldplay World Tour",
    description: "British rock band Coldplay brings their spectacular world tour to India. Experience their biggest hits including Yellow, Fix You, Viva La Vida, and songs from their latest album.",
    category: "Concert",
    dateTime: new Date('2024-02-25T20:00:00'),
    venue: {
      name: "Bangalore International Exhibition Centre",
      address: "10th Mile, Tumkur Road",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500"
  },
  {
    title: "Arijit Singh Live",
    description: "The voice of Bollywood, Arijit Singh, performs his most beloved romantic songs live. An intimate evening of soulful music that will touch your heart.",
    category: "Concert",
    dateTime: new Date('2024-03-01T18:30:00'),
    venue: {
      name: "Sree Kanteerava Stadium",
      address: "Nrupathunga Road, Sampangi Rama Nagar",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500"
  },

  // Sports
  {
    title: "IPL 2024: RCB vs CSK",
    description: "The most anticipated match of IPL 2024! Royal Challengers Bangalore takes on Chennai Super Kings in this thrilling T20 cricket match. Witness the battle between two powerhouse teams.",
    category: "Sports",
    dateTime: new Date('2024-03-15T19:30:00'),
    venue: {
      name: "M. Chinnaswamy Stadium",
      address: "Cubbon Park, Queens Road",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop&crop=center"
  },
  {
    title: "Bengaluru FC vs Mumbai City FC",
    description: "Indian Super League action at its finest! Bengaluru FC hosts Mumbai City FC in this crucial league match. Come support the Blues at their home ground.",
    category: "Sports",
    dateTime: new Date('2024-03-10T17:00:00'),
    venue: {
      name: "Sree Kanteerava Stadium",
      address: "Nrupathunga Road, Sampangi Rama Nagar",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500"
  },

  // Theater
  {
    title: "Hamlet - The Classic",
    description: "Shakespeare's timeless tragedy comes alive on stage. A powerful performance of Prince Hamlet's quest for revenge, featuring acclaimed actors and stunning stage design.",
    category: "Theater",
    dateTime: new Date('2024-02-22T19:30:00'),
    venue: {
      name: "Ranga Shankara Theatre",
      address: "36/2, 8th Cross, 4th Block, Jayanagar",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&h=600&fit=crop&crop=center"
  },
  {
    title: "The Lion King Musical",
    description: "Disney's award-winning musical brings the Pride Lands to life with spectacular costumes, innovative puppetry, and unforgettable music including Circle of Life and Can You Feel the Love Tonight.",
    category: "Theater",
    dateTime: new Date('2024-03-05T18:00:00'),
    venue: {
      name: "Chowdiah Memorial Hall",
      address: "Gayathri Devi Park Extension, Malleswaram",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=500"
  },

  // Comedy
  {
    title: "Zakir Khan Live",
    description: "India's favorite storyteller Zakir Khan brings his hilarious observations about life, relationships, and everything in between. Get ready for an evening full of laughter and relatable humor.",
    category: "Comedy",
    dateTime: new Date('2024-02-28T20:00:00'),
    venue: {
      name: "Phoenix MarketCity",
      address: "Whitefield Main Road, Mahadevapura",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&h=600&fit=crop&crop=center"
  },
  {
    title: "Kenny Sebastian - The Most Interesting Person",
    description: "Musician-comedian Kenny Sebastian presents his latest stand-up special filled with quirky observations, musical comedy, and his signature style of humor.",
    category: "Comedy",
    dateTime: new Date('2024-03-08T19:00:00'),
    venue: {
      name: "Good Shepherd Auditorium",
      address: "Museum Road, Shanthala Nagar",
      city: "Bangalore"
    },
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"
  }
];

// Generate seat layout for each event
function generateSeatLayout(eventType = 'default') {
  const seats = [];
  let rows, seatsPerRow;
  
  // Different layouts for different event types
  switch (eventType) {
    case 'Movie':
      rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      seatsPerRow = 12;
      break;
    case 'Concert':
    case 'Sports':
      rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
      seatsPerRow = 20;
      break;
    case 'Theater':
      rows = ['A', 'B', 'C', 'D', 'E', 'F'];
      seatsPerRow = 8;
      break;
    case 'Comedy':
      rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      seatsPerRow = 10;
      break;
    default:
      rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      seatsPerRow = 10;
  }
  
  rows.forEach((row, rowIndex) => {
    for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
      let category, price;
      
      // Pricing based on row position
      if (rowIndex < Math.ceil(rows.length * 0.3)) {
        category = 'Platinum';
        price = eventType === 'Movie' ? 350 : eventType === 'Concert' ? 2500 : eventType === 'Sports' ? 1500 : 800;
      } else if (rowIndex < Math.ceil(rows.length * 0.7)) {
        category = 'Gold';
        price = eventType === 'Movie' ? 250 : eventType === 'Concert' ? 1500 : eventType === 'Sports' ? 1000 : 500;
      } else {
        category = 'Silver';
        price = eventType === 'Movie' ? 150 : eventType === 'Concert' ? 800 : eventType === 'Sports' ? 600 : 300;
      }
      
      seats.push({
        row,
        number: seatNum,
        category,
        price,
        status: 'available'
      });
    }
  });
  
  return seats;
}

// Create admin user
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@eticket.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      return adminExists;
    }

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eticket.com',
      mobile: '9999999999',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin user created successfully');
    return admin;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Seed events
const seedEvents = async (adminId) => {
  try {
    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Add seats to each event and set admin as creator
    const eventsWithSeats = sampleEvents.map(event => ({
      ...event,
      seats: generateSeatLayout(event.category),
      createdBy: adminId
    }));

    // Calculate total and available seats
    eventsWithSeats.forEach(event => {
      event.totalSeats = event.seats.length;
      event.availableSeats = event.seats.filter(seat => seat.status === 'available').length;
    });

    const createdEvents = await Event.insertMany(eventsWithSeats);
    console.log(`${createdEvents.length} events created successfully`);
    
    return createdEvents;
  } catch (error) {
    console.error('Error seeding events:', error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eticket-booking');
    console.log('Connected to MongoDB');

    // Create admin user
    const admin = await createAdminUser();

    // Seed events
    await seedEvents(admin._id);

    console.log('Database seeded successfully!');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin Email: admin@eticket.com');
    console.log('Admin Password: admin123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleEvents, generateSeatLayout };