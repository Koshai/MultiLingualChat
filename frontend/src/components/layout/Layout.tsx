import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Globe, Home, Video, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useMeetingStore } from '@/stores/meeting-store'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { isConnected } = useMeetingStore()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Meetings', href: '/meetings', icon: Video },
  ]

  const isActive = (href: string) => {
    return location.pathname === href || (href !== '/' && location.pathname.startsWith(href))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <Globe className="w-8 h-8 text-primary-600 mr-3" />
          <h1 className="text-xl font-bold text-gray-900">Multilingual Meetings</h1>
        </div>

        {/* Connection status */}
        <div className="px-6 py-2 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
            <span className="text-xs text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.displayName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.preferredLanguage?.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}