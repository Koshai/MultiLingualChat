import { Link } from 'react-router-dom'
import { MessageSquare, Users, Globe, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { SUPPORTED_LANGUAGES } from '@/types'

export function HomePage() {
  const { user } = useAuthStore()

  const stats = [
    { name: 'Active Rooms', value: '12', icon: MessageSquare },
    { name: 'Online Users', value: '45', icon: Users },
    { name: 'Languages', value: SUPPORTED_LANGUAGES.length.toString(), icon: Globe },
    { name: 'Messages Today', value: '1,234', icon: TrendingUp },
  ]

  const popularRooms = [
    { id: '1', name: 'General Chat', participants: 24, languages: ['en', 'es', 'fr'] },
    { id: '2', name: 'Language Learning', participants: 18, languages: ['en', 'ja', 'ko'] },
    { id: '3', name: 'Tech Talk', participants: 15, languages: ['en', 'de', 'ru'] },
    { id: '4', name: 'Cultural Exchange', participants: 12, languages: ['en', 'zh', 'ar'] },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.displayName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Connect with people around the world and break down language barriers.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Rooms */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Popular Rooms</h2>
            <Link
              to="/rooms"
              className="text-primary-600 hover:text-primary-500 font-medium text-sm"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {popularRooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{room.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {room.participants} participants
                    </span>
                    <div className="flex space-x-1">
                      {room.languages.map((lang) => {
                        const language = SUPPORTED_LANGUAGES.find(l => l.code === lang)
                        return language ? (
                          <span key={lang} className="text-sm">
                            {language.flag}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/room/${room.id}`}
                  className="btn-primary btn-sm"
                >
                  Join
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>

          <div className="space-y-4">
            <Link
              to="/rooms"
              className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors group"
            >
              <MessageSquare className="w-8 h-8 text-primary-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-700">
                  Browse Chat Rooms
                </h3>
                <p className="text-sm text-gray-600">
                  Find rooms that match your interests
                </p>
              </div>
            </Link>

            <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group w-full text-left">
              <Users className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-green-700">
                  Create New Room
                </h3>
                <p className="text-sm text-gray-600">
                  Start your own conversation
                </p>
              </div>
            </button>

            <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group w-full text-left">
              <Globe className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-purple-700">
                  Language Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Update your preferred language
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Language Support */}
      <div className="card p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Supported Languages</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {SUPPORTED_LANGUAGES.map((language) => (
            <div
              key={language.code}
              className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-2xl">{language.flag}</span>
              <div>
                <p className="font-medium text-gray-900 text-sm">{language.name}</p>
                <p className="text-xs text-gray-600 uppercase">{language.code}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}