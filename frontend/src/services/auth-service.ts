import axios from 'axios'
import { LoginRequest, LoginResponse, User } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage')
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch (error) {
      console.error('Error parsing auth storage:', error)
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.username);
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || 'Login failed. Please try again.'
        };
      }
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  },

  async register(userData: any): Promise<LoginResponse> {
    try {
      console.log('📝 Attempting registration for:', userData.username);
      const response = await api.post('/auth/register', userData);
      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message || 'Registration failed. Please try again.'
        };
      }
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/me')
      return response.data.success ? response.data.data : null
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  async updateProfile(updates: Partial<User>): Promise<boolean> {
    try {
      const response = await api.patch('/me', updates)
      return response.data.success
    } catch (error) {
      console.error('Update profile error:', error)
      return false
    }
  }
}