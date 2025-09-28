import sqlite3 from 'sqlite3';
import { User, ChatRoom, Message, RoomParticipant, Meeting, MeetingParticipant, AudioTranscription } from '../types';

export class SQLiteDatabaseService {
  private static instance: SQLiteDatabaseService;
  private db: sqlite3.Database;

  private constructor() {
    // Use SQLite database file
    this.db = new sqlite3.Database('multilingual_chat.db', (err) => {
      if (err) {
        console.error('❌ SQLite connection failed:', err);
      } else {
        console.log('📊 Connected to SQLite database');
      }
    });

    // Initialize database schema
    this.initializeSchema();
  }

  static getInstance(): SQLiteDatabaseService {
    if (!SQLiteDatabaseService.instance) {
      SQLiteDatabaseService.instance = new SQLiteDatabaseService();
    }
    return SQLiteDatabaseService.instance;
  }

  private async initializeSchema(): Promise<void> {
    const run = (sql: string) => new Promise<void>((resolve, reject) => {
      this.db.run(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      // Create users table
      await run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          preferred_language TEXT DEFAULT 'en',
          password_hash TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create chat rooms table
      await run(`
        CREATE TABLE IF NOT EXISTS chat_rooms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          is_public BOOLEAN DEFAULT 1,
          max_participants INTEGER DEFAULT 50,
          created_by TEXT REFERENCES users(id),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create room participants table
      await run(`
        CREATE TABLE IF NOT EXISTS room_participants (
          id TEXT PRIMARY KEY,
          room_id TEXT REFERENCES chat_rooms(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          role TEXT DEFAULT 'member'
        )
      `);

      // Create messages table
      await run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          room_id TEXT REFERENCES chat_rooms(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id),
          content TEXT NOT NULL,
          original_language TEXT NOT NULL,
          message_type TEXT DEFAULT 'text',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create message translations table
      await run(`
        CREATE TABLE IF NOT EXISTS message_translations (
          id TEXT PRIMARY KEY,
          message_id TEXT REFERENCES messages(id) ON DELETE CASCADE,
          target_language TEXT NOT NULL,
          translated_content TEXT NOT NULL,
          translation_confidence REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create meetings table
      await run(`
        CREATE TABLE IF NOT EXISTS meetings (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          is_public BOOLEAN DEFAULT 1,
          max_participants INTEGER DEFAULT 50,
          scheduled_at DATETIME,
          language TEXT DEFAULT 'en',
          created_by TEXT REFERENCES users(id),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'scheduled'
        )
      `);

      // Create meeting participants table
      await run(`
        CREATE TABLE IF NOT EXISTS meeting_participants (
          id TEXT PRIMARY KEY,
          meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          left_at DATETIME,
          role TEXT DEFAULT 'participant',
          audio_enabled BOOLEAN DEFAULT 1,
          video_enabled BOOLEAN DEFAULT 1,
          screen_sharing BOOLEAN DEFAULT 0
        )
      `);

      // Create audio transcriptions table
      await run(`
        CREATE TABLE IF NOT EXISTS audio_transcriptions (
          id TEXT PRIMARY KEY,
          meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id),
          text TEXT NOT NULL,
          language TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          confidence REAL
        )
      `);

      // Create transcription translations table
      await run(`
        CREATE TABLE IF NOT EXISTS transcription_translations (
          id TEXT PRIMARY KEY,
          transcription_id TEXT REFERENCES audio_transcriptions(id) ON DELETE CASCADE,
          target_language TEXT NOT NULL,
          translated_text TEXT NOT NULL,
          confidence REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert sample data
      await this.insertSampleData();

      console.log('✅ Database schema initialized');
    } catch (error) {
      console.error('❌ Failed to initialize schema:', error);
    }
  }

  private async insertSampleData(): Promise<void> {
    const run = (sql: string, params: any[] = []) => new Promise<void>((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const get = (sql: string, params: any[] = []) => new Promise<any>((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    try {
      // Check if data already exists
      const existingUser = await get('SELECT id FROM users WHERE username = ?', ['demo']);
      if (existingUser) return;

      // Insert demo users
      await run(`
        INSERT INTO users (id, username, email, display_name, preferred_language, password_hash)
        VALUES
          ('demo-user-1', 'demo', 'demo@multilingual.chat', 'Demo User', 'en', '$2b$10$placeholder'),
          ('admin-user-1', 'admin', 'admin@multilingual.chat', 'Administrator', 'en', '$2b$10$placeholder')
      `);

      // Insert sample rooms
      await run(`
        INSERT INTO chat_rooms (id, name, description, created_by)
        VALUES
          ('room-1', 'General', 'General discussion room', 'admin-user-1'),
          ('room-2', 'Spanish Speakers', 'Sala para hispanohablantes', 'admin-user-1'),
          ('room-3', 'Language Learning', 'Practice different languages', 'admin-user-1')
      `);

      console.log('✅ Sample data inserted');
    } catch (error) {
      console.error('❌ Failed to insert sample data:', error);
    }
  }

  async connect(): Promise<void> {
    // SQLite is already connected in constructor
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  // User methods
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { passwordHash: string }): Promise<User> {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.run(`
      INSERT INTO users (id, username, email, display_name, preferred_language, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, userData.username, userData.email, userData.displayName, userData.preferredLanguage, userData.passwordHash, now, now]);

    const user = await this.getUserById(id);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const row = await new Promise<any>((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    return row ? this.mapUser(row) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const row = await new Promise<any>((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    return row ? this.mapUser(row) : null;
  }

  // Room methods
  async createRoom(roomData: Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatRoom> {
    const id = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.run(`
      INSERT INTO chat_rooms (id, name, description, is_public, max_participants, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, roomData.name, roomData.description, roomData.isPublic ? 1 : 0, roomData.maxParticipants, roomData.createdBy, now, now]);

    const room = await this.getRoomById(id);
    if (!room) throw new Error('Failed to create room');
    return room;
  }

  async getRoomById(id: string): Promise<ChatRoom | null> {
    const row = await new Promise<any>((resolve, reject) => {
      this.db.get('SELECT * FROM chat_rooms WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    return row ? this.mapRoom(row) : null;
  }

  async getPublicRooms(limit: number = 50): Promise<ChatRoom[]> {
    const rows = await this.query('SELECT * FROM chat_rooms WHERE is_public = 1 LIMIT ?', [limit]);
    return rows.map((row: any) => this.mapRoom(row));
  }

  // Message methods
  async createMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<Message> {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.run(`
      INSERT INTO messages (id, room_id, user_id, content, original_language, message_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, messageData.roomId, messageData.userId, messageData.content, messageData.originalLanguage, messageData.messageType, now, now]);

    const message = await this.getMessageById(id);
    if (!message) throw new Error('Failed to create message');
    return message;
  }

  async getMessageById(id: string): Promise<Message | null> {
    const row = await new Promise<any>((resolve, reject) => {
      this.db.get(`
        SELECT m.*, u.username, u.display_name
        FROM messages m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    return row ? this.mapMessage(row) : null;
  }

  async getRoomMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const rows = await this.query(`
      SELECT m.*, u.username, u.display_name, u.preferred_language
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [roomId, limit, offset]);

    return rows.map((row: any) => ({
      ...this.mapMessage(row),
      user: {
        id: row.user_id,
        username: row.username,
        displayName: row.display_name,
        preferredLanguage: row.preferred_language
      }
    }));
  }

  // Participant methods
  async addParticipant(roomId: string, userId: string, role: string = 'member'): Promise<RoomParticipant> {
    const id = `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.run(`
      INSERT INTO room_participants (id, room_id, user_id, role, joined_at)
      VALUES (?, ?, ?, ?, ?)
    `, [id, roomId, userId, role, now]);

    const row = await new Promise<any>((resolve, reject) => {
      this.db.get('SELECT * FROM room_participants WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    return this.mapParticipant(row);
  }

  async getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
    const rows = await this.query('SELECT * FROM room_participants WHERE room_id = ?', [roomId]);
    return rows.map((row: any) => this.mapParticipant(row));
  }

  async removeParticipant(roomId: string, userId: string): Promise<void> {
    await this.run('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?', [roomId, userId]);
  }

  async getMessagesByRoom(roomId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    return this.getRoomMessages(roomId, limit, offset);
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    const rows = await this.query(`
      SELECT cr.* FROM chat_rooms cr
      JOIN room_participants rp ON cr.id = rp.room_id
      WHERE rp.user_id = ?
    `, [userId]);
    return rows.map((row: any) => this.mapRoom(row));
  }

  // Meeting methods
  async createMeeting(meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    const id = `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.run(`
      INSERT INTO meetings (id, title, description, is_public, max_participants, scheduled_at, language, created_by, created_at, updated_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      meetingData.title,
      meetingData.description,
      meetingData.isPublic ? 1 : 0,
      meetingData.maxParticipants,
      meetingData.scheduledAt ? meetingData.scheduledAt.toISOString() : null,
      meetingData.language,
      meetingData.createdBy,
      now,
      now,
      meetingData.status
    ]);

    const meeting = await this.getMeetingById(id);
    if (!meeting) throw new Error('Failed to create meeting');
    return meeting;
  }

  async getMeetingById(id: string): Promise<Meeting | null> {
    const row = await new Promise<any>((resolve, reject) => {
      this.db.get('SELECT * FROM meetings WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    return row ? this.mapMeeting(row) : null;
  }

  async getPublicMeetings(limit: number = 50): Promise<Meeting[]> {
    const rows = await this.query('SELECT * FROM meetings WHERE is_public = 1 AND status != ? LIMIT ?', ['ended', limit]);
    return rows.map((row: any) => this.mapMeeting(row));
  }

  async updateMeetingStatus(meetingId: string, status: 'scheduled' | 'active' | 'ended'): Promise<void> {
    const now = new Date().toISOString();
    await this.run('UPDATE meetings SET status = ?, updated_at = ? WHERE id = ?', [status, now, meetingId]);
  }

  // Meeting participant methods
  async addMeetingParticipant(meetingId: string, userId: string, role: string = 'participant'): Promise<MeetingParticipant> {
    const id = `mpart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.run(`
      INSERT INTO meeting_participants (id, meeting_id, user_id, role, joined_at, audio_enabled, video_enabled, screen_sharing)
      VALUES (?, ?, ?, ?, ?, 1, 1, 0)
    `, [id, meetingId, userId, role, now]);

    const row = await new Promise<any>((resolve, reject) => {
      this.db.get('SELECT * FROM meeting_participants WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    return this.mapMeetingParticipant(row);
  }

  async getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]> {
    const rows = await this.query('SELECT * FROM meeting_participants WHERE meeting_id = ? AND left_at IS NULL', [meetingId]);
    return rows.map((row: any) => this.mapMeetingParticipant(row));
  }

  async removeMeetingParticipant(meetingId: string, userId: string): Promise<void> {
    const now = new Date().toISOString();
    await this.run('UPDATE meeting_participants SET left_at = ? WHERE meeting_id = ? AND user_id = ? AND left_at IS NULL', [now, meetingId, userId]);
  }

  async updateParticipantMedia(meetingId: string, userId: string, updates: { audioEnabled?: boolean; videoEnabled?: boolean; screenSharing?: boolean }): Promise<void> {
    const setClauses = [];
    const values = [];

    if (updates.audioEnabled !== undefined) {
      setClauses.push('audio_enabled = ?');
      values.push(updates.audioEnabled ? 1 : 0);
    }
    if (updates.videoEnabled !== undefined) {
      setClauses.push('video_enabled = ?');
      values.push(updates.videoEnabled ? 1 : 0);
    }
    if (updates.screenSharing !== undefined) {
      setClauses.push('screen_sharing = ?');
      values.push(updates.screenSharing ? 1 : 0);
    }

    if (setClauses.length > 0) {
      values.push(meetingId, userId);
      await this.run(`UPDATE meeting_participants SET ${setClauses.join(', ')} WHERE meeting_id = ? AND user_id = ?`, values);
    }
  }

  // Audio transcription methods
  async createTranscription(transcriptionData: Omit<AudioTranscription, 'id'>): Promise<AudioTranscription> {
    const id = `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await this.run(`
      INSERT INTO audio_transcriptions (id, meeting_id, user_id, text, language, timestamp, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      transcriptionData.meetingId,
      transcriptionData.userId,
      transcriptionData.text,
      transcriptionData.language,
      transcriptionData.timestamp.toISOString(),
      transcriptionData.confidence
    ]);

    const row = await new Promise<any>((resolve, reject) => {
      this.db.get('SELECT * FROM audio_transcriptions WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    return this.mapTranscription(row);
  }

  async getMeetingTranscriptions(meetingId: string, limit: number = 100): Promise<AudioTranscription[]> {
    const rows = await this.query(`
      SELECT * FROM audio_transcriptions
      WHERE meeting_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `, [meetingId, limit]);
    return rows.map((row: any) => this.mapTranscription(row));
  }

  async getUserMeetings(userId: string): Promise<Meeting[]> {
    const rows = await this.query(`
      SELECT m.* FROM meetings m
      JOIN meeting_participants mp ON m.id = mp.meeting_id
      WHERE mp.user_id = ?
      ORDER BY m.created_at DESC
    `, [userId]);
    return rows.map((row: any) => this.mapMeeting(row));
  }

  // Helper methods to map database rows to TypeScript interfaces
  private mapUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      displayName: row.display_name,
      preferredLanguage: row.preferred_language,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapRoom(row: any): ChatRoom {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isPublic: Boolean(row.is_public),
      maxParticipants: row.max_participants,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapMessage(row: any): Message {
    return {
      id: row.id,
      roomId: row.room_id,
      userId: row.user_id,
      content: row.content,
      originalLanguage: row.original_language,
      messageType: row.message_type as 'text' | 'image' | 'audio',
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapParticipant(row: any): RoomParticipant {
    return {
      id: row.id,
      roomId: row.room_id,
      userId: row.user_id,
      joinedAt: new Date(row.joined_at),
      role: row.role as 'member' | 'moderator' | 'admin'
    };
  }

  private mapMeeting(row: any): Meeting {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      isPublic: Boolean(row.is_public),
      maxParticipants: row.max_participants,
      scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : undefined,
      language: row.language,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      status: row.status as 'scheduled' | 'active' | 'ended'
    };
  }

  private mapMeetingParticipant(row: any): MeetingParticipant {
    return {
      id: row.id,
      meetingId: row.meeting_id,
      userId: row.user_id,
      joinedAt: new Date(row.joined_at),
      leftAt: row.left_at ? new Date(row.left_at) : undefined,
      role: row.role as 'host' | 'moderator' | 'participant',
      audioEnabled: Boolean(row.audio_enabled),
      videoEnabled: Boolean(row.video_enabled),
      screenSharing: Boolean(row.screen_sharing)
    };
  }

  private mapTranscription(row: any): AudioTranscription {
    return {
      id: row.id,
      meetingId: row.meeting_id,
      userId: row.user_id,
      text: row.text,
      language: row.language,
      timestamp: new Date(row.timestamp),
      confidence: row.confidence
    };
  }
}