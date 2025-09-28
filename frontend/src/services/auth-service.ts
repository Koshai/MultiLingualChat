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
      // For demo purposes, we'll create a mock login
      // In a real app, this would make an API call
      const mockUser: User = {
        id: '1',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        displayName: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1),
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Mock JWT token
      const mockToken = btoa(JSON.stringify({
        userId: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      }))

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        data: {
          user: mockUser,
          token: mockToken
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'Login failed. Please try again.'
      }
    }
  },

  async register(userData: any): Promise<LoginResponse> {
    try {
      // Mock registration
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        preferredLanguage: userData.preferredLanguage || 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const mockToken = btoa(JSON.stringify({
        userId: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      }))

      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        data: {
          user: mockUser,
          token: mockToken
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      }
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