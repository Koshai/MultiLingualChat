import { useState, useEffect, useRef } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Send, Users, Languages, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useChatStore } from '@/stores/chat-store'
import { useAuthStore } from '@/stores/auth-store'
import { Message } from '@/types'
import { MessageComponent } from './MessageComponent'
import { TypingIndicator } from './TypingIndicator'

export function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>()
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { user } = useAuthStore()
  const {
    currentRoom,
    messages,
    participants,
    typingUsers,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping
  } = useChatStore()

  // Mock room data
  const mockRoom = {
    id: roomId!,
    name: 'General Chat',
    description: 'Open discussion for everyone',
    isPublic: true,
    maxParticipants: 50,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  // Mock messages for demo
  const mockMessages: Message[] = [
    {
      id: '1',
      roomId: roomId!,
      userId: 'user1',
      content: 'Hello everyone! 👋',
      originalLanguage: 'en',
      messageType: 'text',
      createdAt: new Date(Date.now() - 300000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString(),
      user: {
        id: 'user1',
        username: 'alice',
        displayName: 'Alice Cooper',
        preferredLanguage: 'en'
      }
    },
    {
      id: '2',
      roomId: roomId!,
      userId: 'user2',
      content: '¡Hola! ¿Cómo están todos?',
      originalLanguage: 'es',
      messageType: 'text',
      createdAt: new Date(Date.now() - 240000).toISOString(),
      updatedAt: new Date(Date.now() - 240000).toISOString(),
      user: {
        id: 'user2',
        username: 'carlos',
        displayName: 'Carlos Rodriguez',
        preferredLanguage: 'es'
      },
      translations: [
        {
          id: '2-en',
          messageId: '2',
          targetLanguage: 'en',
          translatedContent: 'Hello! How is everyone?',
          createdAt: new Date(Date.now() - 240000).toISOString()
        }
      ]
    },
    {
      id: '3',
      roomId: roomId!,
      userId: 'user3',
      content: 'Bonjour! Je suis nouveau ici.',
      originalLanguage: 'fr',
      messageType: 'text',
      createdAt: new Date(Date.now() - 180000).toISOString(),
      updatedAt: new Date(Date.now() - 180000).toISOString(),
      user: {
        id: 'user3',
        username: 'marie',
        displayName: 'Marie Dubois',
        preferredLanguage: 'fr'
      },
      translations: [
        {
          id: '3-en',
          messageId: '3',
          targetLanguage: 'en',
          translatedContent: 'Hello! I am new here.',
          createdAt: new Date(Date.now() - 180000).toISOString()
        }
      ]
    }
  ]

  useEffect(() => {
    if (roomId && isConnected) {
      joinRoom(roomId)
    }

    return () => {
      leaveRoom()
    }
  }, [roomId, isConnected, joinRoom, leaveRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    sendMessage(messageText, user?.preferredLanguage)
    setMessageText('')
    handleStopTyping()
  }

  const handleTyping = (text: string) => {
    setMessageText(text)

    if (text.trim() && !isTyping) {
      setIsTyping(true)
      startTyping()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 2000)
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

  if (!roomId) {
    return <Navigate to="/rooms" replace />
  }

  const room = currentRoom || mockRoom
  const displayMessages = messages.length > 0 ? messages : mockMessages

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/rooms"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {room.name}
              </h1>
              <p className="text-sm text-gray-600">
                {room.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{participants.length || '3'} participants</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Languages className="w-4 h-4" />
              <span>Multi-language</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {displayMessages.map((message) => (
          <MessageComponent
            key={message.id}
            message={message}
            isOwnMessage={message.userId === user?.id}
            userLanguage={user?.preferredLanguage || 'en'}
          />
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              onBlur={handleStopTyping}
              placeholder={`Type a message in ${user?.preferredLanguage?.toUpperCase() || 'EN'}...`}
              className="input w-full"
              disabled={!isConnected}
            />
          </div>
          <button
            type="submit"
            disabled={!messageText.trim() || !isConnected}
            className="btn-primary flex items-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {!isConnected && (
          <div className="mt-2 text-center text-sm text-red-600">
            Disconnected from server. Trying to reconnect...
          </div>
        )}
      </div>
    </div>
  )
}