import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { DatabaseService } from '../services/database';

export class AuthController {
  public router: Router;
  private db: DatabaseService;

  constructor() {
    this.router = Router();
    this.db = DatabaseService.getInstance();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log('📝 Register request:', req.body);

      const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        displayName: Joi.string().min(1).max(100).required(),
        preferredLanguage: Joi.string().length(2).default('en')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        console.error('❌ Validation error:', error.details[0].message);
        res.status(400).json({ success: false, error: error.details[0].message });
        return;
      }

      // Check if user already exists
      const existingUser = await this.db.getUserByUsername(value.username);
      if (existingUser) {
        res.status(400).json({ success: false, error: 'Username already exists' });
        return;
      }

      const existingEmail = await this.db.getUserByEmail(value.email);
      if (existingEmail) {
        res.status(400).json({ success: false, error: 'Email already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(value.password, 10);

      // Create user
      const user = await this.db.createUser({
        username: value.username,
        email: value.email,
        password: hashedPassword,
        displayName: value.displayName,
        preferredLanguage: value.preferredLanguage || 'en'
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      console.log('✅ User registered:', user.username);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            preferredLanguage: user.preferredLanguage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token
        }
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ success: false, error: 'Failed to register user' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔐 Login request:', req.body.username);

      const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        console.error('❌ Validation error:', error.details[0].message);
        res.status(400).json({ success: false, error: error.details[0].message });
        return;
      }

      // Get user by username (with password hash for verification)
      const user = await this.db.getUserByUsernameWithPassword(value.username);
      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }

      // Verify password
      if (!user.passwordHash) {
        console.error('❌ User has no password hash:', user.username);
        res.status(500).json({ success: false, error: 'Authentication configuration error' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(value.password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      console.log('✅ User logged in:', user.username);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            preferredLanguage: user.preferredLanguage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ success: false, error: 'Failed to login' });
    }
  }
}
