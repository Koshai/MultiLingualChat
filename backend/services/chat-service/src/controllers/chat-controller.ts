import { Router, Request, Response } from 'express';
import { DatabaseService } from '../services/database';
import { RedisService } from '../services/redis';
import { CreateRoomData, SendMessageData, Message } from '../types';
import Joi from 'joi';

export class ChatController {
  public router: Router;
  private db: DatabaseService;
  private redis: RedisService;

  constructor() {
    this.router = Router();
    this.db = DatabaseService.getInstance();
    this.redis = RedisService.getInstance();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Room routes
    this.router.get('/rooms', this.getRooms.bind(this));
    this.router.post('/rooms', this.createRoom.bind(this));
    this.router.get('/rooms/:roomId', this.getRoom.bind(this));
    this.router.post('/rooms/:roomId/join', this.joinRoom.bind(this));
    this.router.post('/rooms/:roomId/leave', this.leaveRoom.bind(this));
    this.router.get('/rooms/:roomId/participants', this.getRoomParticipants.bind(this));

    // Message routes
    this.router.get('/rooms/:roomId/messages', this.getMessages.bind(this));
    this.router.post('/rooms/:roomId/messages', this.sendMessage.bind(this));

    // User routes
    this.router.get('/me', this.getCurrentUser.bind(this));
    this.router.get('/me/rooms', this.getUserRooms.bind(this));
  }

  // Room handlers
  async getRooms(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await this.db.getPublicRooms();
      res.json({ success: true, data: rooms });
    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch rooms' });
    }
  }

  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const schema = Joi.object({
        name: Joi.string().min(1).max(100).required(),
        description: Joi.string().max(500).optional(),
        isPublic: Joi.boolean().default(true),
        maxParticipants: Joi.number().min(2).max(1000).default(50)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message });
        return;
      }

      const roomData: CreateRoomData = value;
      const userId = (req as any).user.userId;

      const room = await this.db.createRoom({
        ...roomData,
        isPublic: roomData.isPublic ?? true,
        maxParticipants: roomData.maxParticipants ?? 50,
        createdBy: userId
      });

      // Add creator as admin participant
      await this.db.addParticipant(room.id, userId, 'admin');

      res.status(201).json({ success: true, data: room });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ success: false, error: 'Failed to create room' });
    }
  }

  async getRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const room = await this.db.getRoomById(roomId);

      if (!room) {
        res.status(404).json({ success: false, error: 'Room not found' });
        return;
      }

      res.json({ success: true, data: room });
    } catch (error) {
      console.error('Error fetching room:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch room' });
    }
  }

  async joinRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = (req as any).user.userId;

      const room = await this.db.getRoomById(roomId);
      if (!room) {
        res.status(404).json({ success: false, error: 'Room not found' });
        return;
      }

      const participant = await this.db.addParticipant(roomId, userId);
      res.json({ success: true, data: participant });
    } catch (error) {
      console.error('Error joining room:', error);
      res.status(500).json({ success: false, error: 'Failed to join room' });
    }
  }

  async leaveRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = (req as any).user.userId;

      await this.db.removeParticipant(roomId, userId);
      await this.redis.removeUserFromRoom(roomId, userId);

      res.json({ success: true, message: 'Left room successfully' });
    } catch (error) {
      console.error('Error leaving room:', error);
      res.status(500).json({ success: false, error: 'Failed to leave room' });
    }
  }

  async getRoomParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const participants = await this.db.getRoomParticipants(roomId);
      res.json({ success: true, data: participants });
    } catch (error) {
      console.error('Error fetching participants:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch participants' });
    }
  }

  // Message handlers
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const messages = await this.db.getMessagesByRoom(roomId, limit, offset);
      res.json({ success: true, data: messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const schema = Joi.object({
        content: Joi.string().min(1).max(4000).required(),
        messageType: Joi.string().valid('text', 'image', 'audio').default('text'),
        originalLanguage: Joi.string().length(2).default('en')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message });
        return;
      }

      const { roomId } = req.params;
      const userId = (req as any).user.userId;

      // Check rate limiting
      const canSend = await this.redis.checkRateLimit(userId, 'send_message', 30, 60000); // 30 messages per minute
      if (!canSend) {
        res.status(429).json({ success: false, error: 'Rate limit exceeded' });
        return;
      }

      const messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> = {
        ...value,
        roomId,
        userId,
        originalLanguage: value.originalLanguage || 'en',
        messageType: value.messageType || 'text'
      };

      const message = await this.db.createMessage(messageData);

      // Cache the message
      await this.redis.cacheMessage(message.id, message);

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  }

  // User handlers
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const user = await this.db.getUserById(userId);

      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
  }

  async getUserRooms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const rooms = await this.db.getUserRooms(userId);
      res.json({ success: true, data: rooms });
    } catch (error) {
      console.error('Error fetching user rooms:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch user rooms' });
    }
  }
}