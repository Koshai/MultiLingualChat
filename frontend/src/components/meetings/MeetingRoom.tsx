import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMeetingStore } from '@/stores/meeting-store'
import { useAuthStore } from '@/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { VideoTile } from './VideoTile'
import { apiService } from '@/services/api'
import { SUPPORTED_LANGUAGES } from '@/types'
import toast from 'react-hot-toast'

export function MeetingRoom() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    currentMeeting,
    participants,
    messages,
    transcriptions,
    mediaSettings,
    localStream,
    remoteStreams,
    isConnected,
    isTranscribing,
    transcriptionLanguage,
    joinMeeting,
    leaveMeeting,
    sendMessage,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    startTyping,
    stopTyping,
    setCurrentMeeting,
    setTranscriptionLanguage,
    initializeWebRTC,
    setupPeerConnection,
    startTranscription,
    stopTranscription
  } = useMeetingStore()

  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [showTranscriptions, setShowTranscriptions] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const loadMeetingAndJoin = async () => {
      if (!meetingId) return

      try {
        // First fetch meeting details
        const response = await apiService.getMeeting(meetingId)
        if (response.success && response.data) {
          setCurrentMeeting(response.data)

          // Then join via socket if connected
          if (isConnected) {
            joinMeeting(meetingId)

            // Initialize WebRTC after joining
            try {
              await initializeWebRTC()
              console.log('✅ WebRTC initialized for meeting')
            } catch (error) {
              console.error('Failed to initialize WebRTC:', error)
            }
          }
        } else {
          console.error('Failed to load meeting:', response.error)
          toast.error('Meeting not found')
          navigate('/meetings')
        }
      } catch (error) {
        console.error('Error loading meeting:', error)
        toast.error('Failed to load meeting')
        navigate('/meetings')
      }
    }

    loadMeetingAndJoin()

    // Handle browser close/refresh - clean up meeting
    const handleBeforeUnload = () => {
      if (currentMeeting) {
        leaveMeeting()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (currentMeeting) {
        leaveMeeting()
      }
    }
  }, [meetingId, isConnected])

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Set up peer connections when participants join
  useEffect(() => {
    const setupConnections = async () => {
      for (const participant of participants) {
        if (participant.userId !== user?.id && !remoteStreams.has(participant.userId)) {
          console.log('Setting up peer connection for:', participant.userId)
          await setupPeerConnection(participant.userId)
        }
      }
    }

    if (participants.length > 0) {
      setupConnections()
    }
  }, [participants])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      sendMessage(newMessage.trim())
      setNewMessage('')
      handleStopTyping()
    }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)

    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      startTyping()
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 1000)
  }

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false)
      stopTyping()
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleLeaveMeeting = () => {
    leaveMeeting()
    setCurrentMeeting(null) // Clear meeting state immediately
    navigate('/meetings')
    toast.success('Left meeting')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Connecting to meeting...</p>
        </div>
      </div>
    )
  }

  if (!currentMeeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading meeting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-xl font-semibold">{currentMeeting.title}</h1>
          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
            LIVE
          </span>
          <span className="text-gray-300 text-sm">
            {participants.filter(p => p.userId !== user?.id).length + 1} participant{participants.filter(p => p.userId !== user?.id).length + 1 !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTranscriptions(!showTranscriptions)}
            className={`px-3 py-2 rounded text-sm ${
              showTranscriptions
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Transcriptions
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-3 py-2 rounded text-sm ${
              showChat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Chat
          </button>
          <button
            onClick={handleLeaveMeeting}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
            {/* Local Video (Self) */}
            <VideoTile
              stream={localStream || undefined}
              displayName={user?.displayName || user?.username || 'You'}
              isMuted={!mediaSettings.audioEnabled}
              isVideoOff={!mediaSettings.videoEnabled}
              isLocal={true}
            />

            {/* Remote Participant Videos */}
            {participants.filter(p => p.userId !== user?.id).map((participant) => (
              <VideoTile
                key={participant.id}
                stream={remoteStreams.get(participant.userId)}
                displayName={participant.user?.displayName || participant.user?.username || 'Guest'}
                isMuted={!participant.audioEnabled}
                isVideoOff={!participant.videoEnabled}
                isLocal={false}
              />
            ))}

            {/* Empty slots for additional participants */}
            {Array.from({ length: Math.max(0, 8 - participants.filter(p => p.userId !== user?.id).length - 1) }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Waiting for participants...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        {(showChat || showTranscriptions) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Panel Tabs */}
            <div className="flex bg-gray-700">
              {showChat && (
                <button
                  onClick={() => setShowTranscriptions(false)}
                  className={`flex-1 px-4 py-3 text-sm ${
                    !showTranscriptions ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Chat ({messages.length})
                </button>
              )}
              {showTranscriptions && (
                <button
                  onClick={() => setShowTranscriptions(true)}
                  className={`flex-1 px-4 py-3 text-sm ${
                    showTranscriptions ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Live Captions
                </button>
              )}
            </div>

            {/* Chat Panel */}
            {showChat && !showTranscriptions && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="flex space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {message.user?.displayName?.charAt(0) || message.user?.username?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white text-sm font-medium">
                            {message.user?.displayName || message.user?.username}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm break-words">{message.content}</p>
                        {message.translations && message.translations.length > 0 && (
                          <div className="mt-2 p-2 bg-gray-700 rounded text-xs">
                            <span className="text-gray-400">Translated:</span>
                            {message.translations.map((translation) => (
                              <p key={translation.id} className="text-gray-300 mt-1">
                                <span className="text-blue-400">[{translation.targetLanguage.toUpperCase()}]</span> {translation.translatedContent}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* Transcriptions Panel */}
            {showTranscriptions && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-center text-gray-400 text-sm mb-4">
                  Live captions with real-time translation
                </div>
                {transcriptions.map((transcription) => (
                  <div key={transcription.id} className="p-3 bg-gray-700 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-blue-400 text-sm font-medium">
                        {transcription.displayName || transcription.username || `User ${transcription.userId.slice(-4)}`}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {transcription.language.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatTime(transcription.timestamp)}
                      </span>
                    </div>

                    {/* Translated English text (main display) */}
                    <p className="text-white text-sm font-medium">{transcription.text}</p>

                    {/* Original text if different from English */}
                    {transcription.originalText && transcription.originalText !== transcription.text && (
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
                        <span className="text-gray-400">Original ({transcription.language}):</span>
                        <p className="text-gray-300 mt-1">{transcription.originalText}</p>
                      </div>
                    )}
                  </div>
                ))}
                {transcriptions.length === 0 && (
                  <div className="text-center text-gray-500 text-sm">
                    No transcriptions yet. Start speaking to see live captions.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center space-x-4 border-t border-gray-700">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${
            mediaSettings.audioEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={mediaSettings.audioEnabled ? 'Mute' : 'Unmute'}
        >
          {mediaSettings.audioEnabled ? '🎤' : '🔇'}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            mediaSettings.videoEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={mediaSettings.videoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {mediaSettings.videoEnabled ? '📹' : '📷'}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full ${
            mediaSettings.screenSharing
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={mediaSettings.screenSharing ? 'Stop sharing' : 'Share screen'}
        >
          {mediaSettings.screenSharing ? '🛑' : '🖥️'}
        </button>

        <button
          onClick={() => isTranscribing ? stopTranscription() : startTranscription()}
          className={`p-3 rounded-full ${
            isTranscribing
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isTranscribing ? 'Stop transcription' : 'Start live transcription'}
        >
          {isTranscribing ? '⏸️' : '📝'}
        </button>

        {/* Language Selector for Transcription */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            title="Transcription language"
          >
            🌐
          </button>

          {showLanguageSelector && (
            <div className="absolute bottom-full mb-2 right-0 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-96 overflow-y-auto">
              <div className="p-2">
                <div className="text-xs text-gray-400 px-2 py-1 mb-1">Transcription Language</div>

                {/* Auto-detect option */}
                <button
                  onClick={() => {
                    setTranscriptionLanguage(null)
                    setShowLanguageSelector(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    transcriptionLanguage === null
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">🔍</span>
                  Auto-detect
                </button>

                <div className="border-t border-gray-700 my-1"></div>

                {/* Language options */}
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setTranscriptionLanguage(lang.code)
                      setShowLanguageSelector(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      transcriptionLanguage === lang.code
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1"></div>

        <button
          onClick={handleLeaveMeeting}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Leave Meeting
        </button>
      </div>
    </div>
  )
}