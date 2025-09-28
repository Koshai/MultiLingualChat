import { TypingUser } from '@/types'

interface TypingIndicatorProps {
  users: TypingUser[]
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null

  const getUserText = () => {
    if (users.length === 1) {
      return `${users[0].displayName} is typing...`
    } else if (users.length === 2) {
      return `${users[0].displayName} and ${users[1].displayName} are typing...`
    } else {
      return `${users[0].displayName} and ${users.length - 1} others are typing...`
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-gray-600 text-xs">
          {users[0].displayName.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="bg-gray-100 rounded-lg px-3 py-2">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">{getUserText()}</span>
          <div className="typing-indicator ml-2">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  )
}