import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <h3 className="text-2xl font-bold">eTicket</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your premier destination for booking movie tickets, concerts, sports events, and entertainment shows. 
                Experience seamless booking with the best seats at the best prices.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/events" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Browse Events
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-gray-300 hover:text-white transition-colors text-sm">
                    My Bookings
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Help & Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Categories</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/events?category=Movie" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link to="/events?category=Concert" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Concerts
                  </Link>
                </li>
                <li>
                  <Link to="/events?category=Sports" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Sports
                  </Link>
                </li>
                <li>
                  <Link to="/events?category=Theater" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Theater
                  </Link>
                </li>
                <li>
                  <Link to="/events?category=Comedy" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Comedy Shows
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Gift Cards
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300">Email Support</p>
                    <a 
                      href="mailto:support@eticket.com" 
                      className="text-white hover:text-blue-400 transition-colors text-sm font-medium"
                    >
                      support@eticket.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300">Customer Care</p>
                    <a 
                      href="tel:+919949219057" 
                      className="text-white hover:text-green-400 transition-colors text-sm font-medium"
                    >
                      +91 99492 19057
                    </a>
                    <p className="text-xs text-gray-400">24/7 Support Available</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300">Head Office</p>
                    <address className="text-white text-sm font-medium not-italic">
                      Guntur, Andhra Pradesh<br />
                      India - 522001
                    </address>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-400">
                © {new Date().getFullYear()} eTicket. All rights reserved. | 
                <a href="#" className="hover:text-white ml-1">Privacy Policy</a> | 
                <a href="#" className="hover:text-white ml-1">Cookie Policy</a>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Secure Payments</span>
                <div className="flex space-x-2">
                  <div className="w-8 h-5 bg-blue-600 rounded text-xs flex items-center justify-center text-white font-bold">
                    VISA
                  </div>
                  <div className="w-8 h-5 bg-red-600 rounded text-xs flex items-center justify-center text-white font-bold">
                    MC
                  </div>
                  <div className="w-8 h-5 bg-orange-600 rounded text-xs flex items-center justify-center text-white font-bold">
                    UPI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}