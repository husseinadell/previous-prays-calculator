import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getLogger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const log = getLogger(req.traceId);
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      log.warn('Authentication failed: No token provided');
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    req.userId = decoded.userId;

    log.info({ userId: decoded.userId }, 'User authenticated');
    next();
  } catch (error) {
    log.warn({ err: error }, 'Authentication failed: Invalid token');
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
