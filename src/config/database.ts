import { PrismaClient } from '../../prisma/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please create a .env file with: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/previous_prays?schema=public"'
  );
}

if (typeof DATABASE_URL !== 'string') {
  throw new Error('DATABASE_URL must be a string');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;

