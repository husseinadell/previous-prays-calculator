import { PrismaClient } from '../../prisma/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger';

// Ensure environment variables are loaded
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  logger.error({
    error: 'DATABASE_URL environment variable is not set',
    hint: 'Please create a .env file with: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/previous_prays?schema=public"',
  });
  throw new Error(
    'DATABASE_URL environment variable is not set. Please create a .env file with: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/previous_prays?schema=public"'
  );
}

if (typeof DATABASE_URL !== 'string') {
  logger.error({ error: 'DATABASE_URL must be a string', type: typeof DATABASE_URL });
  throw new Error('DATABASE_URL must be a string');
}

logger.info('Database connection configured');

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
