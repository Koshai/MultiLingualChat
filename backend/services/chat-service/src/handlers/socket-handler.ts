import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { DatabaseService } from '../services/database';
import { RedisService } from '../services/redis';
import { AuthToken, SocketUser, JoinMeetingSocketData, SendMessageData, TranslationRequest } from '../types';

export class SocketHandler {
  private io: Server;
  private db: DatabaseService;
  private redis: RedisService;

  constructor(io: Server) {
    this.io = io;
    this.db = DatabaseService.getInstance();
    this.redis = RedisService.getInstance();
  }

  initialize(): void {
    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private async authenticateSocket(socket: Socket, next: Function): Promise<void> {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      let decoded: AuthToken;

      // Development mode: Allow mock tokens
      if (process.env.NODE_ENV !== 'production') {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const decodedSignature = Buffer.from(parts[2], 'base64').toString();
            if (decodedSignature === 'mock-signature') {
              // Decode mock token payload
              decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());

              // For mock auth, create or get user from database
              let user = await this.db.getUserById(decoded.userId);
              if (!user) {
                // Create mock user in database
                user = await this.db.createUser({
                  username: decoded.username,
                  email: decoded.email,
                  password: 'mock-password', // Won't be used
                  displayName: decoded.username?.charAt(0).toUpperCase() + decoded.username?.slice(1) || 'User',
                  preferredLanguage: 'en'
                });
              }

              (socket as any).user = user;
              next();
              return;
            }
          }
        } catch (e) {
          // If mock token parsing fails, continue to real JWT verification
        }
      }

      // Real JWT verification
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as AuthToken;
      const user = await this.db.getUserById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  }

  private async handleConnection(socket: Socket): Promise<void> {
    const user = (socket as any).user;
    console.log(`🔗 User ${user.username} connected (${socket.id})`);

    // Store socket user in Redis
    const socketUser: SocketUser = {
      socketId: socket.id,
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      preferredLanguage: user.preferredLanguage
    };

    await this.redis.setSocketUser(socket.id, socketUser);

    // Set up event handlers
    socket.on('join_meeting', this.handleJoinMeeting.bind(this, socket));
    socket.on('leave_meeting', this.handleLeaveMeeting.bind(this, socket));
    socket.on('send_message', this.handleSendMessage.bind(this, socket));
    socket.on('typing_start', this.handleTypingStart.bind(this, socket));
    socket.on('typing_stop', this.handleTypingStop.bind(this, socket));
    socket.on('request_translation', this.handleTranslationRequest.bind(this, socket));
    socket.on('enable_audio', this.handleEnableAudio.bind(this, socket));
    socket.on('disable_audio', this.handleDisableAudio.bind(this, socket));
    socket.on('enable_video', this.handleEnableVideo.bind(this, socket));
    socket.on('disable_video', this.handleDisableVideo.bind(this, socket));
    socket.on('start_screen_share', this.handleStartScreenShare.bind(this, socket));
    socket.on('stop_screen_share', this.handleStopScreenShare.bind(this, socket));

    // WebRTC signaling handlers
    socket.on('webrtc:offer', this.handleWebRTCOffer.bind(this, socket));
    socket.on('webrtc:answer', this.handleWebRTCAnswer.bind(this, socket));
    socket.on('webrtc:ice-candidate', this.handleWebRTCIceCandidate.bind(this, socket));

    // Audio transcription handlers
    socket.on('audio_chunk', this.handleAudioChunk.bind(this, socket));

    socket.on('disconnect', this.handleDisconnect.bind(this, socket));

    // Send current user info
    socket.emit('connected', {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        preferredLanguage: user.preferredLanguage
      }
    });
  }

  private async handleJoinMeeting(socket: Socket, data: JoinMeetingSocketData): Promise<void> {
    try {
      const user = (socket as any).user;
      const { meetingId, audioEnabled = true, videoEnabled = true } = data;

      // Validate meeting exists
      const meeting = await this.db.getMeetingById(meetingId);
      if (!meeting) {
        socket.emit('meeting_error', { message: 'Meeting not found' });
        return;
      }

      // Add user to meeting in database
      await this.db.addMeetingParticipant(meetingId, user.id, {
        audioEnabled,
        videoEnabled,
        role: 'participant'
      });

      // Join socket room
      socket.join(meetingId);

      // Update Redis
      await this.redis.addUserToRoom(meetingId, user.id);

      // Get updated participant list (user IDs)
      const participantUserIds = await this.redis.getRoomUsers(meetingId);

      // Get full participant data from database for all participants
      const participantData = await this.db.getMeetingParticipants(meetingId);

      // Build full participant list with user data
      const participants = await Promise.all(participantUserIds.map(async (userId) => {
        const participantUser = await this.db.getUserById(userId);
        const dbParticipant = participantData.find(p => p.userId === userId);

        return {
          id: `${meetingId}-${userId}`,
          meetingId,
          userId,
          joinedAt: dbParticipant?.joinedAt || new Date().toISOString(),
          role: (dbParticipant?.role || 'participant') as const,
          audioEnabled: dbParticipant?.audioEnabled ?? true,
          videoEnabled: dbParticipant?.videoEnabled ?? true,
          screenSharing: false,
          user: participantUser ? {
            id: participantUser.id,
            username: participantUser.username,
            displayName: participantUser.displayName,
            email: participantUser.email,
            preferredLanguage: participantUser.preferredLanguage,
            createdAt: participantUser.createdAt,
            updatedAt: participantUser.updatedAt
          } : undefined
        };
      }));

      // Create current participant data
      const participant = {
        id: `${meetingId}-${user.id}`,
        meetingId,
        userId: user.id,
        joinedAt: new Date().toISOString(),
        role: 'participant' as const,
        audioEnabled,
        videoEnabled,
        screenSharing: false,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          preferredLanguage: user.preferredLanguage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };

      // Notify meeting about new participant
      socket.to(meetingId).emit('participant_joined', {
        participant,
        timestamp: new Date()
      });

      // Send success response to user with full participant list
      socket.emit('meeting_joined', {
        meeting: meeting,
        participants: participants,
        timestamp: new Date()
      });

      console.log(`👥 ${user.username} joined meeting ${meeting.title}`);
    } catch (error) {
      console.error('Error joining meeting:', error);
      socket.emit('meeting_error', { message: 'Failed to join meeting', error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async handleLeaveMeeting(socket: Socket, data: { meetingId: string }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { meetingId } = data;

      // Leave socket room
      socket.leave(meetingId);

      // Update Redis
      await this.redis.removeUserFromRoom(meetingId, user.id);

      // Remove from database
      await this.db.removeMeetingParticipant(meetingId, user.id);

      // Create participant data for leaving event
      const participant = {
        id: `${meetingId}-${user.id}`,
        meetingId,
        userId: user.id,
        leftAt: new Date().toISOString(),
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName
        }
      };

      // Notify meeting about participant leaving
      socket.to(meetingId).emit('participant_left', {
        participant,
        timestamp: new Date()
      });

      socket.emit('meeting_left', { meetingId, timestamp: new Date() });

      console.log(`👋 ${user.username} left meeting ${meetingId}`);
    } catch (error) {
      console.error('Error leaving meeting:', error);
      socket.emit('meeting_error', { message: 'Failed to leave meeting', error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async handleSendMessage(socket: Socket, data: SendMessageData): Promise<void> {
    try {
      const user = (socket as any).user;

      // Rate limiting check
      const canSend = await this.redis.checkRateLimit(user.id, 'socket_message', 60, 60000);
      if (!canSend) {
        socket.emit('meeting_error', { message: 'Rate limit exceeded' });
        return;
      }

      // Create message in database
      const message = await this.db.createMessage({
        meetingId: data.meetingId,
        userId: user.id,
        content: data.content,
        originalLanguage: data.originalLanguage || user.preferredLanguage,
        messageType: data.messageType || 'text'
      });

      // Cache message
      await this.redis.cacheMessage(message.id, message);

      // Prepare message data for broadcast
      const messageWithUser = {
        ...message,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          preferredLanguage: user.preferredLanguage
        }
      };

      // Broadcast to meeting
      this.io.to(data.meetingId).emit('new_message', messageWithUser);

      // Request translation for users with different preferred languages
      this.requestTranslationsForMessage(message, data.meetingId);

      console.log(`💬 ${user.username} sent message in meeting ${data.meetingId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('meeting_error', { message: 'Failed to send message', error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async handleTypingStart(socket: Socket, data: { roomId: string }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { roomId } = data;

      await this.redis.setTyping(roomId, user.id);

      socket.to(roomId).emit('user_typing', {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        typing: true
      });
    } catch (error) {
      console.error('Error handling typing start:', error);
    }
  }

  private async handleTypingStop(socket: Socket, data: { roomId: string }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { roomId } = data;

      socket.to(roomId).emit('user_typing', {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        typing: false
      });
    } catch (error) {
      console.error('Error handling typing stop:', error);
    }
  }

  private async handleTranslationRequest(socket: Socket, data: TranslationRequest): Promise<void> {
    try {
      const { messageId, targetLanguage } = data;

      // Check cache first
      const cachedTranslation = await this.redis.getCachedTranslation(messageId, targetLanguage);
      if (cachedTranslation) {
        socket.emit('translation_ready', {
          messageId,
          targetLanguage,
          translatedContent: cachedTranslation,
          cached: true
        });
        return;
      }

      // Request translation from translation service
      // This will be implemented when we create the translation service
      socket.emit('translation_pending', { messageId, targetLanguage });

    } catch (error) {
      console.error('Error handling translation request:', error);
      socket.emit('meeting_error', { message: 'Translation request failed', error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async handleDisconnect(socket: Socket): Promise<void> {
    try {
      const user = (socket as any).user;

      if (user) {
        // Get user's rooms and notify about disconnection
        const userRooms = await this.redis.getUserRooms(user.id);

        for (const roomId of userRooms) {
          // Create participant data for leaving event
          const participant = {
            id: `${roomId}-${user.id}`,
            meetingId: roomId,
            userId: user.id,
            leftAt: new Date().toISOString(),
            user: {
              id: user.id,
              username: user.username,
              displayName: user.displayName
            }
          };

          // Notify meeting about participant leaving
          socket.to(roomId).emit('participant_left', {
            participant,
            timestamp: new Date()
          });

          // Remove from Redis
          await this.redis.removeUserFromRoom(roomId, user.id);

          // Remove from database
          await this.db.removeMeetingParticipant(roomId, user.id);

          console.log(`👋 ${user.username} disconnected and left meeting ${roomId}`);
        }

        // Clean up socket data
        await this.redis.removeSocketUser(socket.id);

        console.log(`🔌 User ${user.username} disconnected (${socket.id})`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  private async requestTranslationsForMessage(message: any, roomId: string): Promise<void> {
    try {
      // Get room participants
      const participants = await this.redis.getRoomUsers(roomId);

      // Get unique languages needed
      const languagesNeeded = new Set<string>();

      for (const userId of participants) {
        const user = await this.db.getUserById(userId);
        if (user && user.preferredLanguage !== message.originalLanguage) {
          languagesNeeded.add(user.preferredLanguage);
        }
      }

      // Request translations for each needed language
      for (const targetLang of languagesNeeded) {
        // This will trigger translation service call
        // Implementation will be completed with translation service
        console.log(`🔄 Translation requested: ${message.originalLanguage} -> ${targetLang}`);
      }
    } catch (error) {
      console.error('Error requesting translations:', error);
    }
  }

  private async handleEnableAudio(socket: Socket, data: { meetingId: string }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { meetingId } = data;

      // Broadcast to meeting
      socket.to(meetingId).emit('audio_enabled', {
        userId: user.id,
        timestamp: new Date()
      });

      console.log(`🎤 ${user.username} enabled audio in meeting ${meetingId}`);
    } catch (error) {
      console.error('Error enabling audio:', error);
    }
  }

  private async handleDisableAudio(socket: Socket, data: { meetingId: string }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { meetingId } = data;

      // Broadcast to meeting
      socket.to(meetingId).emit('audio_disabled', {
        userId: user.id,
        timestamp: new Date()
      });

      console.log(`🔇 ${user.username} disabled audio in meeting ${meetingId}`);
    } catch (error) {
      console.error('Error disabling audio:', error);
    }
  }

  private async handleEnableVideo(socket: Socket, data: { meetingId: string }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { meetingId } = data;

      // Broadcast to meeting
      socket.to(meetingId).emit('video_enabled', {
        userId: user.id,
        timestamp: new Date()
      });

      console.log(`📹 ${user.username} enabled video in meeting ${meetingId}`);
    } catch (error) {
      console.error('Error enabling video:', error);
    }
  }

  private async handleDisableVideo(socket: Socket, data: { meetingId: string }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { meetingId } = data;

      // Broadcast to meeting
      socket.to(meetingId).emit('video_disabled', {
        userId: user.id,
        timestamp: new Date()
      });

      console.log(`📷 ${user.username} disabled video in meeting ${meetingId}`);
    } catch (error) {
      console.error('Error disabling video:', error);
    }
  }

  private async handleStartScreenShare(socket: Socket, data: { meetingId: string }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { meetingId } = data;

      // Broadcast to meeting
      socket.to(meetingId).emit('screen_share_started', {
        userId: user.id,
        timestamp: new Date()
      });

      console.log(`🖥️ ${user.username} started screen share in meeting ${meetingId}`);
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  }

  private async handleStopScreenShare(socket: Socket, data: { meetingId: string }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { meetingId } = data;

      // Broadcast to meeting
      socket.to(meetingId).emit('screen_share_stopped', {
        userId: user.id,
        timestamp: new Date()
      });

      console.log(`🛑 ${user.username} stopped screen share in meeting ${meetingId}`);
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }

  // WebRTC Signaling Handlers
  private async handleWebRTCOffer(socket: Socket, data: { targetUserId: string; offer: any }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { targetUserId, offer } = data;

      // Find target user's socket
      const targetSocketId = await this.redis.getUserSocketId(targetUserId);

      if (targetSocketId) {
        // Forward offer to target user
        this.io.to(targetSocketId).emit('webrtc:offer', {
          userId: user.id,
          offer: offer
        });

        console.log(`📞 Forwarded WebRTC offer from ${user.username} to user ${targetUserId}`);
      } else {
        socket.emit('meeting_error', { message: 'Target user not found or offline' });
        console.error(`❌ Target user ${targetUserId} socket not found`);
      }
    } catch (error) {
      console.error('Error handling WebRTC offer:', error);
      socket.emit('meeting_error', { message: 'Failed to send WebRTC offer' });
    }
  }

  private async handleWebRTCAnswer(socket: Socket, data: { targetUserId: string; answer: any }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { targetUserId, answer } = data;

      // Find target user's socket
      const targetSocketId = await this.redis.getUserSocketId(targetUserId);

      if (targetSocketId) {
        // Forward answer to target user
        this.io.to(targetSocketId).emit('webrtc:answer', {
          userId: user.id,
          answer: answer
        });

        console.log(`✅ Forwarded WebRTC answer from ${user.username} to user ${targetUserId}`);
      } else {
        socket.emit('meeting_error', { message: 'Target user not found or offline' });
        console.error(`❌ Target user ${targetUserId} socket not found`);
      }
    } catch (error) {
      console.error('Error handling WebRTC answer:', error);
      socket.emit('meeting_error', { message: 'Failed to send WebRTC answer' });
    }
  }

  private async handleWebRTCIceCandidate(socket: Socket, data: { targetUserId: string; candidate: any }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { targetUserId, candidate } = data;

      // Find target user's socket
      const targetSocketId = await this.redis.getUserSocketId(targetUserId);

      if (targetSocketId) {
        // Forward ICE candidate to target user
        this.io.to(targetSocketId).emit('webrtc:ice-candidate', {
          userId: user.id,
          candidate: candidate
        });

        console.log(`🧊 Forwarded ICE candidate from ${user.username} to user ${targetUserId}`);
      } else {
        console.error(`❌ Target user ${targetUserId} socket not found for ICE candidate`);
      }
    } catch (error) {
      console.error('Error handling WebRTC ICE candidate:', error);
    }
  }

  private async handleAudioChunk(socket: Socket, data: { meetingId: string; audioData: string; timestamp: number; format: string; language?: string | null }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { meetingId, audioData, timestamp, format, language } = data;

      console.log(`Audio chunk received from ${user.username} for meeting ${meetingId} (lang: ${language || 'auto-detect'})`);

      // Forward audio to STT service
      const sttUrl = process.env.STT_SERVICE_URL || 'http://localhost:3004';

      const response = await fetch(`${sttUrl}/api/v1/transcription/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio_data: audioData,
          language: language || null, // null = auto-detect
          meeting_id: meetingId,
          user_id: user.id
        })
      });

      if (!response.ok) {
        console.error(`STT service error: ${response.status}`);
        return;
      }

      const transcription = await response.json();

      console.log(`Transcription received: "${transcription.text}" (${transcription.language})`);

      // Translate to English if not already English
      let translatedText = transcription.text;
      const translations: any[] = [];

      if (transcription.language !== 'en' && transcription.language !== 'english') {
        try {
          const translationUrl = process.env.TRANSLATION_SERVICE_URL || 'http://localhost:3003';
          const translationResponse = await fetch(`${translationUrl}/api/v1/translate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: transcription.text,
              source_language: transcription.language,
              target_language: 'en'
            })
          });

          if (translationResponse.ok) {
            const translationData = await translationResponse.json();
            translatedText = translationData.translated_text;
            translations.push({
              id: translationData.id,
              targetLanguage: 'en',
              translatedText: translationData.translated_text,
              confidence: translationData.confidence
            });
            console.log(`Translated to English: "${translatedText}"`);
          } else {
            console.warn(`Translation failed: ${translationResponse.status}`);
          }
        } catch (translationError) {
          console.error('Translation error:', translationError);
        }
      }

      // Broadcast transcription to all participants in the meeting
      this.io.to(meetingId).emit('transcription', {
        id: transcription.id,
        text: translatedText, // Show translated English text
        language: transcription.language, // Original language
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        timestamp: new Date().toISOString(),
        segments: transcription.segments,
        translations: translations,
        originalText: transcription.text // Keep original for reference
      });

      // Save transcription to database
      await this.db.createTranscription({
        meetingId,
        userId: user.id,
        text: transcription.text,
        language: transcription.language,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error handling audio chunk:', error);
    }
  }
}