import { Request, Response, NextFunction } from 'express';
import { validateRegister, validateLogin } from './auth.validation';
import { validateProfileCreate, validateProfileUpdate } from './profile.validation';

export { validateRegister, validateLogin };

export const validateProfileCreateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validateProfileCreate(req.body);
  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }
  next();
};

export const validateProfileUpdateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validateProfileUpdate(req.body);
  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }
  next();
};
