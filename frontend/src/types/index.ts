// User types
export interface User {
  id: string
  username: string
  email: string
  displayName: string
  preferredLanguage: string
  createdAt: string
  updatedAt: string
}

// Chat room types
export interface ChatRoom {
  id: string
  name: string
  description?: string
  isPublic: boolean
  maxParticipants: number
  createdBy: string
  createdAt: string
  updatedAt: string
  participantCount?: number
}

// Message types
export interface Message {
  id: string
  roomId: string
  userId: string
  content: string
  originalLanguage: string
  messageType: 'text' | 'image' | 'audio'
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    username: string
    displayName: string
    preferredLanguage: string
  }
  translations?: MessageTranslation[]
}

export interface MessageTranslation {
  id: string
  messageId: string
  targetLanguage: string
  translatedContent: string
  translationConfidence?: number
  createdAt: string
}

// Socket event types
export interface SocketUser {
  id: string
  username: string
  displayName: string
  preferredLanguage: string
  currentRoom?: string
}

export interface ChatEvent {
  type: 'message' | 'user_joined' | 'user_left' | 'typing' | 'translation_ready'
  data: any
  timestamp: string
  roomId?: string
  userId?: string
}

// API request/response types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data?: {
    user: User
    token: string
  }
  error?: string
}

export interface CreateRoomRequest {
  name: string
  description?: string
  isPublic?: boolean
  maxParticipants?: number
}

export interface SendMessageRequest {
  content: string
  messageType?: 'text' | 'image' | 'audio'
  originalLanguage?: string
}

// Translation types
export interface TranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  messageId?: string
}

export interface TranslationResponse {
  id: string
  text: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence?: number
  status: 'pending' | 'completed' | 'failed' | 'cached'
  cached: boolean
  processingTimeMs?: number
  messageId?: string
}

export interface SupportedLanguage {
  code: string
  name: string
}

// UI state types
export interface TypingUser {
  userId: string
  username: string
  displayName: string
}

export interface RoomParticipant {
  id: string
  roomId: string
  userId: string
  joinedAt: string
  role: 'member' | 'moderator' | 'admin'
  user?: User
}

// Utility types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data?: {
    items: T[]
    total: number
    page: number
    limit: number
    hasNext: boolean
    hasPrev: boolean
  }
  error?: string
}

// Language utilities
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']