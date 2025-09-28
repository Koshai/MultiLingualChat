import { Router, Request, Response } from 'express';
import { DatabaseService } from '../services/database';
import { RedisService } from '../services/redis';
import { CreateMeetingData, SendAudioData, AudioTranscription } from '../types';
import Joi from 'joi';

export class MeetingController {
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
    // Meeting routes
    this.router.get('/meetings', this.getMeetings.bind(this));
    this.router.post('/meetings', this.createMeeting.bind(this));
    this.router.get('/meetings/:meetingId', this.getMeeting.bind(this));
    this.router.post('/meetings/:meetingId/join', this.joinMeeting.bind(this));
    this.router.post('/meetings/:meetingId/leave', this.leaveMeeting.bind(this));
    this.router.get('/meetings/:meetingId/participants', this.getMeetingParticipants.bind(this));

    // Audio/Video routes
    this.router.post('/meetings/:meetingId/audio', this.processAudio.bind(this));
    this.router.get('/meetings/:meetingId/transcriptions', this.getTranscriptions.bind(this));

    // WebRTC signaling routes
    this.router.post('/meetings/:meetingId/offer', this.handleOffer.bind(this));
    this.router.post('/meetings/:meetingId/answer', this.handleAnswer.bind(this));
    this.router.post('/meetings/:meetingId/ice-candidate', this.handleIceCandidate.bind(this));

    // User routes
    this.router.get('/me', this.getCurrentUser.bind(this));
    this.router.get('/me/meetings', this.getUserMeetings.bind(this));
  }

  // Meeting handlers
  async getMeetings(req: Request, res: Response): Promise<void> {
    try {
      const meetings = await this.db.getPublicMeetings();
      res.json({ success: true, data: meetings });
    } catch (error) {
      console.error('Error fetching meetings:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch meetings' });
    }
  }

  async createMeeting(req: Request, res: Response): Promise<void> {
    try {
      const schema = Joi.object({
        title: Joi.string().min(1).max(100).required(),
        description: Joi.string().max(500).optional(),
        isPublic: Joi.boolean().default(true),
        maxParticipants: Joi.number().min(2).max(100).default(10),
        scheduledAt: Joi.date().optional(),
        language: Joi.string().length(2).default('en')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message });
        return;
      }

      const meetingData: CreateMeetingData = value;
      const userId = (req as any).user.userId;

      const meeting = await this.db.createMeeting({
        ...meetingData,
        isPublic: meetingData.isPublic ?? true,
        maxParticipants: meetingData.maxParticipants ?? 10,
        language: meetingData.language ?? 'en',
        createdBy: userId,
        status: 'scheduled'
      });

      // Add creator as host participant
      await this.db.addMeetingParticipant(meeting.id, userId, 'host');

      res.status(201).json({ success: true, data: meeting });
    } catch (error) {
      console.error('Error creating meeting:', error);
      res.status(500).json({ success: false, error: 'Failed to create meeting' });
    }
  }

  async getMeeting(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId } = req.params;
      const meeting = await this.db.getMeetingById(meetingId);

      if (!meeting) {
        res.status(404).json({ success: false, error: 'Meeting not found' });
        return;
      }

      res.json({ success: true, data: meeting });
    } catch (error) {
      console.error('Error fetching meeting:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch meeting' });
    }
  }

  async joinMeeting(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId } = req.params;
      const userId = (req as any).user.userId;

      const meeting = await this.db.getMeetingById(meetingId);
      if (!meeting) {
        res.status(404).json({ success: false, error: 'Meeting not found' });
        return;
      }

      const participant = await this.db.addParticipant(meetingId, userId);
      res.json({ success: true, data: participant });
    } catch (error) {
      console.error('Error joining meeting:', error);
      res.status(500).json({ success: false, error: 'Failed to join meeting' });
    }
  }

  async leaveMeeting(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId } = req.params;
      const userId = (req as any).user.userId;

      await this.db.removeParticipant(meetingId, userId);
      await this.redis.removeUserFromRoom(meetingId, userId);

      res.json({ success: true, message: 'Left meeting successfully' });
    } catch (error) {
      console.error('Error leaving meeting:', error);
      res.status(500).json({ success: false, error: 'Failed to leave meeting' });
    }
  }

  async getMeetingParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId } = req.params;
      const participants = await this.db.getMeetingParticipants(meetingId);
      res.json({ success: true, data: participants });
    } catch (error) {
      console.error('Error fetching participants:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch participants' });
    }
  }

  // Audio processing handlers
  async processAudio(req: Request, res: Response): Promise<void> {
    try {
      const schema = Joi.object({
        audioData: Joi.string().required(), // Base64 encoded audio
        language: Joi.string().length(2).default('en'),
        timestamp: Joi.date().default(() => new Date())
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message });
        return;
      }

      const { meetingId } = req.params;
      const userId = (req as any).user.userId;

      // Rate limiting check
      const canProcess = await this.redis.checkRateLimit(userId, 'audio_processing', 10, 60000); // 10 audio chunks per minute
      if (!canProcess) {
        res.status(429).json({ success: false, error: 'Audio processing rate limit exceeded' });
        return;
      }

      // TODO: Send to speech-to-text service
      // For now, return a placeholder response
      const transcription: AudioTranscription = {
        id: `transcription_${Date.now()}`,
        meetingId,
        userId,
        text: '', // Will be filled by STT service
        language: value.language,
        timestamp: value.timestamp,
        confidence: 0
      };

      res.status(201).json({ success: true, data: transcription });
    } catch (error) {
      console.error('Error processing audio:', error);
      res.status(500).json({ success: false, error: 'Failed to process audio' });
    }
  }

  async getTranscriptions(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const transcriptions = await this.db.getMeetingTranscriptions(meetingId, limit);
      res.json({ success: true, data: transcriptions });
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch transcriptions' });
    }
  }

  // WebRTC signaling handlers
  async handleOffer(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId } = req.params;
      const { offer, targetUserId } = req.body;
      const userId = (req as any).user.userId;

      // Store offer in Redis for real-time delivery
      await this.redis.storeSignalingData(meetingId, userId, targetUserId, { type: 'offer', data: offer });

      res.json({ success: true, message: 'Offer stored' });
    } catch (error) {
      console.error('Error handling offer:', error);
      res.status(500).json({ success: false, error: 'Failed to handle offer' });
    }
  }

  async handleAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId } = req.params;
      const { answer, targetUserId } = req.body;
      const userId = (req as any).user.userId;

      // Store answer in Redis for real-time delivery
      await this.redis.storeSignalingData(meetingId, userId, targetUserId, { type: 'answer', data: answer });

      res.json({ success: true, message: 'Answer stored' });
    } catch (error) {
      console.error('Error handling answer:', error);
      res.status(500).json({ success: false, error: 'Failed to handle answer' });
    }
  }

  async handleIceCandidate(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId } = req.params;
      const { candidate, targetUserId } = req.body;
      const userId = (req as any).user.userId;

      // Store ICE candidate in Redis for real-time delivery
      await this.redis.storeSignalingData(meetingId, userId, targetUserId, { type: 'ice-candidate', data: candidate });

      res.json({ success: true, message: 'ICE candidate stored' });
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      res.status(500).json({ success: false, error: 'Failed to handle ICE candidate' });
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

  async getUserMeetings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const meetings = await this.db.getUserMeetings(userId);
      res.json({ success: true, data: meetings });
    } catch (error) {
      console.error('Error fetching user meetings:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch user meetings' });
    }
  }
}