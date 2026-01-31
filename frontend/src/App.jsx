import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Booking from './pages/Booking'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import TheaterManagement from './pages/admin/TheaterManagement'
import TheaterLogin from './pages/TheaterLogin'
import TheaterRegister from './pages/TheaterRegister'
import TheaterDashboard from './pages/theater-admin/TheaterDashboard'
import CreateEvent from './pages/theater-admin/CreateEvent'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import TheaterAdminRoute from './components/TheaterAdminRoute'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-gray-900/95"></div>
        <img 
          src="https://images.unsplash.com/photo-1489599904472-84978f312f2e?w=1920&h=1080&fit=crop&crop=center"
          alt="Theater background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-gray-900/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl min-h-[calc(100vh-200px)]">
            <div className="p-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                
                {/* Protected Routes */}
                <Route path="/booking/:eventId" element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/theaters" element={
                  <AdminRoute>
                    <TheaterManagement />
                  </AdminRoute>
                } />
                
                {/* Theater Admin Routes */}
                <Route path="/theater-login" element={<TheaterLogin />} />
                <Route path="/theater-register" element={<TheaterRegister />} />
                <Route path="/theater-admin/dashboard" element={
                  <TheaterAdminRoute>
                    <TheaterDashboard />
                  </TheaterAdminRoute>
                } />
                <Route path="/theater-admin/create-event" element={
                  <TheaterAdminRoute>
                    <CreateEvent />
                  </TheaterAdminRoute>
                } />
              </Routes>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App