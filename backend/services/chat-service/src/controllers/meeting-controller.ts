import { Router, Request, Response } from 'express';
import { SQLiteDatabaseService } from '../services/sqlite-database';
import { MemoryRedisService } from '../services/memory-redis';
import { CreateMeetingData } from '../types';
import Joi from 'joi';

export class MeetingController {
  public router: Router;
  private db: SQLiteDatabaseService;
  private redis: MemoryRedisService;

  constructor() {
    this.router = Router();
    this.db = SQLiteDatabaseService.getInstance();
    this.redis = MemoryRedisService.getInstance();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Meeting routes
    this.router.get('/', this.getMeetings.bind(this));
    this.router.post('/', this.createMeeting.bind(this));
    this.router.get('/:meetingId', this.getMeeting.bind(this));
    this.router.post('/:meetingId/join', this.joinMeeting.bind(this));
    this.router.post('/:meetingId/leave', this.leaveMeeting.bind(this));
    this.router.get('/:meetingId/participants', this.getMeetingParticipants.bind(this));
    this.router.get('/:meetingId/transcriptions', this.getTranscriptions.bind(this));
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
      console.log('📝 Create meeting request:', req.body);
      console.log('👤 User from auth:', (req as any).user);

      const schema = Joi.object({
        title: Joi.string().min(1).max(100).required(),
        description: Joi.string().max(500).optional().allow(''),
        isPublic: Joi.boolean().default(true),
        maxParticipants: Joi.number().min(2).max(100).default(10),
        scheduledAt: Joi.date().optional(),
        language: Joi.string().length(2).default('en')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        console.error('❌ Validation error:', error.details[0].message);
        res.status(400).json({ success: false, error: error.details[0].message });
        return;
      }

      const meetingData: CreateMeetingData = value;
      const userId = (req as any).user.userId;
      console.log('✅ Validated data:', meetingData);
      console.log('👤 User ID:', userId);

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
}