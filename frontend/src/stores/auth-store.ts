import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginRequest } from '@/types'
import { authService } from '@/services/auth-service'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<boolean>
  logout: () => void
  register: (userData: any) => Promise<boolean>
  checkAuth: () => void
  setUser: (user: User) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authService.login(credentials)

          if (response.success && response.data) {
            const { user, token } = response.data

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })

            toast.success(`Welcome back, ${user.displayName}!`)
            return true
          } else {
            const errorMessage = response.error || 'Login failed'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            return false
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed'
          set({ error: errorMessage, isLoading: false })
          toast.error(errorMessage)
          return false
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authService.register(userData)

          if (response.success && response.data) {
            const { user, token } = response.data

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })

            toast.success(`Welcome, ${user.displayName}!`)
            return true
          } else {
            const errorMessage = response.error || 'Registration failed'
            set({ error: errorMessage, isLoading: false })
            toast.error(errorMessage)
            return false
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed'
          set({ error: errorMessage, isLoading: false })
          toast.error(errorMessage)
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })

        // Clear from localStorage
        localStorage.removeItem('auth-storage')
        toast.success('Logged out successfully')
      },

      checkAuth: () => {
        const { token } = get()

        if (token) {
          // Validate token (you might want to make an API call here)
          try {
            // Basic token validation - in real app, verify with server
            const payload = JSON.parse(atob(token.split('.')[1]))
            const isExpired = payload.exp * 1000 < Date.now()

            if (isExpired) {
              get().logout()
            } else {
              set({ isAuthenticated: true })
            }
          } catch (error) {
            get().logout()
          }
        }
      },

      setUser: (user: User) => {
        set({ user })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)