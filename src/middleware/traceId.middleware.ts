import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const traceIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Get trace ID from header or generate new one
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();

  // Attach trace ID to request
  req.traceId = traceId;

  // Add trace ID to response header
  res.setHeader('X-Trace-Id', traceId);

  next();
};
