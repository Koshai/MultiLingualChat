import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { io, Socket } from 'socket.io-client'
import { Message, ChatRoom, TypingUser, RoomParticipant } from '@/types'
import { useAuthStore } from './auth-store'
import toast from 'react-hot-toast'

interface ChatState {
  socket: Socket | null
  isConnected: boolean
  currentRoom: ChatRoom | null
  messages: Message[]
  rooms: ChatRoom[]
  participants: RoomParticipant[]
  typingUsers: TypingUser[]
  isLoading: boolean
  error: string | null
}

interface ChatActions {
  initializeSocket: () => void
  cleanup: () => void
  joinRoom: (roomId: string) => void
  leaveRoom: () => void
  sendMessage: (content: string, originalLanguage?: string) => void
  startTyping: () => void
  stopTyping: () => void
  requestTranslation: (messageId: string, targetLanguage: string) => void
  loadMessages: (roomId: string, limit?: number, offset?: number) => void
  setCurrentRoom: (room: ChatRoom | null) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  setRooms: (rooms: ChatRoom[]) => void
  setParticipants: (participants: RoomParticipant[]) => void
  setError: (error: string | null) => void
}

export const useChatStore = create<ChatState & ChatActions>()(
  subscribeWithSelector((set, get) => ({
    // State
    socket: null,
    isConnected: false,
    currentRoom: null,
    messages: [],
    rooms: [],
    participants: [],
    typingUsers: [],
    isLoading: false,
    error: null,

    // Actions
    initializeSocket: () => {
      const { token } = useAuthStore.getState()
      if (!token) return

      // Use VITE_WS_URL if set, otherwise connect to same origin as frontend
      // This allows Ngrok to work (HTTPS frontend connects via HTTPS WebSocket)
      const socketUrl = import.meta.env.VITE_WS_URL || window.location.origin

      const socket = io(socketUrl, {
        auth: {
          token
        },
        transports: ['websocket'],
        path: '/socket.io/'
      })

      // Connection events
      socket.on('connect', () => {
        console.log('🔗 Connected to chat server')
        set({ isConnected: true, error: null })
        toast.success('Connected to chat server')
      })

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from chat server')
        set({ isConnected: false })
        toast.error('Disconnected from chat server')
      })

      socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error)
        set({ isConnected: false, error: error.message })
        toast.error('Failed to connect to chat server')
      })

      // User events
      socket.on('connected', (data) => {
        console.log('👤 User connected:', data.user)
      })

      // Room events
      socket.on('room_joined', (data) => {
        console.log('🏠 Joined room:', data.room.name)
        set({ currentRoom: data.room })
        toast.success(`Joined ${data.room.name}`)
      })

      socket.on('room_left', (data) => {
        console.log('👋 Left room')
        set({ currentRoom: null, messages: [], participants: [], typingUsers: [] })
      })

      socket.on('user_joined', (data) => {
        console.log('👥 User joined:', data.user.displayName)
        toast.success(`${data.user.displayName} joined the room`)
      })

      socket.on('user_left', (data) => {
        console.log('👋 User left:', data.user.displayName)
        toast(`${data.user.displayName} left the room`)
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

      socket.on('translation_pending', (data) => {
        console.log('⏳ Translation pending:', data)
      })

      // Typing events
      socket.on('user_typing', (data) => {
        const { userId, username, displayName, typing } = data
        const typingUsers = get().typingUsers

        if (typing) {
          // Add user to typing list if not already there
          if (!typingUsers.find(u => u.userId === userId)) {
            set({
              typingUsers: [...typingUsers, { userId, username, displayName }]
            })
          }
        } else {
          // Remove user from typing list
          set({
            typingUsers: typingUsers.filter(u => u.userId !== userId)
          })
        }
      })

      // Error events
      socket.on('error', (data) => {
        console.error('💥 Socket error:', data)
        set({ error: data.message })
        toast.error(data.message)
      })

      set({ socket })
    },

    cleanup: () => {
      const { socket } = get()
      if (socket) {
        socket.disconnect()
        set({
          socket: null,
          isConnected: false,
          currentRoom: null,
          messages: [],
          participants: [],
          typingUsers: []
        })
      }
    },

    joinRoom: (roomId: string) => {
      const { socket } = get()
      if (socket && socket.connected) {
        socket.emit('join_room', { roomId })
        set({ isLoading: true })
      }
    },

    leaveRoom: () => {
      const { socket, currentRoom } = get()
      if (socket && socket.connected && currentRoom) {
        socket.emit('leave_room', { roomId: currentRoom.id })
      }
    },

    sendMessage: (content: string, originalLanguage = 'en') => {
      const { socket, currentRoom } = get()
      if (socket && socket.connected && currentRoom) {
        socket.emit('send_message', {
          roomId: currentRoom.id,
          content,
          originalLanguage,
          messageType: 'text'
        })
      }
    },

    startTyping: () => {
      const { socket, currentRoom } = get()
      if (socket && socket.connected && currentRoom) {
        socket.emit('typing_start', { roomId: currentRoom.id })
      }
    },

    stopTyping: () => {
      const { socket, currentRoom } = get()
      if (socket && socket.connected && currentRoom) {
        socket.emit('typing_stop', { roomId: currentRoom.id })
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

    loadMessages: async (roomId: string, limit = 50, offset = 0) => {
      // This would typically make an API call to load messages
      // For now, we'll just clear messages when joining a room
      set({ messages: [] })
    },

    setCurrentRoom: (room: ChatRoom | null) => {
      set({ currentRoom: room })
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

    setRooms: (rooms: ChatRoom[]) => {
      set({ rooms })
    },

    setParticipants: (participants: RoomParticipant[]) => {
      set({ participants })
    },

    setError: (error: string | null) => {
      set({ error })
    }
  }))
)