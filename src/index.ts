import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import goalRoutes from './routes/goal.routes';
import completedPrayersRoutes from './routes/completedPrayers.routes';
import { traceIdMiddleware } from './middleware/traceId.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trace ID middleware (must be before logger middleware)
app.use(traceIdMiddleware);

// Logger middleware
app.use(loggerMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/completed-prayers', completedPrayersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server is running');
});
