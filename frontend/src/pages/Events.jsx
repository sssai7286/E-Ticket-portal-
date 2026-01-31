import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import { Calendar, MapPin, Search, Filter, Navigation, Map } from 'lucide-react'
import { format } from 'date-fns'

const fetchEvents = async ({ category, city, search, page = 1, lat, lng }) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (city) params.append('city', city);
  if (search) params.append('search', search);
  if (lat && lng) {
    params.append('lat', lat);
    params.append('lng', lng);
  }
  params.append('page', page);
  params.append('limit', 12);

  const response = await axios.get(`/api/events?${params}`);
  return response.data;
};

// Theater background images
const theaterBackgrounds = [
  'https://images.unsplash.com/photo-1489599904472-84978f312f2e?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&h=400&fit=crop'
];

const getRandomTheaterImage = () => {
  return theaterBackgrounds[Math.floor(Math.random() * theaterBackgrounds.length)];
};

export default function Events() {
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    search: '',
    page: 1,
    lat: null,
    lng: null
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');

  const { data, isLoading, error } = useQuery(
    ['events', filters],
    () => fetchEvents(filters),
    {
      keepPreviousData: true
    }
  );

  const categories = ['Movie', 'Concert', 'Sports', 'Theater', 'Comedy'];
  const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Guntur'];

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLocationPermission('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setFilters(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          city: '', // Clear city filter when using location
          page: 1
        }));
        setLocationPermission('granted');
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        alert('Unable to get your location. Please select a city manually.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
      // Clear location when city is selected
      ...(key === 'city' && value ? { lat: null, lng: null } : {})
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearLocationFilter = () => {
    setFilters(prev => ({
      ...prev,
      lat: null,
      lng: null,
      page: 1
    }));
    setUserLocation(null);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading events. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <div className="text-sm text-gray-600">
          {data?.total || 0} events found
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* City Filter */}
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            disabled={userLocation}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Location Button */}
          <button
            onClick={getCurrentLocation}
            disabled={locationPermission === 'requesting'}
            className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
              userLocation 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
            } ${locationPermission === 'requesting' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {locationPermission === 'requesting' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                {userLocation ? 'Near Me ✓' : 'Near Me'}
              </>
            )}
          </button>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setFilters({ category: '', city: '', search: '', page: 1, lat: null, lng: null });
              setUserLocation(null);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Location Status */}
        {userLocation && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
            <div className="flex items-center text-green-700">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">Showing events near your location</span>
            </div>
            <button
              onClick={clearLocationFilter}
              className="text-green-600 hover:text-green-800 text-sm underline"
            >
              Clear location
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
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
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.events?.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                  {event.image ? (
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img 
                        src={getRandomTheaterImage()} 
                        alt="Theater background"
                        className="w-full h-full object-cover opacity-70"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Calendar className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm font-semibold">{event.category}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {event.category}
                    </span>
                    {event.seats && event.seats.length > 0 && (
                      <span className="text-sm text-gray-600">
                        ₹{Math.min(...event.seats.map(s => s.price))}+
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{event.title}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(event.dateTime), 'MMM dd, yyyy • h:mm a')}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.venue.name}, {event.venue.city}
                      {userLocation && event.distance && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {event.distance.toFixed(1)} km away
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-green-600">
                      {event.availableSeats} seats available
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

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {[...Array(data.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-2 rounded-md ${
                      filters.page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === data.totalPages}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {data?.events?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  )
}