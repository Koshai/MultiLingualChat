import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { DatabaseService } from '../services/database';
import { RedisService } from '../services/redis';
import { AuthToken, SocketUser, JoinRoomData, SendMessageData, TranslationRequest } from '../types';

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

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as AuthToken;
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
    socket.on('join_room', this.handleJoinRoom.bind(this, socket));
    socket.on('leave_room', this.handleLeaveRoom.bind(this, socket));
    socket.on('send_message', this.handleSendMessage.bind(this, socket));
    socket.on('typing_start', this.handleTypingStart.bind(this, socket));
    socket.on('typing_stop', this.handleTypingStop.bind(this, socket));
    socket.on('request_translation', this.handleTranslationRequest.bind(this, socket));
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

  private async handleJoinRoom(socket: Socket, data: JoinRoomData): Promise<void> {
    try {
      const user = (socket as any).user;
      const { roomId } = data;

      // Validate room exists
      const room = await this.db.getRoomById(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Add user to room in database
      await this.db.addParticipant(roomId, user.id);

      // Join socket room
      socket.join(roomId);

      // Update Redis
      await this.redis.addUserToRoom(roomId, user.id);

      // Get updated participant list
      const participants = await this.redis.getRoomUsers(roomId);

      // Notify room about new user
      socket.to(roomId).emit('user_joined', {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          preferredLanguage: user.preferredLanguage
        },
        room: room,
        timestamp: new Date()
      });

      // Send success response to user
      socket.emit('room_joined', {
        room: room,
        participants: participants,
        timestamp: new Date()
      });

      console.log(`👥 ${user.username} joined room ${room.name}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  private async handleLeaveRoom(socket: Socket, data: { roomId: string }): Promise<void> {
    try {
      const user = (socket as any).user;
      const { roomId } = data;

      // Leave socket room
      socket.leave(roomId);

      // Update Redis
      await this.redis.removeUserFromRoom(roomId, user.id);

      // Remove from database
      await this.db.removeParticipant(roomId, user.id);

      // Notify room about user leaving
      socket.to(roomId).emit('user_left', {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName
        },
        timestamp: new Date()
      });

      socket.emit('room_left', { roomId, timestamp: new Date() });

      console.log(`👋 ${user.username} left room ${roomId}`);
    } catch (error) {
      console.error('Error leaving room:', error);
      socket.emit('error', { message: 'Failed to leave room' });
    }
  }

  private async handleSendMessage(socket: Socket, data: SendMessageData): Promise<void> {
    try {
      const user = (socket as any).user;

      // Rate limiting check
      const canSend = await this.redis.checkRateLimit(user.id, 'socket_message', 60, 60000);
      if (!canSend) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }

      // Create message in database
      const message = await this.db.createMessage({
        roomId: data.roomId,
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

      // Broadcast to room
      this.io.to(data.roomId).emit('new_message', messageWithUser);

      // Request translation for users with different preferred languages
      this.requestTranslationsForMessage(message, data.roomId);

      console.log(`💬 ${user.username} sent message in room ${data.roomId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
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
      socket.emit('error', { message: 'Translation request failed' });
    }
  }

  private async handleDisconnect(socket: Socket): Promise<void> {
    try {
      const user = (socket as any).user;

      if (user) {
        // Get user's rooms and notify about disconnection
        const userRooms = await this.redis.getUserRooms(user.id);

        for (const roomId of userRooms) {
          socket.to(roomId).emit('user_disconnected', {
            userId: user.id,
            username: user.username,
            timestamp: new Date()
          });

          await this.redis.removeUserFromRoom(roomId, user.id);
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
}