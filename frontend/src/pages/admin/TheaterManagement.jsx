import { useState, useEffect } from 'react';

const TheaterManagement = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTheaters();
  }, [activeTab]);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'pending' ? '/api/theater-admin/pending' : '/api/theater-admin/all';
      const params = activeTab !== 'pending' ? `?status=${activeTab}` : '';
      
      const response = await fetch(`${endpoint}${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setTheaters(data.theaters);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch theaters');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (theaterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/theater-admin/${theaterId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchTheaters();
        setShowModal(false);
        setSelectedTheater(null);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to approve theater');
    }
  };

  const handleReject = async (theaterId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/theater-admin/${theaterId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        fetchTheaters();
        setShowModal(false);
        setSelectedTheater(null);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to reject theater');
    }
  };

  const handleToggleStatus = async (theaterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/theater-admin/${theaterId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchTheaters();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to toggle theater status');
    }
  };

  const openTheaterDetails = (theater) => {
    setSelectedTheater(theater);
    setShowModal(true);
  };

  const getStatusBadge = (theater) => {
    if (!theater.isApproved) {
      return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
    if (!theater.isActive) {
      return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Inactive</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Theater Management</h1>
          <p className="text-gray-600">Manage theater registrations and approvals</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['pending', 'approved', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Theaters
              </button>
            ))}
          </nav>
        </div>

        {/* Theater List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading theaters...</p>
              </div>
            ) : theaters.length > 0 ? (
              <div className="space-y-4">
                {theaters.map((theater) => (
                  <div key={theater._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{theater.name}</h3>
                          {getStatusBadge(theater)}
                        </div>
                        <p className="text-gray-600 mt-1">{theater.description}</p>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-gray-500">
                          <span>Owner: {theater.owner?.name}</span>
                          <span>Email: {theater.owner?.email}</span>
                          <span>Location: {theater.address?.city}, {theater.address?.state}</span>
                          <span>Screens: {theater.screens?.length || 0}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <span>Registered: {new Date(theater.registrationDate).toLocaleDateString()}</span>
                          {theater.approvedAt && (
                            <span className="ml-4">
                              Approved: {new Date(theater.approvedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => openTheaterDetails(theater)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Details
                        </button>
                        {theater.isApproved && (
                          <button
                            onClick={() => handleToggleStatus(theater._id)}
                            className={`text-sm px-3 py-1 rounded ${
                              theater.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {theater.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No {activeTab} theaters found.
              </p>
            )}
          </div>
        </div>

        {/* Theater Details Modal */}
        {showModal && selectedTheater && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Theater Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedTheater.name}</p>
                    <p><strong>Description:</strong> {selectedTheater.description || 'N/A'}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedTheater)}</p>
                    <p><strong>Registration Date:</strong> {new Date(selectedTheater.registrationDate).toLocaleDateString()}</p>
                    {selectedTheater.approvedAt && (
                      <p><strong>Approved Date:</strong> {new Date(selectedTheater.approvedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Owner Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedTheater.owner?.name}</p>
                    <p><strong>Email:</strong> {selectedTheater.owner?.email}</p>
                    <p><strong>Mobile:</strong> {selectedTheater.owner?.mobile}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Street:</strong> {selectedTheater.address?.street}</p>
                    <p><strong>City:</strong> {selectedTheater.address?.city}</p>
                    <p><strong>State:</strong> {selectedTheater.address?.state}</p>
                    <p><strong>Zip Code:</strong> {selectedTheater.address?.zipCode}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Phone:</strong> {selectedTheater.contact?.phone}</p>
                    <p><strong>Email:</strong> {selectedTheater.contact?.email}</p>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-2">Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTheater.facilities?.length > 0 ? (
                      selectedTheater.facilities.map((facility) => (
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
                  <h4 className="font-medium text-gray-900 mb-2">Screens</h4>
                  <div className="space-y-2">
                    {selectedTheater.screens?.map((screen, index) => (
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
              </div>

              {!selectedTheater.isApproved && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleReject(selectedTheater._id, 'Theater registration rejected by admin')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedTheater._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheaterManagement;