import { useState } from 'react'
import { Globe, Clock } from 'lucide-react'
import { Message } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { useChatStore } from '@/stores/chat-store'

interface MessageComponentProps {
  message: Message
  isOwnMessage: boolean
  userLanguage: string
}

export function MessageComponent({ message, isOwnMessage, userLanguage }: MessageComponentProps) {
  const [showTranslation, setShowTranslation] = useState(false)
  const { requestTranslation } = useChatStore()

  const needsTranslation = message.originalLanguage !== userLanguage
  const hasTranslation = message.translations?.some(t => t.targetLanguage === userLanguage)
  const translation = message.translations?.find(t => t.targetLanguage === userLanguage)

  const handleRequestTranslation = () => {
    if (!hasTranslation) {
      requestTranslation(message.id, userLanguage)
    }
    setShowTranslation(!showTranslation)
  }

  const displayContent = showTranslation && translation
    ? translation.translatedContent
    : message.content

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'now'
    }
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* User info (only for others' messages) */}
        {!isOwnMessage && message.user && (
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {message.user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {message.user.displayName}
            </span>
            <span className="text-xs text-gray-500 uppercase">
              {message.user.preferredLanguage}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            px-4 py-2 rounded-lg text-sm
            ${isOwnMessage
              ? 'bg-primary-600 text-white ml-auto'
              : 'bg-white border text-gray-900'
            }
          `}
        >
          <p className="break-words">{displayContent}</p>

          {/* Translation indicator */}
          {showTranslation && translation && (
            <div className="mt-2 pt-2 border-t border-primary-500/20 text-xs opacity-75">
              Translated from {message.originalLanguage.toUpperCase()}
            </div>
          )}
        </div>

        {/* Message actions */}
        <div className="flex items-center justify-between mt-1 px-1">
          <div className="flex items-center space-x-2">
            {/* Translation button */}
            {needsTranslation && (
              <button
                onClick={handleRequestTranslation}
                className={`
                  flex items-center space-x-1 text-xs px-2 py-1 rounded-full transition-colors
                  ${showTranslation
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
                title={hasTranslation ? 'Toggle translation' : 'Request translation'}
              >
                <Globe className="w-3 h-3" />
                <span>
                  {showTranslation ? 'Original' : 'Translate'}
                </span>
              </button>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}