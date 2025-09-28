import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { DatabaseService } from './services/database';
import { RedisService } from './services/redis';
import { MeetingController } from './controllers/meeting-controller';
import { SocketHandler } from './handlers/socket-handler';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';

// Only load .env file if not running in Docker (POSTGRES_URL is set via Docker)
if (!process.env.POSTGRES_URL) {
  dotenv.config();
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize services
    await DatabaseService.getInstance().connect();
    await RedisService.getInstance().connect();

    // Middleware
    app.use(helmet());
    app.use(cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true
    }));
    app.use(morgan('combined'));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'meeting-service'
      });
    });

    // API routes
    const meetingController = new MeetingController();
    app.use('/api/auth', authMiddleware);
    app.use('/api/meetings', meetingController.router);

    // Socket.IO handling
    const socketHandler = new SocketHandler(io);
    socketHandler.initialize();

    // Error handling
    app.use(errorHandler);

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Meeting service running on port ${PORT}`);
      console.log(`📡 WebRTC signaling server ready`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        DatabaseService.getInstance().disconnect();
        RedisService.getInstance().disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();