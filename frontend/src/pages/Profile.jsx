import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

// Ensure axios base URL is set
axios.defaults.baseURL = axios.defaults.baseURL || 'http://localhost:5000'

export default function Profile() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingBooking, setCancellingBooking] = useState(null)
  const [downloadingTicket, setDownloadingTicket] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/bookings')
      setBookings(response.data.bookings)
    } catch (error) {
      setError('Failed to fetch bookings')
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return
    }

    try {
      setCancellingBooking(bookingId)
      const response = await axios.put(`/api/bookings/${bookingId}/cancel`)
      
      if (response.data.success) {
        // Update the booking in the local state
        setBookings(bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'CANCELLED' }
            : booking
        ))
        alert('Booking cancelled successfully')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancellingBooking(null)
    }
  }

  const handleDownloadTicket = async (bookingId) => {
    try {
      setDownloadingTicket(bookingId)
      const response = await axios.get(`/api/bookings/${bookingId}/download`)
      
      if (response.data.success) {
        // Create a downloadable file with ticket data
        const ticketData = response.data.ticket
        const ticketContent = `
TICKET DETAILS
==============
Booking ID: ${ticketData.bookingId}
Event: ${ticketData.eventTitle}
Date: ${new Date(ticketData.eventDate).toLocaleString()}
Venue: ${ticketData.venue}
Customer: ${ticketData.customerName}
Email: ${ticketData.customerEmail}

SEATS:
${ticketData.seats.map(seat => `${seat.row}${seat.number} (${seat.category}) - ₹${seat.price}`).join('\n')}

Total Amount: ₹${ticketData.totalAmount}
Booking Date: ${new Date(ticketData.bookingDate).toLocaleString()}

Thank you for booking with us!
        `
        
        const blob = new Blob([ticketContent], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ticket-${ticketData.bookingId}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to download ticket')
    } finally {
      setDownloadingTicket(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatVenue = (venue) => {
    if (typeof venue === 'string') {
      return venue
    }
    return venue?.name ? `${venue.name}, ${venue.city}` : 'Venue not specified'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600 bg-green-100'
      case 'CANCELLED':
        return 'text-red-600 bg-red-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'REFUNDED':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const canCancelBooking = (booking) => {
    if (booking.status !== 'CONFIRMED') return false
    
    const eventTime = new Date(booking.event.dateTime)
    const now = new Date()
    const timeDiff = eventTime.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)
    
    return hoursDiff >= 24
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      
      {/* User Information */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile</label>
            <p className="mt-1 text-sm text-gray-900">{user?.mobile}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Booking History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Booking History</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.event.title}</h3>
                    <p className="text-gray-600">Booking ID: {booking.bookingId}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Event Date</p>
                    <p className="font-medium">{formatDate(booking.event.dateTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Venue</p>
                    <p className="font-medium">{formatVenue(booking.event.venue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seats</p>
                    <p className="font-medium">
                      {booking.seats.map(seat => `${seat.row}${seat.number}`).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium">₹{booking.totalAmount}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleDownloadTicket(booking._id)}
                      disabled={downloadingTicket === booking._id}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {downloadingTicket === booking._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Ticket
                        </>
                      )}
                    </button>
                  )}

                  {canCancelBooking(booking) && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingBooking === booking._id}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {cancellingBooking === booking._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Booking
                        </>
                      )}
                    </button>
                  )}

                  {booking.status === 'CANCELLED' && (
                    <span className="text-gray-500 px-4 py-2">
                      Booking cancelled
                    </span>
                  )}
                </div>

                {canCancelBooking(booking) && (
                  <p className="text-xs text-gray-500 mt-2">
                    * Bookings can be cancelled up to 24 hours before the event
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}