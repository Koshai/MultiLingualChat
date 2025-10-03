import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthToken } from '../types';
import { DatabaseService } from '../services/database';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    console.log('🔐 Auth check - Headers:', {
      authorization: authHeader ? 'Bearer ...' : undefined,
      hasAuth: !!authHeader,
      startsWithBearer: authHeader?.startsWith('Bearer ')
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      res.status(401).json({ success: false, error: 'Authorization token required' });
      return;
    }

    const token = authHeader.substring(7);
    console.log('🎫 Token received, verifying with JWT...');

    // JWT verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as AuthToken;

    console.log('✅ Token verified for user:', decoded.username);
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Token expired' });
    } else {
      res.status(500).json({ success: false, error: 'Authentication error' });
    }
  }
};

// Middleware for optional authentication (doesn't fail if no token)
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as AuthToken;
      (req as any).user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication for optional middleware
    next();
  }
};

// Role-based middleware
export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    // This would need to be expanded based on your role system
    // For now, we'll implement basic role checking
    if (user.role && user.role !== requiredRole) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};