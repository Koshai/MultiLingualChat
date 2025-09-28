// Simple in-memory Redis replacement for local development
export class MemoryRedisService {
  private static instance: MemoryRedisService;
  private cache: Map<string, any> = new Map();
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  private constructor() {
    console.log('📱 Using in-memory Redis alternative');
  }

  static getInstance(): MemoryRedisService {
    if (!MemoryRedisService.instance) {
      MemoryRedisService.instance = new MemoryRedisService();
    }
    return MemoryRedisService.instance;
  }

  async connect(): Promise<void> {
    console.log('✅ Memory Redis connected');
  }

  async disconnect(): Promise<void> {
    this.cache.clear();
    this.rateLimits.clear();
    console.log('✅ Memory Redis disconnected');
  }

  // Cache operations
  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: ttl ? Date.now() + (ttl * 1000) : null
    });
  }

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  // Session management
  async setSession(sessionId: string, userData: any, ttl: number = 3600): Promise<void> {
    await this.set(`session:${sessionId}`, userData, ttl);
  }

  async getSession(sessionId: string): Promise<any> {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Message caching
  async cacheMessage(messageId: string, message: any, ttl: number = 3600): Promise<void> {
    await this.set(`message:${messageId}`, message, ttl);
  }

  async getCachedMessage(messageId: string): Promise<any> {
    return await this.get(`message:${messageId}`);
  }

  // Rate limiting
  async checkRateLimit(userId: string, action: string, maxRequests: number, windowMs: number): Promise<boolean> {
    const key = `rate_limit:${userId}:${action}`;
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit || now > limit.resetTime) {
      // Reset or create new limit
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    limit.count++;
    return true;
  }

  // User presence tracking
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    await this.set(`user_online:${userId}`, { socketId, lastSeen: Date.now() }, 300); // 5 min TTL
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.del(`user_online:${userId}`);
  }

  async getUserOnlineStatus(userId: string): Promise<boolean> {
    const status = await this.get(`user_online:${userId}`);
    return !!status;
  }

  // Room management
  async addUserToRoom(roomId: string, userId: string): Promise<void> {
    const key = `room_users:${roomId}`;
    const users = await this.get(key) || [];
    if (!users.includes(userId)) {
      users.push(userId);
      await this.set(key, users, 3600);
    }
  }

  async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    const key = `room_users:${roomId}`;
    const users = await this.get(key) || [];
    const filtered = users.filter((id: string) => id !== userId);
    await this.set(key, filtered, 3600);
  }

  async getRoomUsers(roomId: string): Promise<string[]> {
    return await this.get(`room_users:${roomId}`) || [];
  }

  // Socket user management (compatible with original Redis service)
  async setSocketUser(socketId: string, user: any): Promise<void> {
    const key = `socket:${socketId}`;
    await this.set(key, JSON.stringify(user), 3600); // 1 hour TTL
  }

  async getSocketUser(socketId: string): Promise<any | null> {
    const key = `socket:${socketId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async removeSocketUser(socketId: string): Promise<void> {
    await this.del(`socket:${socketId}`);
  }

  // Typing indicators
  async setTyping(roomId: string, userId: string): Promise<void> {
    const key = `typing:${roomId}:${userId}`;
    await this.set(key, '1', 5); // 5 seconds TTL
  }

  async getTypingUsers(roomId: string): Promise<string[]> {
    const typingUsers: string[] = [];
    for (const [key] of this.cache) {
      if (key.startsWith(`typing:${roomId}:`)) {
        const userId = key.split(':')[2];
        if (userId) typingUsers.push(userId);
      }
    }
    return typingUsers;
  }

  // Translation caching
  async getCachedTranslation(messageId: string, targetLang: string): Promise<string | null> {
    const key = `translation:${messageId}:${targetLang}`;
    return await this.get(key);
  }

  async cacheTranslation(messageId: string, targetLang: string, translation: string): Promise<void> {
    const key = `translation:${messageId}:${targetLang}`;
    await this.set(key, translation, 86400); // 24 hours TTL
  }

  // User rooms management
  async getUserRooms(userId: string): Promise<string[]> {
    return await this.get(`user_rooms:${userId}`) || [];
  }

  async addUserToRoomList(userId: string, roomId: string): Promise<void> {
    const key = `user_rooms:${userId}`;
    const rooms = await this.get(key) || [];
    if (!rooms.includes(roomId)) {
      rooms.push(roomId);
      await this.set(key, rooms, 3600);
    }
  }

  async removeUserFromRoomList(userId: string, roomId: string): Promise<void> {
    const key = `user_rooms:${userId}`;
    const rooms = await this.get(key) || [];
    const filtered = rooms.filter((id: string) => id !== roomId);
    await this.set(key, filtered, 3600);
  }
}