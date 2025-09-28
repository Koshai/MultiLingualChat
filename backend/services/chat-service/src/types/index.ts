export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  meetingId: string;
  userId: string;
  content: string;
  originalLanguage: string;
  messageType: 'text' | 'image' | 'audio';
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  translations?: MessageTranslation[];
}

export interface MessageTranslation {
  id: string;
  messageId: string;
  targetLanguage: string;
  translatedContent: string;
  translationConfidence?: number;
  createdAt: Date;
}

export interface SocketUser {
  socketId: string;
  userId: string;
  username: string;
  displayName: string;
  preferredLanguage: string;
  currentMeeting?: string;
}

export interface AuthToken {
  userId: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

export interface SendMessageData {
  meetingId: string;
  content: string;
  messageType?: 'text' | 'image' | 'audio';
  originalLanguage?: string;
}

export interface JoinMeetingSocketData {
  meetingId: string;
}

export interface TranslationRequest {
  messageId: string;
  targetLanguage: string;
  sourceText: string;
  sourceLanguage: string;
}

// Meeting-related types (for video conferencing)
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  maxParticipants: number;
  scheduledAt?: Date;
  language: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'scheduled' | 'active' | 'ended';
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  joinedAt: Date;
  leftAt?: Date;
  role: 'host' | 'moderator' | 'participant';
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
}

export interface AudioTranscription {
  id: string;
  meetingId: string;
  userId: string;
  text: string;
  language: string;
  timestamp: Date;
  confidence: number;
  translations?: TranscriptionTranslation[];
}

export interface TranscriptionTranslation {
  id: string;
  transcriptionId: string;
  targetLanguage: string;
  translatedText: string;
  confidence: number;
  createdAt: Date;
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  isPublic?: boolean;
  maxParticipants?: number;
  scheduledAt?: Date;
  language?: string;
}

export interface SendAudioData {
  meetingId: string;
  audioData: string; // Base64 encoded audio
  language?: string;
  timestamp?: Date;
}

export interface WebRTCSignalingData {
  type: 'offer' | 'answer' | 'ice-candidate';
  meetingId: string;
  fromUserId: string;
  toUserId: string;
  data: any;
  timestamp: Date;
}

export interface JoinMeetingData {
  meetingId: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
}

export interface MeetingEvent {
  type: 'participant_joined' | 'participant_left' | 'audio_enabled' | 'video_enabled' | 'screen_share' | 'transcription' | 'translation';
  data: any;
  timestamp: Date;
  meetingId: string;
  userId?: string;
}