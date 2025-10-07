import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { io, Socket } from 'socket.io-client'
import { Message, Meeting, TypingUser, MeetingParticipant, MediaSettings, WebRTCConnection, AudioTranscription } from '@/types'
import { useAuthStore } from './auth-store'
import { WebRTCService } from '@/services/webrtc-service'
import { AudioRecorder } from '@/services/audio-recorder'
import toast from 'react-hot-toast'

interface MeetingState {
  socket: Socket | null
  isConnected: boolean
  currentMeeting: Meeting | null
  messages: Message[]
  meetings: Meeting[]
  participants: MeetingParticipant[]
  typingUsers: TypingUser[]
  transcriptions: AudioTranscription[]
  mediaSettings: MediaSettings
  connections: Map<string, WebRTCConnection>
  remoteStreams: Map<string, MediaStream>
  localStream: MediaStream | null
  webrtcService: WebRTCService | null
  audioRecorder: AudioRecorder | null
  isTranscribing: boolean
  isLoading: boolean
  error: string | null
}

interface MeetingActions {
  initializeSocket: () => void
  cleanup: () => void
  joinMeeting: (meetingId: string) => void
  leaveMeeting: () => void
  sendMessage: (content: string, originalLanguage?: string) => void
  startTyping: () => void
  stopTyping: () => void
  requestTranslation: (messageId: string, targetLanguage: string) => void
  loadMessages: (meetingId: string, limit?: number, offset?: number) => void
  setCurrentMeeting: (meeting: Meeting | null) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  setMeetings: (meetings: Meeting[]) => void
  setParticipants: (participants: MeetingParticipant[]) => void
  updateMediaSettings: (settings: Partial<MediaSettings>) => void
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => void
  addTranscription: (transcription: AudioTranscription) => void
  setError: (error: string | null) => void
  initializeWebRTC: () => Promise<void>
  setupPeerConnection: (userId: string) => Promise<void>
  addRemoteStream: (userId: string, stream: MediaStream) => void
  removeRemoteStream: (userId: string) => void
  startTranscription: () => Promise<void>
  stopTranscription: () => void
}

export const useMeetingStore = create<MeetingState & MeetingActions>()(
  subscribeWithSelector((set, get) => ({
    // State
    socket: null,
    isConnected: false,
    currentMeeting: null,
    messages: [],
    meetings: [],
    participants: [],
    typingUsers: [],
    transcriptions: [],
    mediaSettings: {
      videoEnabled: true,
      audioEnabled: true,
      screenSharing: false,
    },
    connections: new Map(),
    remoteStreams: new Map(),
    localStream: null,
    webrtcService: null,
    audioRecorder: null,
    isTranscribing: false,
    isLoading: false,
    error: null,

    // Actions
    initializeSocket: () => {
      const { token } = useAuthStore.getState()
      if (!token) return

      const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001'

      const socket = io(socketUrl, {
        auth: {
          token
        },
        transports: ['websocket']
      })

      // Connection events
      socket.on('connect', () => {
        console.log('🔗 Connected to meeting server')
        set({ isConnected: true, error: null })
        toast.success('Connected to meeting server')
      })

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from meeting server')
        set({ isConnected: false })
        toast.error('Disconnected from meeting server')
      })

      socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error)
        set({ isConnected: false, error: error.message })
        toast.error('Failed to connect to meeting server')
      })

      // User events
      socket.on('connected', (data) => {
        console.log('👤 User connected:', data.user)
      })

      // Meeting events
      socket.on('meeting_joined', (data) => {
        console.log('🎥 Joined meeting:', data.meeting.title)
        console.log('📋 Participants list:', data.participants)
        set({
          currentMeeting: data.meeting,
          participants: data.participants || [],
          isLoading: false
        })
        toast.success(`Joined ${data.meeting.title}`)
      })

      socket.on('meeting_left', (data) => {
        console.log('👋 Left meeting')
        set({
          currentMeeting: null,
          messages: [],
          participants: [],
          typingUsers: [],
          transcriptions: [],
          isLoading: false
        })
      })

      socket.on('participant_joined', (data) => {
        console.log('👥 Participant joined:', data.participant.user?.displayName)
        const participants = get().participants
        // Check if participant already exists to avoid duplicates
        const existingIndex = participants.findIndex(p => p.userId === data.participant.userId)
        if (existingIndex === -1) {
          set({ participants: [...participants, data.participant] })
          toast.success(`${data.participant.user?.displayName || 'Someone'} joined the meeting`)
        } else {
          console.log('⚠️ Participant already in list, skipping duplicate')
        }
      })

      socket.on('participant_left', (data) => {
        console.log('👋 Participant left:', data.participant.user?.displayName)
        const participants = get().participants.filter(p => p.id !== data.participant.id)
        set({ participants })
        toast(`${data.participant.user?.displayName || 'Someone'} left the meeting`)
      })

      // Media events
      socket.on('audio_enabled', (data) => {
        console.log('🎤 Audio enabled:', data.userId)
        const participants = get().participants.map(p =>
          p.userId === data.userId ? { ...p, audioEnabled: true } : p
        )
        set({ participants })
      })

      socket.on('video_enabled', (data) => {
        console.log('📹 Video enabled:', data.userId)
        const participants = get().participants.map(p =>
          p.userId === data.userId ? { ...p, videoEnabled: true } : p
        )
        set({ participants })
      })

      socket.on('audio_disabled', (data) => {
        console.log('🎤 Audio disabled:', data.userId)
        const participants = get().participants.map(p =>
          p.userId === data.userId ? { ...p, audioEnabled: false } : p
        )
        set({ participants })
      })

      socket.on('video_disabled', (data) => {
        console.log('📹 Video disabled:', data.userId)
        const participants = get().participants.map(p =>
          p.userId === data.userId ? { ...p, videoEnabled: false } : p
        )
        set({ participants })
      })

      // Message events
      socket.on('new_message', (message: Message) => {
        console.log('💬 New message:', message)
        get().addMessage(message)
      })

      socket.on('message_updated', (data) => {
        console.log('📝 Message updated:', data)
        get().updateMessage(data.messageId, data.updates)
      })

      // Transcription events
      socket.on('transcription', (transcription: AudioTranscription) => {
        console.log('🎙️ New transcription:', transcription)
        get().addTranscription(transcription)
      })

      // Translation events
      socket.on('translation_ready', (data) => {
        console.log('🌐 Translation ready:', data)
        const { messageId, targetLanguage, translatedContent } = data

        // Update message with translation
        const messages = get().messages
        const messageIndex = messages.findIndex(m => m.id === messageId)

        if (messageIndex !== -1) {
          const updatedMessages = [...messages]
          const message = updatedMessages[messageIndex]

          if (!message.translations) {
            message.translations = []
          }

          // Update or add translation
          const translationIndex = message.translations.findIndex(
            t => t.targetLanguage === targetLanguage
          )

          if (translationIndex !== -1) {
            message.translations[translationIndex].translatedContent = translatedContent
          } else {
            message.translations.push({
              id: `${messageId}-${targetLanguage}`,
              messageId,
              targetLanguage,
              translatedContent,
              createdAt: new Date().toISOString()
            })
          }

          set({ messages: updatedMessages })
        }
      })

      // Typing events
      socket.on('user_typing', (data) => {
        const { userId, username, displayName, typing } = data
        const typingUsers = get().typingUsers

        if (typing) {
          if (!typingUsers.find(u => u.userId === userId)) {
            set({
              typingUsers: [...typingUsers, { userId, username, displayName }]
            })
          }
        } else {
          set({
            typingUsers: typingUsers.filter(u => u.userId !== userId)
          })
        }
      })

      // Error events
      socket.on('meeting_error', (data) => {
        console.error('💥 Meeting error:', data)
        const errorMessage = data.error ? `${data.message}: ${data.error}` : data.message
        set({ error: errorMessage })
        toast.error(errorMessage)
      })

      set({ socket })
    },

    cleanup: () => {
      const { socket, webrtcService, audioRecorder } = get()

      // Stop audio recording
      if (audioRecorder) {
        audioRecorder.stop()
      }

      // Cleanup WebRTC
      if (webrtcService) {
        webrtcService.cleanup()
      }

      if (socket) {
        socket.disconnect()
        set({
          socket: null,
          isConnected: false,
          currentMeeting: null,
          messages: [],
          participants: [],
          typingUsers: [],
          transcriptions: [],
          webrtcService: null,
          audioRecorder: null,
          isTranscribing: false,
          localStream: null,
          remoteStreams: new Map()
        })
      }
    },

    joinMeeting: (meetingId: string) => {
      const { socket } = get()
      if (socket && socket.connected) {
        const { mediaSettings } = get()
        socket.emit('join_meeting', {
          meetingId,
          audioEnabled: mediaSettings.audioEnabled,
          videoEnabled: mediaSettings.videoEnabled
        })
        set({ isLoading: true })
      }
    },

    leaveMeeting: () => {
      const { socket, currentMeeting } = get()
      if (socket && socket.connected && currentMeeting) {
        socket.emit('leave_meeting', { meetingId: currentMeeting.id })
      }
    },

    sendMessage: (content: string, originalLanguage = 'en') => {
      const { socket, currentMeeting } = get()
      if (socket && socket.connected && currentMeeting) {
        socket.emit('send_message', {
          meetingId: currentMeeting.id,
          content,
          originalLanguage,
          messageType: 'text'
        })
      }
    },

    startTyping: () => {
      const { socket, currentMeeting } = get()
      if (socket && socket.connected && currentMeeting) {
        socket.emit('typing_start', { roomId: currentMeeting.id })
      }
    },

    stopTyping: () => {
      const { socket, currentMeeting } = get()
      if (socket && socket.connected && currentMeeting) {
        socket.emit('typing_stop', { roomId: currentMeeting.id })
      }
    },

    requestTranslation: (messageId: string, targetLanguage: string) => {
      const { socket } = get()
      if (socket && socket.connected) {
        socket.emit('request_translation', {
          messageId,
          targetLanguage
        })
      }
    },

    loadMessages: async (meetingId: string, limit = 50, offset = 0) => {
      set({ messages: [] })
    },

    setCurrentMeeting: (meeting: Meeting | null) => {
      set({ currentMeeting: meeting })
    },

    addMessage: (message: Message) => {
      const messages = get().messages
      set({ messages: [...messages, message] })
    },

    updateMessage: (messageId: string, updates: Partial<Message>) => {
      const messages = get().messages
      const updatedMessages = messages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
      set({ messages: updatedMessages })
    },

    setMeetings: (meetings: Meeting[]) => {
      set({ meetings })
    },

    setParticipants: (participants: MeetingParticipant[]) => {
      set({ participants })
    },

    updateMediaSettings: (settings: Partial<MediaSettings>) => {
      const currentSettings = get().mediaSettings
      set({ mediaSettings: { ...currentSettings, ...settings } })
    },

    toggleAudio: () => {
      const { mediaSettings, socket, currentMeeting, webrtcService } = get()
      const newAudioState = !mediaSettings.audioEnabled

      set({
        mediaSettings: {
          ...mediaSettings,
          audioEnabled: newAudioState
        }
      })

      // Toggle WebRTC audio track
      if (webrtcService) {
        webrtcService.toggleAudio(newAudioState)
      }

      if (socket && socket.connected && currentMeeting) {
        socket.emit(newAudioState ? 'enable_audio' : 'disable_audio', {
          meetingId: currentMeeting.id
        })
      }
    },

    toggleVideo: () => {
      const { mediaSettings, socket, currentMeeting, webrtcService } = get()
      const newVideoState = !mediaSettings.videoEnabled

      set({
        mediaSettings: {
          ...mediaSettings,
          videoEnabled: newVideoState
        }
      })

      // Toggle WebRTC video track
      if (webrtcService) {
        webrtcService.toggleVideo(newVideoState)
      }

      if (socket && socket.connected && currentMeeting) {
        socket.emit(newVideoState ? 'enable_video' : 'disable_video', {
          meetingId: currentMeeting.id
        })
      }
    },

    toggleScreenShare: async () => {
      const { mediaSettings, socket, currentMeeting, webrtcService } = get()
      const newScreenShareState = !mediaSettings.screenSharing

      set({
        mediaSettings: {
          ...mediaSettings,
          screenSharing: newScreenShareState
        }
      })

      // Handle screen sharing via WebRTC
      if (webrtcService && newScreenShareState) {
        try {
          const screenStream = await webrtcService.getScreenShareStream()
          await webrtcService.replaceVideoTrack(screenStream)

          // Stop screen share when user stops it from browser
          screenStream.getVideoTracks()[0].onended = () => {
            get().toggleScreenShare()
          }
        } catch (error) {
          console.error('Failed to start screen share:', error)
          toast.error('Failed to start screen sharing')
          set({
            mediaSettings: {
              ...mediaSettings,
              screenSharing: false
            }
          })
        }
      } else if (webrtcService && !newScreenShareState) {
        // Switch back to camera
        const localStream = webrtcService.getLocalStream()
        if (localStream) {
          await webrtcService.replaceVideoTrack(localStream)
        }
      }

      if (socket && socket.connected && currentMeeting) {
        socket.emit(newScreenShareState ? 'start_screen_share' : 'stop_screen_share', {
          meetingId: currentMeeting.id
        })
      }
    },

    addTranscription: (transcription: AudioTranscription) => {
      const transcriptions = get().transcriptions
      set({ transcriptions: [...transcriptions, transcription] })
    },

    setError: (error: string | null) => {
      set({ error })
    },

    // WebRTC Methods
    initializeWebRTC: async () => {
      const { socket } = get()
      if (!socket) {
        console.error('Socket not initialized')
        return
      }

      try {
        // Create WebRTC service
        const webrtcService = new WebRTCService(socket)

        // Initialize local media stream
        const localStream = await webrtcService.initializeLocalStream()

        // Set up remote stream callback
        webrtcService.onRemoteStream((userId, stream) => {
          console.log('📺 Adding remote stream for user:', userId)
          get().addRemoteStream(userId, stream)
        })

        // Set up peer disconnection callback
        webrtcService.onPeerDisconnected((userId) => {
          console.log('🔌 Peer disconnected:', userId)
          get().removeRemoteStream(userId)
        })

        set({ webrtcService, localStream })
        console.log('✅ WebRTC initialized successfully')
      } catch (error) {
        console.error('❌ Failed to initialize WebRTC:', error)
        toast.error('Failed to access camera/microphone. Please check permissions.')
        throw error
      }
    },

    setupPeerConnection: async (userId: string) => {
      const { webrtcService } = get()
      if (!webrtcService) {
        console.error('WebRTC service not initialized')
        return
      }

      try {
        console.log('📞 Setting up peer connection with user:', userId)
        await webrtcService.createOffer(userId)
      } catch (error) {
        console.error('Failed to setup peer connection:', error)
        toast.error('Failed to establish video connection')
      }
    },

    addRemoteStream: (userId: string, stream: MediaStream) => {
      const remoteStreams = new Map(get().remoteStreams)
      remoteStreams.set(userId, stream)
      set({ remoteStreams })
    },

    removeRemoteStream: (userId: string) => {
      const remoteStreams = new Map(get().remoteStreams)
      remoteStreams.delete(userId)
      set({ remoteStreams })
    },

    startTranscription: async () => {
      const { socket, currentMeeting, localStream, audioRecorder } = get()

      if (!socket || !currentMeeting) {
        console.error('Cannot start transcription: socket or meeting not available')
        return
      }

      if (!localStream) {
        console.error('Cannot start transcription: no local stream available')
        toast.error('No audio stream available for transcription')
        return
      }

      if (audioRecorder && audioRecorder.isActive()) {
        console.warn('Transcription already active')
        return
      }

      try {
        // Create audio-only stream from local stream
        const audioTracks = localStream.getAudioTracks()
        if (audioTracks.length === 0) {
          throw new Error('No audio tracks available')
        }

        const audioOnlyStream = new MediaStream(audioTracks)

        // Create audio recorder
        const recorder = new AudioRecorder(socket, currentMeeting.id)

        // Start recording with audio-only stream
        await recorder.start(audioOnlyStream)

        set({
          audioRecorder: recorder,
          isTranscribing: true
        })

        console.log('Audio transcription started')
        toast.success('Live transcription started')
      } catch (error) {
        console.error('Failed to start transcription:', error)
        toast.error('Failed to start transcription')
      }
    },

    stopTranscription: () => {
      const { audioRecorder } = get()

      if (!audioRecorder) {
        return
      }

      audioRecorder.stop()
      set({
        audioRecorder: null,
        isTranscribing: false
      })

      console.log('Audio transcription stopped')
      toast('Live transcription stopped')
    }
  }))
)