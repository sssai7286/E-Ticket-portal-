import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const TheaterDashboard = () => {
  const [theater, setTheater] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { user } = useAuth();

  useEffect(() => {
    fetchTheaterData();
    fetchEvents();
  }, []);

  const fetchTheaterData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/theater/my-theater', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setTheater(data.theater);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch theater data');
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/theater/my-events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !theater) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Theater Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/theater-register"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Register Your Theater
            </a>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (isApproved, isActive) => {
    if (!isApproved) {
      return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending Approval</span>;
    }
    if (!isActive) {
      return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Inactive</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Theater Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              {theater && getStatusBadge(theater.isApproved, theater.isActive)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'events', 'theater-info'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && theater && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Screens</dt>
                        <dd className="text-lg font-medium text-gray-900">{theater.screens?.length || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Events</dt>
                        <dd className="text-lg font-medium text-gray-900">{events.filter(e => e.isActive).length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Location</dt>
                        <dd className="text-lg font-medium text-gray-900">{theater.address?.city}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {theater.isApproved ? 'Approved' : 'Pending'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Events</h3>
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event) => (
                      <div key={event._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-500">{event.category} • {event.screen}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.dateTime).toLocaleDateString()} at {new Date(event.dateTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {event.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {event.availableSeats}/{event.totalSeats} seats
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No events created yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Manage Events</h2>
              {theater?.isApproved && (
                <a
                  href="/theater-admin/create-event"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create New Event
                </a>
              )}
            </div>

            {!theater?.isApproved && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-800">
                  Your theater needs to be approved by an admin before you can create events.
                </p>
              </div>
            )}

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                            <p className="text-gray-600 mt-1">{event.description}</p>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                              <span>Category: {event.category}</span>
                              <span>Screen: {event.screen}</span>
                              <span>Date: {new Date(event.dateTime).toLocaleDateString()}</span>
                              <span>Time: {new Date(event.dateTime).toLocaleTimeString()}</span>
                              <span>Available: {event.availableSeats}/{event.totalSeats}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {event.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No events created yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Theater Info Tab */}
        {activeTab === 'theater-info' && theater && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Theater Information</h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Theater Name</label>
                    <p className="mt-1 text-sm text-gray-900">{theater.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(theater.isApproved, theater.isActive)}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{theater.description || 'No description provided'}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {theater.address.street}, {theater.address.city}, {theater.address.state} {theater.address.zipCode}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{theater.contact.phone}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <p className="mt-1 text-sm text-gray-900">{theater.contact.email}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Facilities</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {theater.facilities?.length > 0 ? (
                        theater.facilities.map((facility) => (
                          <span key={facility} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {facility}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No facilities listed</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Screens</label>
                    <div className="mt-1 space-y-2">
                      {theater.screens?.map((screen, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <span className="font-medium">{screen.name}</span>
                            <span className="text-gray-500 ml-2">({screen.screenType})</span>
                          </div>
                          <span className="text-sm text-gray-600">{screen.capacity} seats</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {theater.registrationDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(theater.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {theater.approvedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Approved Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(theater.approvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {theater.isApproved && (
                  <div className="mt-6">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      Update Theater Info
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheaterDashboard;