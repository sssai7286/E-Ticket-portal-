import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Calendar, Settings } from 'lucide-react'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">eTicket</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/events" className="text-gray-700 hover:text-blue-600 flex items-center transition-colors">
              <Calendar className="w-4 h-4 mr-1" />
              Events
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 flex items-center transition-colors">
                  <User className="w-4 h-4 mr-1" />
                  {user?.name}
                </Link>
                
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 flex items-center transition-colors">
                    <Settings className="w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
                
                {user?.role === 'theater_admin' && (
                  <Link to="/theater-admin/dashboard" className="text-gray-700 hover:text-blue-600 flex items-center transition-colors">
                    <Settings className="w-4 h-4 mr-1" />
                    Theater Admin
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 flex items-center transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="text-gray-700 hover:text-blue-600 transition-colors">
                    Login ▼
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        User Login
                      </Link>
                      <Link to="/theater-login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Theater Admin Login
                      </Link>
                    </div>
                  </div>
                </div>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}