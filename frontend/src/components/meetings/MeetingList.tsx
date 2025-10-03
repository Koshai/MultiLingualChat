import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMeetingStore } from '@/stores/meeting-store'
import { useAuthStore } from '@/stores/auth-store'
import { Meeting, CreateMeetingRequest } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiService } from '@/services/api'
import toast from 'react-hot-toast'

export function MeetingList() {
  const { user } = useAuthStore()
  const { meetings, isLoading, setMeetings } = useMeetingStore()
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newMeeting, setNewMeeting] = useState<CreateMeetingRequest>({
    title: '',
    description: '',
    isPublic: true,
    maxParticipants: 10,
    language: 'en'
  })

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
        setShowCreateForm(false)

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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meetings</h1>
          <p className="text-gray-600">
            Manage your video conferences with real-time translation
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create Meeting
        </button>
      </div>

      {/* Create Meeting Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Meeting</h2>

            <div className="space-y-4">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newMeeting.isPublic}
                  onChange={(e) => setNewMeeting({ ...newMeeting, isPublic: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Public meeting (anyone can join with link)
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createMeeting}
                disabled={isCreating || !newMeeting.title.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Start Instant Meeting</h3>
          <p className="text-blue-700 mb-4 text-sm">Jump into a meeting right now</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Now
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Schedule Meeting</h3>
          <p className="text-green-700 mb-4 text-sm">Plan a meeting for later</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Schedule
          </button>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Join Meeting</h3>
          <p className="text-purple-700 mb-4 text-sm">Enter meeting ID or link</p>
          <input
            type="text"
            placeholder="Meeting ID"
            className="w-full px-3 py-2 border border-purple-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Meetings List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Meetings</h2>
        </div>

        {meetings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
            <p className="text-gray-500 mb-4">Create your first meeting to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Meeting
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                      {!meeting.isPublic && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                          Private
                        </span>
                      )}
                    </div>

                    {meeting.description && (
                      <p className="text-gray-600 mb-3">{meeting.description}</p>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <span className="mr-1">👥</span>
                        {meeting.participantCount || 0}/{meeting.maxParticipants} participants
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">🌍</span>
                        {meeting.language.toUpperCase()}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">📅</span>
                        {formatDateTime(meeting.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">👑</span>
                        {meeting.createdBy === user?.id ? 'Host' : 'Participant'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3 ml-6">
                    {meeting.status === 'active' && (
                      <span className="flex items-center text-green-600 text-sm font-medium mr-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Live
                      </span>
                    )}

                    <Link
                      to={`/meeting/${meeting.id}`}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      {meeting.status === 'active' ? 'Join' : 'Start'}
                    </Link>

                    <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                      ⋯
                    </button>
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