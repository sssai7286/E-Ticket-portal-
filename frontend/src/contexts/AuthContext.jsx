import { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      }
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      }
    case 'AUTH_ERROR':
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set axios default header
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [state.token])

  // Load user on app start
  useEffect(() => {
    const loadUserOnStart = async () => {
      if (state.token) {
        try {
          await loadUser()
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR' })
        }
      } else {
        dispatch({ type: 'AUTH_ERROR' })
      }
    }
    
    loadUserOnStart()
  }, [])

  const loadUser = async () => {
    try {
      const response = await axios.get('/api/auth/profile')
      dispatch({ type: 'LOAD_USER', payload: response.data.user })
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' })
    }
  }

  const login = async (email, password, role = 'user') => {
    try {
      const response = await axios.post('/api/auth/login', { email, password, role })
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData)
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  const value = {
    ...state,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext };
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}