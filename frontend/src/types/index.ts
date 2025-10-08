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

// Meeting types
export interface Meeting {
  id: string
  title: string
  description?: string
  isPublic: boolean
  maxParticipants: number
  scheduledAt?: string
  language: string
  createdBy: string
  createdAt: string
  updatedAt: string
  status: 'scheduled' | 'active' | 'ended'
  participantCount?: number
}

// Message types
export interface Message {
  id: string
  meetingId: string
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
  currentMeeting?: string
}

export interface MeetingEvent {
  type: 'participant_joined' | 'participant_left' | 'audio_enabled' | 'video_enabled' | 'screen_share' | 'message' | 'transcription' | 'translation'
  data: any
  timestamp: string
  meetingId: string
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

export interface CreateMeetingRequest {
  title: string
  description?: string
  isPublic?: boolean
  maxParticipants?: number
  scheduledAt?: string
  language?: string
}

export interface SendMessageRequest {
  content: string
  messageType?: 'text' | 'image' | 'audio'
  originalLanguage?: string
}

export interface JoinMeetingRequest {
  meetingId: string
  audioEnabled?: boolean
  videoEnabled?: boolean
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

export interface MeetingParticipant {
  id: string
  meetingId: string
  userId: string
  joinedAt: string
  leftAt?: string
  role: 'host' | 'moderator' | 'participant'
  audioEnabled: boolean
  videoEnabled: boolean
  screenSharing: boolean
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

// Video conferencing types
export interface MediaDevice {
  deviceId: string
  label: string
  kind: 'audioinput' | 'audiooutput' | 'videoinput'
}

export interface MediaSettings {
  videoEnabled: boolean
  audioEnabled: boolean
  screenSharing: boolean
  selectedCamera?: string
  selectedMicrophone?: string
  selectedSpeaker?: string
}

export interface WebRTCConnection {
  userId: string
  peerConnection: RTCPeerConnection
  stream?: MediaStream
}

export interface AudioTranscription {
  id: string
  meetingId?: string
  userId: string
  username?: string
  displayName?: string
  text: string // Translated text (usually English)
  originalText?: string // Original transcribed text
  language: string // Original language
  timestamp: string
  confidence?: number
  segments?: any[]
  translations?: TranscriptionTranslation[]
}

export interface TranscriptionTranslation {
  id: string
  transcriptionId: string
  targetLanguage: string
  translatedText: string
  confidence: number
  createdAt: string
}