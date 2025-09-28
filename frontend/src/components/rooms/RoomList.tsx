import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Users, Globe } from 'lucide-react'
import { ChatRoom } from '@/types'

// Mock data - in real app this would come from API
const mockRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'General Chat',
    description: 'Open discussion for everyone',
    isPublic: true,
    maxParticipants: 50,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participantCount: 24
  },
  {
    id: '2',
    name: 'Language Learning',
    description: 'Practice languages with native speakers',
    isPublic: true,
    maxParticipants: 30,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participantCount: 18
  },
  {
    id: '3',
    name: 'Tech Talk',
    description: 'Discuss the latest in technology',
    isPublic: true,
    maxParticipants: 40,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participantCount: 15
  },
  {
    id: '4',
    name: 'Cultural Exchange',
    description: 'Share your culture with others',
    isPublic: true,
    maxParticipants: 35,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participantCount: 12
  },
  {
    id: '5',
    name: 'Travel Stories',
    description: 'Share your travel experiences',
    isPublic: true,
    maxParticipants: 25,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participantCount: 8
  }
]

export function RoomList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredRooms = mockRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat Rooms</h1>
          <p className="text-gray-600 mt-2">
            Join conversations with people from around the world
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Room
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {room.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {room.description}
                </p>
              </div>
              {room.isPublic && (
                <Globe className="w-5 h-5 text-green-500 ml-2" />
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{room.participantCount}/{room.maxParticipants}</span>
              </div>
              <span className="text-xs">
                {room.isPublic ? 'Public' : 'Private'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {/* Mock avatars */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-medium">
                      {String.fromCharCode(64 + i)}
                    </span>
                  </div>
                ))}
                {room.participantCount && room.participantCount > 3 && (
                  <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-gray-600 text-xs">
                      +{room.participantCount - 3}
                    </span>
                  </div>
                )}
              </div>

              <Link
                to={`/room/${room.id}`}
                className="btn-primary btn-sm"
              >
                Join Room
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No rooms found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Be the first to create a room!'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Room
            </button>
          )}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Room
            </h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Enter room name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="input w-full h-20 resize-none"
                  placeholder="Describe your room..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    placeholder="50"
                    min="2"
                    max="100"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    className="rounded"
                    defaultChecked
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    Public room
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}