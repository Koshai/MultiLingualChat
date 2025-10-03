import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMeetingStore } from '@/stores/meeting-store'
import { useAuthStore } from '@/stores/auth-store'
import { Meeting, CreateMeetingRequest } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiService } from '@/services/api'
import toast from 'react-hot-toast'

export function Dashboard() {
  const { user } = useAuthStore()
  const { meetings, isLoading, setMeetings } = useMeetingStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newMeeting, setNewMeeting] = useState<CreateMeetingRequest>({
    title: '',
    description: '',
    isPublic: true,
    maxParticipants: 10,
    language: 'en'
  })

  // Load meetings on component mount
  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = async () => {
    try {
      const response = await apiService.getMeetings()
      if (response.success && response.data) {
        setMeetings(response.data)
      } else {
        console.error('Failed to load meetings:', response.error)
        toast.error(response.error || 'Failed to load meetings')
        // Fallback to empty array
        setMeetings([])
      }
    } catch (error) {
      console.error('Failed to load meetings:', error)
      toast.error('Failed to load meetings')
      setMeetings([])
    }
  }

  const createMeeting = async () => {
    if (!newMeeting.title.trim()) {
      toast.error('Meeting title is required')
      return
    }

    setIsCreating(true)
    try {
      const response = await apiService.createMeeting(newMeeting)

      if (response.success && response.data) {
        // Add the new meeting to the list
        const updatedMeetings = [...meetings, response.data]
        setMeetings(updatedMeetings)

        // Reset form
        setNewMeeting({
          title: '',
          description: '',
          isPublic: true,
          maxParticipants: 10,
          language: 'en'
        })

        toast.success('Meeting created successfully!')
      } else {
        console.error('Failed to create meeting:', response.error)
        toast.error(response.error || 'Failed to create meeting')
      }
    } catch (error) {
      console.error('Failed to create meeting:', error)
      toast.error('Failed to create meeting')
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'ended':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.displayName || user?.username}! 👋
        </h1>
        <p className="text-gray-600">
          Start or join video meetings with real-time multilingual translation
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🎥 Start Meeting</h3>
          <p className="text-blue-700 mb-4">Create a new video conference with translation</p>
          <Link
            to="/meetings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Meeting
          </Link>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">🌍 Translation Ready</h3>
          <p className="text-green-700 mb-4">Support for 10+ languages with real-time translation</p>
          <div className="flex space-x-1">
            <span>🇺🇸</span>
            <span>🇪🇸</span>
            <span>🇫🇷</span>
            <span>🇩🇪</span>
            <span>🇨🇳</span>
            <span>🇯🇵</span>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">📊 Meeting Analytics</h3>
          <p className="text-purple-700 mb-4">Track your meeting participation and translations</p>
          <div className="text-purple-600 font-medium">Coming Soon</div>
        </div>
      </div>

      {/* Create Meeting Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Meeting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              placeholder="e.g., Team Standup, Project Review"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Participants
            </label>
            <select
              value={newMeeting.maxParticipants}
              onChange={(e) => setNewMeeting({ ...newMeeting, maxParticipants: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 participants</option>
              <option value={10}>10 participants</option>
              <option value={25}>25 participants</option>
              <option value={50}>50 participants</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={newMeeting.description}
              onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              placeholder="Brief description of the meeting purpose"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={createMeeting}
            disabled={isCreating || !newMeeting.title.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Creating...' : 'Create Meeting'}
          </button>
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Meetings</h2>

        {meetings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No meetings yet. Create your first meeting!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>

                    {meeting.description && (
                      <p className="text-gray-600 mb-2">{meeting.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👥 {meeting.participantCount || 0} participants</span>
                      <span>🌍 {meeting.language.toUpperCase()}</span>
                      <span>👑 {meeting.createdBy === user?.id ? 'Host' : 'Participant'}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/meeting/${meeting.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {meeting.status === 'active' ? 'Join' : 'Start'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}