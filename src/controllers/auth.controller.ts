import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { getLogger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const jwtOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN,
} as SignOptions;

export const register = async (req: Request, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const { email, password, name } = req.body;
    log.info({ email, hasName: !!name }, 'Registration attempt');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      log.warn({ email }, 'Registration failed: user already exists');
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, jwtOptions);

    log.info({ userId: user.id, email: user.email }, 'User registered successfully');

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    log.error({ err: error }, 'Registration error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const { email, password } = req.body;
    log.info({ email }, 'Login attempt');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      log.warn({ email }, 'Login failed: user not found');
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      log.warn({ email, userId: user.id }, 'Login failed: invalid password');
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, jwtOptions);

    log.info({ userId: user.id, email: user.email }, 'Login successful');

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    log.error({ err: error }, 'Login error');
    res.status(500).json({ error: 'Internal server error' });
  }
};
