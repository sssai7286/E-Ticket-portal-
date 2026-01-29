import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import { Calendar, MapPin, Users, Shield, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

const fetchFeaturedEvents = async () => {
  const response = await axios.get('/api/events?limit=6');
  return response.data.events;
};

export default function Home() {
  const { data: featuredEvents, isLoading } = useQuery(
    'featuredEvents',
    fetchFeaturedEvents
  );

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
        <h1 className="text-5xl font-bold mb-6">
          Book Your Perfect Event Experience
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Discover amazing events, secure your seats, and create unforgettable memories. 
          From movies to concerts, sports to theater - we've got it all!
        </p>
        <Link 
          to="/events" 
          className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
        >
          Explore Events
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
          <p className="text-gray-600">
            Book tickets in just a few clicks with our intuitive interface
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Multiple Venues</h3>
          <p className="text-gray-600">
            Events across multiple cities and venues to choose from
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Seat Selection</h3>
          <p className="text-gray-600">
            Choose your preferred seats with our interactive seat map
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
          <p className="text-gray-600">
            Safe and secure payment processing with multiple options
          </p>
        </div>
      </section>

      {/* Featured Events Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Events</h2>
          <Link 
            to="/events" 
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
          >
            View All Events
            <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents?.slice(0, 6).map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  {event.image ? (
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">{event.category}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {event.category}
                    </span>
                    <span className="text-sm text-gray-600">
                      ₹{Math.min(...event.seats?.map(s => s.price) || [0])}+
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{event.title}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(event.dateTime), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.venue.name}, {event.venue.city}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-green-600">
                      {event.availableSeats} seats left
                    </span>
                    <Link
                      to={`/events/${event._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Event Categories</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {['Movie', 'Concert', 'Sports', 'Theater', 'Comedy'].map((category) => (
            <Link
              key={category}
              to={`/events?category=${category}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {category}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Book Your Next Experience?</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of happy customers who trust us for their entertainment needs. 
          Secure booking, instant confirmation, and unforgettable experiences await!
        </p>
        <Link 
          to="/events" 
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
        >
          Browse All Events
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </section>
    </div>
  )
}