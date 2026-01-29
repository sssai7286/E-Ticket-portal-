import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { User, Shield } from 'lucide-react'

export default function Register() {
  const [loading, setLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { role: 'user' }
  })

  const password = watch('password')
  const selectedRole = watch('role')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await registerUser(data)
      if (result.success) {
        toast.success('Registration successful!')
        navigate(data.role === 'admin' ? '/admin' : '/')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Register as
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedRole === 'user' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}>
              <input
                type="radio"
                value="user"
                {...register('role')}
                className="sr-only"
              />
              <User className="w-5 h-5 mr-2 text-blue-600" />
              <span className="font-medium">User</span>
            </label>
            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedRole === 'admin' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}>
              <input
                type="radio"
                value="admin"
                {...register('role')}
                className="sr-only"
              />
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              <span className="font-medium">Admin</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            {...register('name', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: 'Name can only contain letters and spaces'
              },
              validate: value => {
                const trimmed = value.trim();
                if (trimmed.length < 2) return 'Name must be at least 2 characters';
                if (trimmed !== value) return 'Name cannot have leading or trailing spaces';
                return true;
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                message: 'Please enter a valid email address (e.g., user@example.com)'
              },
              maxLength: {
                value: 254,
                message: 'Email address is too long'
              },
              validate: value => {
                const trimmed = value.toLowerCase().trim();
                if (trimmed !== value.toLowerCase()) return 'Email cannot have spaces';
                if (trimmed.split('@').length !== 2) return 'Email must contain exactly one @ symbol';
                const [local, domain] = trimmed.split('@');
                if (local.length === 0) return 'Email must have a username before @';
                if (domain.length === 0) return 'Email must have a domain after @';
                if (!domain.includes('.')) return 'Email domain must contain a dot';
                return true;
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email (e.g., user@example.com)"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            {...register('mobile', { 
              required: 'Mobile number is required',
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)'
              },
              validate: value => {
                const trimmed = value.trim();
                if (trimmed !== value) return 'Mobile number cannot have spaces';
                if (!/^\d+$/.test(trimmed)) return 'Mobile number can only contain digits';
                if (trimmed.length !== 10) return 'Mobile number must be exactly 10 digits';
                if (!/^[6-9]/.test(trimmed)) return 'Indian mobile numbers must start with 6, 7, 8, or 9';
                return true;
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter 10-digit mobile number (e.g., 9876543210)"
            maxLength="10"
          />
          {errors.mobile && (
            <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              },
              maxLength: {
                value: 128,
                message: 'Password cannot exceed 128 characters'
              },
              validate: value => {
                if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
                if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
                if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
                return true;
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password (min 6 chars, include A-Z, a-z, 0-9)"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            Password must contain: uppercase, lowercase, and number
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : `Create ${selectedRole === 'admin' ? 'Admin' : 'User'} Account`}
        </button>
      </form>

      <p className="text-center mt-4 text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  )
}