import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import { Calendar, MapPin, Users, Clock, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'

const fetchEvent = async (eventId) => {
  const response = await axios.get(`/api/events/${eventId}`);
  return response.data.event;
};

export default function EventDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  
  const { data: event, isLoading, error } = useQuery(
    ['event', id],
    () => fetchEvent(id),
    {
      enabled: !!id
    }
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        <div className="h-64 bg-gray-300 rounded"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
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

  // Group seats by category for pricing display
  const seatCategories = event.seats?.reduce((acc, seat) => {
    if (!acc[seat.category]) {
      acc[seat.category] = {
        price: seat.price,
        available: 0,
        total: 0
      };
    }
    acc[seat.category].total++;
    if (seat.status === 'available') {
      acc[seat.category].available++;
    }
    return acc;
  }, {}) || {};

  const isEventPast = new Date(event.dateTime) < new Date();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link 
        to="/events" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="h-64 md:h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">{event.category}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:w-2/3 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {event.category}
                </span>
                <h1 className="text-3xl font-bold mt-2 mb-2">{event.title}</h1>
              </div>
              {isEventPast && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  Event Ended
                </span>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-sm">{format(new Date(event.dateTime), 'EEEE, MMMM dd, yyyy')}</p>
                  <p className="text-sm">{format(new Date(event.dateTime), 'h:mm a')}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Venue</p>
                  <p className="text-sm">{event.venue.name}</p>
                  <p className="text-sm">{event.venue.address}, {event.venue.city}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Availability</p>
                  <p className="text-sm">{event.availableSeats} of {event.totalSeats} seats available</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-sm">
                    {event.category === 'Movie' ? '2-3 hours' : 
                     event.category === 'Concert' ? '3-4 hours' :
                     event.category === 'Sports' ? '2-3 hours' :
                     event.category === 'Theater' ? '2-2.5 hours' : '1-2 hours'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Description */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">About This Event</h2>
        <p className="text-gray-700 leading-relaxed">{event.description}</p>
      </div>

      {/* Pricing & Booking */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Ticket Pricing</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Object.entries(seatCategories).map(([category, info]) => (
            <div key={category} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg">{category}</h3>
              <p className="text-2xl font-bold text-blue-600">₹{info.price}</p>
              <p className="text-sm text-gray-600">
                {info.available} of {info.total} available
              </p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(info.available / info.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Book Button */}
        <div className="text-center">
          {isEventPast ? (
            <button 
              disabled 
              className="bg-gray-400 text-white px-8 py-3 rounded-lg text-lg font-semibold cursor-not-allowed"
            >
              Event Has Ended
            </button>
          ) : event.availableSeats === 0 ? (
            <button 
              disabled 
              className="bg-red-400 text-white px-8 py-3 rounded-lg text-lg font-semibold cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : !isAuthenticated ? (
            <div className="space-y-2">
              <p className="text-gray-600">Please login to book tickets</p>
              <Link 
                to="/login" 
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Login to Book
              </Link>
            </div>
          ) : (
            <Link 
              to={`/booking/${event._id}`}
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Select Seats & Book Now
            </Link>
          )}
        </div>
      </div>

      {/* Seat Map Preview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Seat Layout Preview</h2>
        <div className="text-center">
          <div className="inline-block bg-gray-800 text-white px-4 py-2 rounded-t-lg mb-4">
            SCREEN / STAGE
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          {/* Simple seat map visualization */}
          <div className="space-y-2">
            {Object.keys(
              event.seats?.reduce((acc, seat) => {
                acc[seat.row] = true;
                return acc;
              }, {}) || {}
            ).map(row => (
              <div key={row} className="flex items-center justify-center space-x-1">
                <span className="w-6 text-center text-sm font-medium">{row}</span>
                <div className="flex space-x-1">
                  {event.seats
                    ?.filter(seat => seat.row === row)
                    .map(seat => (
                      <div
                        key={`${seat.row}-${seat.number}`}
                        className={`w-4 h-4 rounded-sm ${
                          seat.status === 'available' 
                            ? seat.category === 'Platinum' 
                              ? 'bg-yellow-400' 
                              : seat.category === 'Gold' 
                                ? 'bg-orange-400' 
                                : 'bg-gray-400'
                            : seat.status === 'booked'
                              ? 'bg-red-400'
                              : 'bg-blue-400'
                        }`}
                        title={`${seat.row}${seat.number} - ${seat.category} - ₹${seat.price}`}
                      ></div>
                    ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-6 mt-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-400 rounded-sm mr-2"></div>
              Platinum
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-400 rounded-sm mr-2"></div>
              Gold
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-400 rounded-sm mr-2"></div>
              Silver
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-400 rounded-sm mr-2"></div>
              Booked
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}